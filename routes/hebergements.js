const express = require('express');
const router = express.Router();
const db = require('../models');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const { Housing, Comment, User, Theme, Owner, Destination } = require('../models');
const upload = require('../config/multer');

// Route pour afficher tous les hébergements
router.get('/', async (req, res) => {
  try {
    const { sortBy, theme } = req.query;
    let queryOptions = {
      include: [Theme]
    };

    if (theme) {
      queryOptions.where = { themeId: theme };
    }

    if (sortBy) {
      switch (sortBy) {
        case 'recent':
          queryOptions.order = [['createdAt', 'DESC']];
          break;
        case 'popular':
          queryOptions.order = [['rating', 'DESC']];
          break;
        case 'expensive':
          queryOptions.order = [['price', 'DESC']];
          break;
        case 'cheap':
          queryOptions.order = [['price', 'ASC']];
          break;
        default:
          break;
      }
    }

    const housings = await Housing.findAll(queryOptions);
    const themes = await Theme.findAll();
    res.render('hebergements', { housings, themes, user: req.user });
  } catch (err) {
    console.error('Error fetching housings:', err);
    res.status(500).send('Server Error');
  }
});

// Route pour afficher le formulaire d'ajout d'un nouvel hébergement
router.get('/add', ensureAuthenticated, async (req, res) => {
  try {
    const themes = await Theme.findAll();
    const destinations = await Destination.findAll();
    res.render('add-hebergement', { themes, destinations });
  } catch (error) {
    console.error('Error fetching themes and destinations:', error);
    res.status(500).send('Server Error');
  }
});

// Route pour ajouter un nouvel hébergement
router.post('/add', ensureAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { title, description, type, price, capacity, themeId, destinationId } = req.body;
    const image = req.file ? req.file.path : null;

    // Vérifiez si l'utilisateur est un propriétaire
    let owner = await Owner.findOne({ where: { UserId: req.user.id } });
    if (!owner) {
      owner = await Owner.create({ UserId: req.user.id, name: req.user.username, contact: req.user.email });
    }

    // Créez le nouvel hébergement
    await Housing.create({
      title,
      description,
      type,
      price,
      capacity,
      image,
      themeId,
      destinationId,
      ownerId: owner.id,
    });

    res.redirect('/hebergements');
  } catch (error) {
    console.error('Error adding housing:', error);
    res.status(500).send('Server Error');
  }
});

// Route pour afficher un hébergement spécifique
router.get('/:id', async (req, res) => {
  try {
    const housing = await Housing.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [User] },
        { model: Destination },
        { model: Theme },
        { model: Owner }
      ]
    });
    if (!housing) {
      return res.status(404).send('Housing not found');
    }
    res.render('single-hebergement', { housing, user: req.user });
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

// Route pour mettre à jour un hébergement
router.post('/hebergements/edit/:id', ensureAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, type, price, capacity, themeId, destinationId } = req.body;
    const image = req.file ? req.file.path : req.body.existingImage;

    const hebergement = await Housing.findByPk(req.params.id);
    await hebergement.update({
      title,
      description,
      type,
      price,
      capacity,
      image,
      themeId,
      destinationId
    });

    res.redirect('/admin/hebergements');
  } catch (err) {
    console.error('Error updating hebergement:', err);
    res.status(500).send('Error updating hebergement');
  }
});

module.exports = router;
