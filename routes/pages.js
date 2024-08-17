const express = require('express');
const router = express.Router();
const { Page } = require('../models');
const { ensureAdmin } = require('../middleware/auth');
const upload = require('../config/multer');

// Afficher toutes les pages
router.get('/', ensureAdmin, async (req, res) => {
    try {
      const pages = await Page.findAll();
      res.render('admin/pages/index', { pages });
    } catch (err) {
      console.error('Error fetching pages:', err);
      res.status(500).send('Server Error');
    }
});

// Afficher le formulaire de création de page
router.get('/add', ensureAdmin, (req, res) => {
  res.render('admin/pages/add');
});

// Ajouter une nouvelle page
router.post('/add', ensureAdmin, upload.single('photo'), async (req, res) => {
  try {
    const { title, url, content, seoTitle, seoDescription, status } = req.body;
    const photo = req.file ? req.file.filename : null;
    await Page.create({ title, url, content, seoTitle, seoDescription, status, photo });
    res.redirect('/admin/pages');
  } catch (err) {
    console.error('Error adding page:', err);
    res.status(500).send('Server Error');
  }
});

// Afficher le formulaire d'édition de page
router.get('/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);
    res.render('admin/pages/edit', { page });
  } catch (err) {
    console.error('Error fetching page:', err);
    res.status(500).send('Server Error');
  }
});

// Modifier une page
router.post('/edit/:id', ensureAdmin, upload.single('photo'), async (req, res) => {
  try {
    const { title, url, content, seoTitle, seoDescription, status } = req.body;
    const photo = req.file ? req.file.filename : req.body.existingPhoto;
    await Page.update({ title, url, content, seoTitle, seoDescription, status, photo }, {
      where: { id: req.params.id }
    });
    res.redirect('/admin/pages');
  } catch (err) {
    console.error('Error updating page:', err);
    res.status(500).send('Server Error');
  }
});

// Supprimer une page
router.post('/delete/:id', ensureAdmin, async (req, res) => {
  try {
    await Page.destroy({
      where: { id: req.params.id }
    });
    res.redirect('/admin/pages');
  } catch (err) {
    console.error('Error deleting page:', err);
    res.status(500).send('Server Error');
  }
});

// Route pour afficher une page spécifique par son URL
router.get('/:url', async (req, res) => {
  try {
    const page = await Page.findOne({ where: { url: req.params.url } });
    if (!page) {
      return res.status(404).send('Page non trouvée');
    }
    res.render('single-page', { page });
  } catch (err) {
    console.error('Error fetching page:', err);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
