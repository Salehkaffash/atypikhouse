// routes/destinations.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const multer = require('multer');
const path = require('path');
const { ensureAuthenticated } = require('../middleware/auth');

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Route pour afficher le formulaire d'ajout de destination
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add-destination');
});

// Route pour gérer l'ajout de destination
router.post('/add', ensureAuthenticated, upload.single('image'), async (req, res) => {
  const { name, location, description, categories } = req.body;
  const image = req.file ? req.file.path : null;
  try {
    await db.Destination.create({
      name,
      location,
      description,
      categories,
      image
    });
    res.redirect('/destinations');
  } catch (err) {
    console.error('Error adding destination:', err);
    res.status(500).send('Server Error');
  }
});

// Route pour afficher toutes les destinations
router.get('/', async (req, res) => {
  try {
    const destinations = await db.Destination.findAll();
    res.render('destinations', { destinations });
  } catch (err) {
    console.error('Error fetching destinations:', err);
    res.status(500).send('Server Error');
  }
});

// Route pour afficher une destination individuelle avec les hébergements associés
router.get('/:id', async (req, res) => {
  try {
    const destination = await db.Destination.findByPk(req.params.id, {
      include: [{ model: db.Housing, include: [{ model: db.Theme }, { model: db.Photo, as: 'Photos' }] }] // Spécifiez l'alias ici
    });
    if (!destination) {
      return res.status(404).send('Destination not found');
    }
    const themes = await db.Theme.findAll();
    res.render('single-destination', { destination, themes });
  } catch (err) {
    console.error('Error fetching destination:', err);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
