// routes/themes.js
const express = require('express');
const router = express.Router();
const db = require('../models');

// Route pour afficher les thèmes
router.get('/', async (req, res) => {
  try {
    const themes = await db.Theme.findAll();
    res.render('themes', { themes });
  } catch (err) {
    console.error('Error fetching themes:', err);
    res.status(500).send('Server Error');
  }
});

// Route pour afficher les hébergements par thème
router.get('/:id/hebergements', async (req, res) => {
  try {
    const themeId = req.params.id;
    const housings = await db.Housing.findAll({
      where: { themeId: themeId }
    });
    res.render('hebergements-par-theme', { housings });
  } catch (err) {
    console.error('Error fetching housings by theme:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
