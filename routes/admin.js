const express = require('express');
const router = express.Router();
const { ensureAdmin } = require('../middleware/auth');
const { Page, Housing, Destination, Comment, User } = require('../models');

// Tableau de bord de l'administrateur
router.get('/', ensureAdmin, (req, res) => {
  res.render('admin/dashboard', { user: req.user, partial: 'pages' });
});

// Routes pour les pages
router.get('/pages', ensureAdmin, (req, res) => {
  res.render('admin/dashboard', { title: 'Gestion des Pages', partial: 'newPage' });
});

router.get('/pages/new', ensureAdmin, (req, res) => {
  res.render('admin/partials/newPage');
});

router.post('/pages/new', ensureAdmin, async (req, res) => {
  try {
    const { name, content } = req.body;
    await Page.create({ title: name, content, status: 'draft' });
    res.redirect('/admin/pages');
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Routes pour les hébergements
router.get('/hebergements', ensureAdmin, (req, res) => {
  res.render('admin/dashboard', { title: 'Gestion des Hébergements', partial: 'newHebergement' });
});

router.get('/hebergements/new', ensureAdmin, (req, res) => {
  res.render('admin/partials/newHebergement');
});

router.post('/hebergements/new', ensureAdmin, async (req, res) => {
  try {
    const { title, description, type, price, capacity, themeId, OwnerId, image } = req.body;
    await Housing.create({ title, description, type, price, capacity, themeId, OwnerId, image });
    res.redirect('/admin/hebergements');
  } catch (error) {
    console.error('Error creating hebergement:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Routes pour les destinations
router.get('/destinations', ensureAdmin, (req, res) => {
  res.render('admin/dashboard', { title: 'Gestion des Destinations', partial: 'newDestination' });
});

router.get('/destinations/new', ensureAdmin, (req, res) => {
  res.render('admin/partials/newDestination');
});

router.post('/destinations/new', ensureAdmin, async (req, res) => {
  try {
    const { name, location, description, categories, image } = req.body;
    await Destination.create({ name, location, description, categories, image });
    res.redirect('/admin/destinations');
  } catch (error) {
    console.error('Error creating destination:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Routes pour les avis
router.get('/avis', ensureAdmin, (req, res) => {
  res.render('admin/dashboard', { title: 'Gestion des Avis', partial: 'newAvis' });
});

router.get('/avis/new', ensureAdmin, (req, res) => {
  res.render('admin/partials/newAvis');
});

router.post('/avis/new', ensureAdmin, async (req, res) => {
  try {
    const { content, rating, HousingId, UserId } = req.body;
    await Comment.create({ content, rating, HousingId, UserId });
    res.redirect('/admin/avis');
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Routes pour les utilisateurs
router.get('/users', ensureAdmin, (req, res) => {
  res.render('admin/dashboard', { title: 'Gestion des Utilisateurs', partial: 'newUser' });
});

router.get('/users/new', ensureAdmin, (req, res) => {
  res.render('admin/partials/newUser');
});

router.post('/users/new', ensureAdmin, async (req, res) => {
  try {
    const { username, email, password, role, firstName, lastName, phone, address, photo } = req.body;
    await User.create({ username, email, password, role, firstName, lastName, phone, address, photo });
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
