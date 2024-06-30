const express = require('express');
const router = express.Router();
const db = require('../models');
const multer = require('multer');
const path = require('path');
const { ensureAuthenticated } = require('../middleware/auth');
const { Housing, Comment, User, Theme, Owner } = require('../models');

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Route pour afficher tous les hébergements
router.get('/', async (req, res) => {
  try {
    const housings = await Housing.findAll();
    res.render('hebergements', { housings });
  } catch (err) {
    console.error('Error fetching housings:', err);
    res.status(500).send('Server Error');
  }
});

// Route pour afficher le formulaire de création d'un hébergement
router.get('/add', ensureAuthenticated, async (req, res) => {
  try {
    const themes = await Theme.findAll();
    res.render('add-hebergement', { themes });
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).send('Server Error');
  }
});

// Route pour ajouter un nouvel hébergement
router.post('/add', ensureAuthenticated, upload.single('image'), async (req, res) => {
  try {
    console.log(req.body);  // Ajouter cette ligne pour voir les données envoyées
    console.log(req.file);  // Ajouter cette ligne pour voir les informations sur le fichier uploadé
    const { title, description, type, price, capacity, themeId } = req.body;
    const image = req.file ? req.file.path : null;

    // Trouver ou créer le propriétaire
    let owner = await Owner.findOne({ where: { UserId: req.user.id } });
    if (!owner) {
      owner = await Owner.create({ UserId: req.user.id, name: req.user.username, contact: req.user.email });
    }

    const housing = await Housing.create({
      title,
      description,
      type,
      price,
      capacity,
      image,
      themeId,
      OwnerId: owner.id,
    });

    res.redirect(`/hebergements/${housing.id}`);
  } catch (error) {
    console.error('Error adding housing:', error);
    res.status(500).send('Server Error');
  }
});

// Route pour afficher un hébergement spécifique avec ses commentaires
router.get('/:id', async (req, res) => {
  try {
    const housing = await Housing.findByPk(req.params.id, {
      include: [{
        model: Comment,
        include: [User]
      }]
    });
    if (!housing) {
      return res.status(404).send('Housing not found');
    }
    res.render('single-hebergement', { housing });
  } catch (err) {
    console.error('Error fetching housing:', err);
    res.status(500).send('Server Error');
  }
});

// Route pour afficher les hébergements par thème
router.get('/theme/:themeId', async (req, res) => {
  try {
    const housings = await Housing.findAll({
      where: { themeId: req.params.themeId },
      include: [{ model: Theme, as: 'theme' }],
    });
    res.render('hebergements', { housings });
  } catch (error) {
    console.error('Error fetching housings by theme:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
