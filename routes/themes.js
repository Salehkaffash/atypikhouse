// routes/themes.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

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

// Route pour afficher les hébergements par thème avec tri
router.get('/:id/hebergements', async (req, res) => {
  try {
    const themeId = req.params.id;
    const sortBy = req.query.sortBy;

    let order;
    switch (sortBy) {
      case 'recent':
        order = [['createdAt', 'DESC']];
        break;
      case 'popular':
        order = [[db.sequelize.literal('(SELECT AVG(rating) FROM Comments WHERE Comments.HousingId = Housing.id)'), 'DESC']];
        break;
      case 'expensive':
        order = [['price', 'DESC']];
        break;
      case 'cheap':
        order = [['price', 'ASC']];
        break;
      default:
        order = [['createdAt', 'DESC']];
    }

    const housings = await db.Housing.findAll({
      where: { themeId: themeId },
      order: order,
      include: [db.Comment] // Inclure les commentaires pour le tri par popularité
    });

    const theme = await db.Theme.findByPk(themeId);

    res.render('theme-hebergements', { housings, theme });
  } catch (err) {
    console.error('Error fetching housings by theme:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
