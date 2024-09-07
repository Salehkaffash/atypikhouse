// routes/home.js
const express = require('express');
const router = express.Router();
const db = require('../models');

// Route pour la page d'accueil
router.get('/', async (req, res) => {
  try {
    const destinations = await db.Destination.findAll();
    const themes = await db.Theme.findAll();

    // Récupérer les 8 derniers hébergements récents
    const recentHousings = await db.Housing.findAll({
      include: [
        { model: db.Photo, as: 'Photos' },
        { model: db.Theme }
      ],
      limit: 8,
      order: [['createdAt', 'DESC']]
    });

    // Récupérer les 9 derniers avis récents
    const recentComments = await db.Comment.findAll({
      include: [
        { model: db.User, attributes: ['firstName', 'lastName', 'photo'] },
        { model: db.Housing, attributes: ['title'] }
      ],
      limit: 9,
      order: [['createdAt', 'DESC']]
    });

    // Récupérer les 4 derniers articles de blog récents
    const recentArticles = await db.Blog.findAll({
      limit: 4,
      order: [['publishedAt', 'DESC']]
    });

    res.render('index', { destinations, themes, recentHousings, recentComments, recentArticles });
  } catch (err) {
    console.error('Error loading home page:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
