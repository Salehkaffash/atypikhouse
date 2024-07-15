const express = require('express');
const router = express.Router();
const { ensureAdmin } = require('../middleware/auth');
const db = require('../models');
const upload = require('../config/multer');

// Fonction pour récupérer les thèmes et les destinations
const getCommonData = async () => {
  const themes = await db.Theme.findAll();
  const destinations = await db.Destination.findAll();
  return { themes, destinations };
};

// Tableau de bord de l'administrateur
router.get('/', ensureAdmin, async (req, res) => {
  const { themes, destinations } = await getCommonData();
  res.render('admin/dashboard', { title: 'Tableau de bord', partial: 'dashboard', themes, destinations });
});

// Pages -----------------------------------------------

// Route pour afficher toutes les pages
router.get('/pages', ensureAdmin, async (req, res) => {
  try {
    const pages = await db.Page.findAll();
    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { title: 'Gestion des Pages', partial: 'pages', pages, themes, destinations });
  } catch (err) {
    console.error('Error fetching pages:', err);
    res.status(500).send('Error fetching pages');
  }
});

// Route pour afficher le formulaire de création d'une nouvelle page
router.get('/pages/new', ensureAdmin, async (req, res) => {
  const { themes, destinations } = await getCommonData();
  res.render('admin/dashboard', { title: 'Ajouter une nouvelle page', partial: 'newPage', themes, destinations });
});

// Route pour créer une nouvelle page
router.post('/pages/new', ensureAdmin, async (req, res) => {
  try {
    await db.Page.create(req.body);
    res.redirect('/admin/pages');
  } catch (err) {
    console.error('Error creating page:', err);
    res.status(500).send('Error creating page');
  }
});

// Route pour afficher le formulaire d'édition d'une page
router.get('/pages/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const page = await db.Page.findByPk(req.params.id);
    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { title: 'Modifier la page', partial: 'editPage', page, themes, destinations });
  } catch (err) {
    console.error('Error fetching page:', err);
    res.status(500).send('Error fetching page');
  }
});

router.post('/pages/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const page = await db.Page.findByPk(req.params.id);
    await page.update(req.body);
    res.redirect('/admin/pages');
  } catch (err) {
    console.error('Error updating page:', err);
    res.status(500).send('Error updating page');
  }
});

// Hébergements -----------------------------------------------

// Route pour afficher tous les hébergements
router.get('/hebergements', ensureAdmin, async (req, res) => {
  try {
    const hebergements = await db.Housing.findAll();
    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { title: 'Gestion des Hébergements', partial: 'hebergements', hebergements, themes, destinations });
  } catch (err) {
    console.error('Error fetching hebergements:', err);
    res.status(500).send('Error fetching hebergements');
  }
});

// Route pour afficher le formulaire de création d'un nouvel hébergement
router.get('/hebergements/new', ensureAdmin, async (req, res) => {
  try {
    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { title: 'Ajouter un nouvel hébergement', partial: 'newHebergement', themes, destinations });
  } catch (err) {
    console.error('Error fetching themes and destinations:', err);
    res.status(500).send('Error fetching themes and destinations');
  }
});

// Route pour créer un nouvel hébergement
router.post('/hebergements/new', ensureAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, type, price, capacity, themeId, destinationId } = req.body;
    const image = req.file ? req.file.path : null;

    await db.Housing.create({
      title,
      description,
      type,
      price,
      capacity,
      image,
      themeId,
      destinationId,
      ownerId: req.user.id  // Assurez-vous que l'utilisateur est propriétaire
    });

    res.redirect('/admin/hebergements');
  } catch (err) {
    console.error('Error creating hebergement:', err);
    res.status(500).send('Error creating hebergement');
  }
});

// Route pour afficher le formulaire d'édition d'un hébergement
router.get('/hebergements/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const hebergement = await db.Housing.findByPk(req.params.id);
    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { title: "Modifier l'hébergement", partial: 'editHebergement', hebergement, themes, destinations });
  } catch (err) {
    console.error('Error fetching hebergement:', err);
    res.status(500).send('Error fetching hebergement');
  }
});

// Route pour mettre à jour un hébergement
router.post('/hebergements/edit/:id', ensureAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, type, price, capacity, themeId, destinationId } = req.body;
    const image = req.file ? req.file.path : req.body.existingImage;

    const hebergement = await db.Housing.findByPk(req.params.id);
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

// Destination -----------------------------------------------

// Route pour afficher toutes les destinations
router.get('/destinations', ensureAdmin, async (req, res) => {
  try {
    const destinations = await db.Destination.findAll();
    const { themes } = await getCommonData();
    res.render('admin/dashboard', { title: 'Gestion des Destinations', partial: 'destination', destinations, themes });
  } catch (err) {
    console.error('Error fetching destinations:', err);
    res.status(500).send('Error fetching destinations');
  }
});

// Route pour afficher le formulaire de création d'une nouvelle destination
router.get('/destinations/new', ensureAdmin, async (req, res) => {
  const { themes, destinations } = await getCommonData();
  res.render('admin/dashboard', { title: 'Ajouter une nouvelle destination', partial: 'newDestination', themes, destinations });
});

// Route pour créer une nouvelle destination
router.post('/destinations/new', ensureAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, location, description, categories } = req.body;
    const image = req.file ? req.file.path : null;

    await db.Destination.create({
      name,
      location,
      description,
      categories,
      image
    });

    res.redirect('/admin/destinations');
  } catch (err) {
    console.error('Error creating destination:', err);
    res.status(500).send('Error creating destination');
  }
});

// Route pour afficher le formulaire d'édition d'une destination
router.get('/destinations/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const destination = await db.Destination.findByPk(req.params.id);
    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { title: 'Modifier la destination', partial: 'editDestination', destination, themes, destinations });
  } catch (err) {
    console.error('Error fetching destination:', err);
    res.status(500).send('Error fetching destination');
  }
});

// Route pour mettre à jour une destination
router.post('/destinations/edit/:id', ensureAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, location, description, categories } = req.body;
    const image = req.file ? req.file.path : req.body.existingImage;

    const destination = await db.Destination.findByPk(req.params.id);
    await destination.update({
      name,
      location,
      description,
      categories,
      image
    });

    res.redirect('/admin/destinations');
  } catch (err) {
    console.error('Error updating destination:', err);
    res.status(500).send('Error updating destination');
  }
});

// Route pour supprimer une destination
router.post('/destinations/delete/:id', ensureAdmin, async (req, res) => {
  try {
    const destination = await db.Destination.findByPk(req.params.id);
    await destination.destroy();
    res.redirect('/admin/destinations');
  } catch (err) {
    console.error('Error deleting destination:', err);
    res.status(500).send('Error deleting destination');
  }
});

// Blog -----------------------------------------------

// Route pour afficher tous les articles de blog
router.get('/blog', ensureAdmin, async (req, res) => {
  try {
    const articles = await db.Blog.findAll();
    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { title: 'Gestion des Articles de Blog', partial: 'blog', articles, themes, destinations });
  } catch (err) {
    console.error('Error fetching blog articles:', err);
    res.status(500).send('Error fetching blog articles');
  }
});

// Route pour afficher le formulaire de création d'un nouvel article
router.get('/blog/new', ensureAdmin, async (req, res) => {
  const { themes, destinations } = await getCommonData();
  res.render('admin/dashboard', { title: 'Ajouter un nouvel article', partial: 'newArticle', themes, destinations });
});

// Route pour créer un nouvel article
router.post('/blog/new', ensureAdmin, async (req, res) => {
  try {
    await db.Blog.create(req.body);
    res.redirect('/admin/blog');
  } catch (err) {
    console.error('Error creating blog article:', err);
    res.status(500).send('Error creating blog article');
  }
});

// Route pour afficher le formulaire d'édition d'un article
router.get('/blog/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const article = await db.Blog.findByPk(req.params.id);
    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { title: 'Modifier l\'article', partial: 'editArticle', article, themes, destinations });
  } catch (err) {
    console.error('Error fetching blog article:', err);
    res.status(500).send('Error fetching blog article');
  }
});

router.post('/blog/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const article = await db.Blog.findByPk(req.params.id);
    await article.update(req.body);
    res.redirect('/admin/blog');
  } catch (err) {
    console.error('Error updating blog article:', err);
    res.status(500).send('Error updating blog article');
  }
});

// Avis -----------------------------------------------

// Route pour afficher tous les avis
router.get('/avis', ensureAdmin, async (req, res) => {
  try {
    const avis = await db.Comment.findAll();
    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { title: 'Gestion des Avis', partial: 'avis', avis, themes, destinations });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).send('Error fetching comments');
  }
});

// Route pour afficher le formulaire de création d'un nouvel avis
router.get('/avis/new', ensureAdmin, async (req, res) => {
  const { themes, destinations } = await getCommonData();
  res.render('admin/dashboard', { title: 'Ajouter un nouvel avis', partial: 'newAvis', themes, destinations });
});

// Route pour créer un nouvel avis
router.post('/avis/new', ensureAdmin, async (req, res) => {
  try {
    await db.Comment.create(req.body);
    res.redirect('/admin/avis');
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).send('Error creating comment');
  }
});

// Route pour afficher le formulaire d'édition d'un avis
router.get('/avis/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const avis = await db.Comment.findByPk(req.params.id);
    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { title: 'Modifier l\'avis', partial: 'editAvis', avis, themes, destinations });
  } catch (err) {
    console.error('Error fetching comment:', err);
    res.status(500).send('Error fetching comment');
  }
});

// Route pour mettre à jour un avis
router.post('/avis/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const avis = await db.Comment.findByPk(req.params.id);
    await avis.update(req.body);
    res.redirect('/admin/avis');
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).send('Error updating comment');
  }
});

// Utilisateurs -----------------------------------------------

// Route pour afficher tous les utilisateurs
router.get('/users', ensureAdmin, async (req, res) => {
  try {
    const users = await db.User.findAll();
    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { title: 'Gestion des Utilisateurs', partial: 'users', users, themes, destinations });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Error fetching users');
  }
});

// Route pour afficher le formulaire de création d'un nouvel utilisateur
router.get('/users/new', ensureAdmin, async (req, res) => {
  const { themes, destinations } = await getCommonData();
  res.render('admin/dashboard', { title: 'Ajouter un nouvel utilisateur', partial: 'newUser', themes, destinations });
});

// Route pour créer un nouvel utilisateur
router.post('/users/new', ensureAdmin, async (req, res) => {
  try {
    await db.User.create(req.body);
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).send('Error creating user');
  }
});

// Route pour afficher le formulaire d'édition d'un utilisateur
router.get('/users/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { title: 'Modifier l\'utilisateur', partial: 'editUser', user, themes, destinations });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Error fetching user');
  }
});

// Route pour mettre à jour un utilisateur
router.post('/users/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    await user.update(req.body);
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).send('Error updating user');
  }
});

module.exports = router;
