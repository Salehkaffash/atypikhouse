// routes/bookings.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const { ensureAuthenticated } = require('../middleware/auth');

// Route pour afficher les réservations de l'utilisateur
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const bookings = await db.Booking.findAll({
      where: { UserId: req.user.id },
      include: [db.Housing]
    });
    res.render('bookings', { bookings });
  } catch (err) {
    console.error('Error fetching bookings:', err);
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
