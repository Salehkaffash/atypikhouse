// routes/bookings.js
const express = require("express");
const router = express.Router();
const db = require("../models");
const { ensureAuthenticated } = require("../middleware/auth");
const { Op } = require("sequelize");
const moment = require("moment");
const paypal = require("@paypal/checkout-server-sdk");

// Initialisation du client PayPal
function paypalClient() {
  return new paypal.core.PayPalHttpClient(
    new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    )
  );
}

// Route pour afficher les réservations de l'utilisateur
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const bookings = await db.Booking.findAll({
      where: { UserId: req.user.id },
      include: [
        {
          model: db.Housing,
          as: "housing",
          include: [
            {
              model: db.Photo,
              as: "Photos",
            },
          ],
        },
      ],
    });

    // Trier les réservations par statut
    const ongoingBookings = bookings.filter(
      (booking) =>
        booking.status === "pending" &&
        moment(booking.endDate).isAfter(moment())
    );
    const pastBookings = bookings.filter(
      (booking) =>
        booking.status === "pending" &&
        moment(booking.endDate).isBefore(moment())
    );
    const cancelledBookings = bookings.filter(
      (booking) => booking.status === "cancelled"
    );

    res.render("bookings", {
      ongoingBookings,
      pastBookings,
      cancelledBookings,
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).send("Server Error");
  }
});

// Route pour annuler une réservation
router.post("/cancel/:id", ensureAuthenticated, async (req, res) => {
  try {
    const booking = await db.Booking.findOne({
      where: {
        id: req.params.id,
        UserId: req.user.id,
      },
    });

    if (!booking) {
      return res.status(404).send("Reservation not found");
    }

    if (moment(booking.startDate).isBefore(moment())) {
      return res
        .status(400)
        .send("Cannot cancel a reservation that has already started or passed");
    }

    booking.status = "cancelled";
    await booking.save();

    res.redirect("/bookings");
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res.status(500).send("Server Error");
  }
});

// Route pour afficher le formulaire d'ajout de réservation
router.get("/add", ensureAuthenticated, async (req, res) => {
  try {
    const housings = await db.Housing.findAll();
    res.render("add-booking", { housings });
  } catch (err) {
    console.error("Error fetching housings:", err);
    res.status(500).send("Server Error");
  }
});

// Route pour gérer l'ajout de réservation
router.post("/add", ensureAuthenticated, async (req, res) => {
  const { housingId, startDate, endDate } = req.body;

  // Validation des dates
  if (moment(startDate).isAfter(endDate)) {
    return res
      .status(400)
      .send("La date de fin doit être après la date de début");
  }

  try {
    // Récupération du logement dans la base de données
    const housing = await db.Housing.findByPk(housingId);
    if (!housing) {
      return res.status(404).send("Housing not found");
    }

    // Vérification de la disponibilité de la période sélectionnée
    const existingBooking = await db.Booking.findOne({
      where: {
        HousingId: housingId,
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            endDate: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            [Op.and]: [
              {
                startDate: {
                  [Op.lte]: startDate,
                },
              },
              {
                endDate: {
                  [Op.gte]: endDate,
                },
              },
            ],
          },
        ],
      },
    });

    if (existingBooking) {
      return res.status(409).send("Cette période est déjà réservée.");
    }

    // Calcul du nombre de jours entre la date de début et la date de fin
    const start = moment(startDate);
    const end = moment(endDate);
    const numberOfDays = end.diff(start, "days") + 1; // +1 pour inclure la date de fin

    // Calcul du prix total
    const totalPrice = (housing.price * numberOfDays).toFixed(2);

    // Création de la requête de commande PayPal
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: totalPrice,
          },
        },
      ],
      application_context: {
        return_url: "http://localhost:3000/bookings/confirm",
        cancel_url: "http://localhost:3000/bookings/cancel",
      },
    });

    try {
      // Exécution de la commande PayPal
      const order = await paypalClient().execute(request);

      // Enregistrement des données de réservation dans la session
      req.session.bookingData = {
        UserId: req.user.id,
        HousingId: housingId,
        startDate,
        endDate,
        status: "pending",
        orderId: order.result.id,
        totalPrice, // Ajouter le prix total pour la réservation
      };

      // Récupérer l'admin
      const admin = await db.User.findOne({ where: { role: "admin" } });
      if (admin) {
        await db.Notification.create({
          type: "booking",
          content: `Nouvelle réservation pour l'hébergement ${housing.title}`,
          UserId: admin.id, // Utilisez l'ID de l'admin récupéré
        });
      }

      // Notification de l'hébergeur
      await db.Notification.create({
        type: "booking",
        content: `Nouvelle réservation pour l'hébergement ${housing.title} du ${startDate} au ${endDate}`,
        UserId: housing.ownerId, // Envoyer la notification à l'hébergeur
      });

      // Récupération de l'URL d'approbation PayPal
      const approvalUrl = order.result.links.find(
        (link) => link.rel === "approve"
      ).href;

      res.redirect(approvalUrl);
    } catch (err) {
      console.error("Erreur lors de la création de la commande PayPal:", err);
      res.status(500).send("Erreur serveur lors de la création de la commande PayPal");
    }
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).send("Server Error");
  }
});

router.get("/confirm", ensureAuthenticated, async (req, res) => {
  const { token } = req.query;

  if (!req.session.bookingData) {
    return res.status(400).send("Aucune réservation en cours");
  }

  try {
    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});
    const capture = await paypalClient().execute(request);

    if (capture.result.status === "COMPLETED") {
      const bookingData = req.session.bookingData;
      await db.Booking.create(bookingData);

      req.session.bookingData = null;
      res.redirect("/bookings");
    } else {
      res.status(400).send("Payment not completed");
    }
  } catch (err) {
    console.error("Error capturing payment:", err);
    res.status(500).send("Server Error");
  }
});

router.get("/cancel", ensureAuthenticated, (req, res) => {
  req.session.bookingData = null;
  res.redirect("/bookings");
});

module.exports = router;
