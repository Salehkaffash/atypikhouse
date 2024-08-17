const express = require('express');
const router = express.Router();
const db = require('../models');

// Route pour la page du blog
router.get('/', async (req, res) => {
  try {
    const articles = await db.Blog.findAll({ where: { publishedAt: { [db.Sequelize.Op.lte]: new Date() } } });
    res.render('blog', { articles });
  } catch (err) {
    console.error('Error fetching blog articles:', err);
    res.status(500).send('Error fetching blog articles');
  }
});

// Route pour afficher un seul article
router.get('/:url', async (req, res) => {
  try {
    const article = await db.Blog.findOne({ where: { url: req.params.url } });
    if (!article) {
      return res.status(404).send('Article not found');
    }
    res.render('single-article', { article });
  } catch (err) {
    console.error('Error fetching blog article:', err);
    res.status(500).send('Error fetching blog article');
  }
});

module.exports = router;