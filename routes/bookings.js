// routes/bookings.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const { ensureAuthenticated } = require('../middleware/auth');
const { Op } = require('sequelize');
const moment = require('moment');


// Route pour afficher les réservations de l'utilisateur
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const bookings = await db.Booking.findAll({
      where: { UserId: req.user.id },
      include: [
        {
          model: db.Housing,
          as: 'housing'
        }
      ]
    });

    // Trier les réservations par statut
    const ongoingBookings = bookings.filter(booking => booking.status === 'pending' && moment(booking.endDate).isAfter(moment()));
    const pastBookings = bookings.filter(booking => booking.status === 'pending' && moment(booking.endDate).isBefore(moment()));
    const cancelledBookings = bookings.filter(booking => booking.status === 'cancelled');

    res.render('bookings', { ongoingBookings, pastBookings, cancelledBookings });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).send('Server Error');
  }
});

// Route pour annuler une réservation
router.post('/cancel/:id', ensureAuthenticated, async (req, res) => {
  try {
    const booking = await db.Booking.findOne({
      where: {
        id: req.params.id,
        UserId: req.user.id
      }
    });

    if (!booking) {
      return res.status(404).send('Reservation not found');
    }

    if (moment(booking.startDate).isBefore(moment())) {
      return res.status(400).send('Cannot cancel a reservation that has already started or passed');
    }

    booking.status = 'cancelled';
    await booking.save();

    res.redirect('/bookings');
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).send('Server Error');
  }
});

// Route pour afficher le formulaire d'ajout de réservation
router.get('/add', ensureAuthenticated, async (req, res) => {
  try {
    const housings = await db.Housing.findAll();
    res.render('add-booking', { housings });
  } catch (err) {
    console.error('Error fetching housings:', err);
    res.status(500).send('Server Error');
  }
});

// Route pour gérer l'ajout de réservation
router.post('/add', ensureAuthenticated, async (req, res) => {
  const { housingId, startDate, endDate } = req.body;
  try {
    await db.Booking.create({
      UserId: req.user.id,
      HousingId: housingId,
      startDate,
      endDate,
      status: 'pending'
    });
    res.redirect('/bookings');
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
