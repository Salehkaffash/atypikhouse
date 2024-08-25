// routes/admin.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdminOrHebergeur, ensureAdmin } = require('../middleware/auth');
const db = require('../models');
const { Op } = require('sequelize');  // Assurez-vous d'importer Op ici
const upload = require('../config/multer');


// Fonction pour récupérer les thèmes et les destinations
const getCommonData = async () => {
  const themes = await db.Theme.findAll();
  const destinations = await db.Destination.findAll();
  return { themes, destinations };
};

// Tableau de bord de l'administrateur ou hébergeur
router.get('/', ensureAdminOrHebergeur, async (req, res) => {
  const { themes, destinations } = await getCommonData();
  res.render('admin/dashboard', { title: 'Tableau de bord', partial: 'dashboard', themes, destinations });
});


// Thèmes -----------------------------------------------

// Route pour afficher tous les thèmes
router.get('/themes', ensureAdmin, async (req, res) => {
  try {
    const themes = await db.Theme.findAll();
    const { destinations } = await getCommonData();
    res.render('admin/dashboard', { title: 'Gestion des Thèmes', partial: 'theme', themes, destinations });
  } catch (err) {
    console.error('Error fetching themes:', err);
    res.status(500).send('Error fetching themes');
  }
});

// Route pour afficher le formulaire de création d'un nouveau thème
router.get('/themes/new', ensureAdmin, async (req, res) => {
  const { themes, destinations } = await getCommonData();
  res.render('admin/dashboard', { title: 'Ajouter un nouveau thème', partial: 'newTheme', themes, destinations });
});

// Route pour créer un nouveau thème
router.post('/themes/new', ensureAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, subtitle, description } = req.body;
    const image = req.file ? req.file.path : null;
    await db.Theme.create({
      name,
      subtitle,
      description,
      image
    });
    res.redirect('/admin/themes');
  } catch (err) {
    console.error('Error creating theme:', err);
    res.status(500).send('Error creating theme');
  }
});

// Route pour afficher le formulaire d'édition d'un thème
router.get('/themes/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const theme = await db.Theme.findByPk(req.params.id);
    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { title: 'Modifier le thème', partial: 'editTheme', theme, themes, destinations });
  } catch (err) {
    console.error('Error fetching theme:', err);
    res.status(500).send('Error fetching theme');
  }
});

// Route pour mettre à jour un thème
router.post('/themes/edit/:id', ensureAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, subtitle, description } = req.body;
    const image = req.file ? req.file.path : req.body.existingImage;

    const theme = await db.Theme.findByPk(req.params.id);
    await theme.update({
      name,
      subtitle,
      description,
      image
    });

    res.redirect('/admin/themes');
  } catch (err) {
    console.error('Error updating theme:', err);
    res.status(500).send('Error updating theme');
  }
});

// Route pour supprimer un thème
router.post('/themes/delete/:id', ensureAdmin, async (req, res) => {
  try {
    const theme = await db.Theme.findByPk(req.params.id);
    await theme.destroy();
    res.redirect('/admin/themes');
  } catch (err) {
    console.error('Error deleting theme:', err);
    res.status(500).send('Error deleting theme');
  }
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
router.get('/hebergements', ensureAdminOrHebergeur, async (req, res) => {
  try {
    let hebergements;

    if (req.user.role === 'admin') {
      // Si l'utilisateur est un admin, il peut voir tous les hébergements
      hebergements = await db.Housing.findAll({
        include: [
          { model: db.Photo, as: 'Photos' },
          { model: db.Equipment },
          { model: db.Theme },
          { model: db.Destination }
        ]
      });
    } else if (req.user.role === 'hebergeur') {
      // Si l'utilisateur est un hébergeur, il ne peut voir que ses propres hébergements
      const owner = await db.Owner.findOne({ where: { UserId: req.user.id } });
      if (!owner) {
        return res.status(403).send('Accès refusé');
      }

      hebergements = await db.Housing.findAll({
        where: { ownerId: owner.id },
        include: [
          { model: db.Photo, as: 'Photos' },
          { model: db.Equipment },
          { model: db.Theme },
          { model: db.Destination }
        ]
      });
    }

    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { title: 'Gestion des Hébergements', partial: 'hebergements', hebergements, themes, destinations });
  } catch (err) {
    console.error('Error fetching hebergements:', err);
    res.status(500).send('Error fetching hebergements');
  }
});


// Route pour afficher le formulaire de création d'un nouvel hébergement
router.get('/hebergements/new', ensureAdminOrHebergeur, async (req, res) => {
  try {
    const { themes, destinations } = await getCommonData();
    const simpleEquipments = await db.Equipment.findAll({ where: { type: 'simple' } });
    const premiumEquipments = await db.Equipment.findAll({ where: { type: 'premium' } });
    
    res.render('admin/dashboard', { 
      title: 'Ajouter un nouvel hébergement', 
      partial: 'newHebergement', 
      themes, 
      destinations,
      simpleEquipments,
      premiumEquipments
    });
  } catch (err) {
    console.error('Error fetching themes, destinations, or equipments:', err);
    res.status(500).send('Server Error');
  }
});

// Route pour créer un nouvel hébergement
router.post('/hebergements/new', ensureAdminOrHebergeur, upload.array('images', 10), async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { title, description, type, price, capacity, themeId, destinationId, simpleEquipments = [], premiumEquipments = [] } = req.body;

    const allEquipments = [].concat(simpleEquipments, premiumEquipments).map(Number);

    const owner = await db.Owner.findOne({ where: { UserId: req.user.id } });

    const housing = await db.Housing.create({
      title,
      description,
      type,
      price,
      capacity,
      themeId,
      destinationId,
      ownerId: owner.id
    }, { transaction });

    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => ({
        path: file.path,
        housingId: housing.id
      }));
      await db.Photo.bulkCreate(images, { transaction });
    }

    if (allEquipments.length > 0) {
      await housing.setEquipments(allEquipments, { transaction });
    }

    await transaction.commit();
    res.redirect('/admin/hebergements');
  } catch (err) {
    await transaction.rollback();
    console.error('Error creating hebergement:', err.message);
    res.status(500).send('Error creating hebergement');
  }
});


// Route pour afficher le formulaire d'édition d'un hébergement
router.get('/hebergements/edit/:id', ensureAdminOrHebergeur, async (req, res) => {
  try {
    const hebergement = await db.Housing.findByPk(req.params.id, {
      include: [
        { model: db.Photo, as: 'Photos' },
        { model: db.Equipment, as: 'Equipments' }
      ]
    });
    const { themes, destinations } = await getCommonData();
    const simpleEquipments = await db.Equipment.findAll({ where: { type: 'simple' } });
    const premiumEquipments = await db.Equipment.findAll({ where: { type: 'premium' } });

    if (!hebergement) {
      return res.status(404).send('Hébergement non trouvé');
    }

    if (req.user.role === 'hebergeur') {
      const owner = await db.Owner.findOne({ where: { UserId: req.user.id } });
      if (!owner || hebergement.ownerId !== owner.id) {
        return res.status(403).send('Accès refusé');
      }
    }
    
    res.render('admin/dashboard', { 
      title: "Modifier l'hébergement", 
      partial: 'editHebergement', 
      hebergement, 
      themes, 
      destinations,
      simpleEquipments,
      premiumEquipments
    });
  } catch (err) {
    console.error('Error fetching hebergement, themes, destinations, or equipments:', err);
    res.status(500).send('Server Error');
  }
});

// Route pour mettre à jour un hébergement
router.post('/hebergements/edit/:id', ensureAdminOrHebergeur, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, type, price, capacity, themeId, destinationId, simpleEquipments = [], premiumEquipments = [] } = req.body;

    const hebergement = await db.Housing.findByPk(req.params.id);

    if (req.user.role === 'hebergeur') {
      const owner = await db.Owner.findOne({ where: { UserId: req.user.id } });
      if (!owner || hebergement.ownerId !== owner.id) {
        return res.status(403).send('Accès refusé');
      }
    }

    await hebergement.update({
      title,
      description,
      type,
      price,
      capacity,
      themeId,
      destinationId
    });

    if (req.files.length > 0) {
      const images = req.files.map(file => ({
        path: file.path,
        housingId: hebergement.id
      }));
      await db.Photo.bulkCreate(images);
    }

    const allEquipments = [...simpleEquipments, ...premiumEquipments];
    await hebergement.setEquipments(allEquipments);

    res.redirect('/admin/hebergements');
  } catch (err) {
    console.error('Error updating hebergement:', err);
    res.status(500).send('Error updating hebergement');
  }
});

// Route pour supprimer un hébergement
router.post('/hebergements/delete/:id', ensureAdminOrHebergeur, async (req, res) => {
  try {
    const hebergement = await db.Housing.findByPk(req.params.id);

    if (req.user.role === 'hebergeur') {
      const owner = await db.Owner.findOne({ where: { UserId: req.user.id } });
      if (!owner || hebergement.ownerId !== owner.id) {
        return res.status(403).send('Accès refusé');
      }
    }

    if (!hebergement) {
      req.flash('error', 'Hébergement non trouvé');
      return res.redirect('/admin/hebergements');
    }
    await hebergement.destroy();
    req.flash('success', 'Hébergement supprimé avec succès');
    res.redirect('/admin/hebergements');
  } catch (err) {
    console.error('Error deleting hebergement:', err.message);
    req.flash('error', 'Erreur lors de la suppression de l\'hébergement');
    res.status(500).redirect('/admin/hebergements');
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
    res.render('admin/dashboard', { title: 'Gestion des Articles de Blog', partial: 'blog', articles });
  } catch (err) {
    console.error('Error fetching blog articles:', err);
    res.status(500).send('Error fetching blog articles');
  }
});

// Route pour afficher le formulaire de création d'un nouvel article
router.get('/blog/new', ensureAdmin, (req, res) => {
  res.render('admin/dashboard', { title: 'Ajouter un nouvel article', partial: 'newArticle' });
});

// Route pour créer un nouvel article de blog
router.post('/blog/new', ensureAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, content, categories, seoTitle, seoDescription, publishedAt } = req.body;
    const url = req.body.url || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const image = req.file ? req.file.path : null;

    await db.Blog.create({
      title,
      url,
      content,
      image,
      categories,
      seoTitle,
      seoDescription,
      publishedAt
    });

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
    res.render('admin/dashboard', { title: 'Modifier l\'article', partial: 'editArticle', article });
  } catch (err) {
    console.error('Error fetching blog article:', err);
    res.status(500).send('Error fetching blog article');
  }
});

// Route pour mettre à jour un article de blog
router.post('/blog/edit/:id', ensureAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, content, categories, seoTitle, seoDescription, publishedAt } = req.body;
    const url = req.body.url || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const image = req.file ? req.file.path : req.body.existingImage;

    const article = await db.Blog.findByPk(req.params.id);
    await article.update({
      title,
      url,
      content,
      image,
      categories,
      seoTitle,
      seoDescription,
      publishedAt
    });

    res.redirect('/admin/blog');
  } catch (err) {
    console.error('Error updating blog article:', err);
    res.status(500).send('Error updating blog article');
  }
});

// Route pour supprimer un article de blog
router.post('/blog/delete/:id', ensureAdmin, async (req, res) => {
  try {
    const article = await db.Blog.findByPk(req.params.id);
    await article.destroy();
    res.redirect('/admin/blog');
  } catch (err) {
    console.error('Error deleting blog article:', err);
    res.status(500).send('Error deleting blog article');
  }
});



// Avis -----------------------------------------------

// Route pour afficher tous les avis
router.get('/avis', ensureAdminOrHebergeur, async (req, res) => {
  try {
    let avis;

    if (req.user.role === 'admin') {
      // L'admin peut voir tous les avis
      avis = await db.Comment.findAll({
        include: [
          { model: db.User, attributes: ['firstName', 'lastName'] },
          { model: db.Housing, attributes: ['title'] }
        ]
      });
    } else if (req.user.role === 'hebergeur') {
      // L'hébergeur ne voit que les avis sur ses propres hébergements
      const owner = await db.Owner.findOne({ where: { UserId: req.user.id } });
      if (!owner) {
        return res.status(403).send('Accès refusé');
      }

      avis = await db.Comment.findAll({
        include: [
          { model: db.User, attributes: ['firstName', 'lastName'] },
          { model: db.Housing, where: { ownerId: owner.id }, attributes: ['title'] }
        ]
      });
    }

    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { 
      title: 'Gestion des Avis', 
      partial: 'avis', 
      avis, 
      themes, 
      destinations,
      userRole: req.user.role // Passer le rôle de l'utilisateur à la vue
    });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).send('Error fetching comments');
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

// Route pour supprimer un avis
router.post('/avis/delete/:id', ensureAdmin, async (req, res) => {
  try {
    const avis = await db.Comment.findByPk(req.params.id);
    await avis.destroy();
    res.redirect('/admin/avis');
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).send('Error deleting comment');
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
    const { username, email, role, firstName, lastName, phone, address } = req.body;
    const user = await db.User.findByPk(req.params.id);

    // Vérifier si le rôle change à 'hebergeur'
    if (role === 'hebergeur' && user.role !== 'hebergeur') {
      const existingOwner = await db.Owner.findOne({ where: { UserId: user.id } });
      if (!existingOwner) {
        await db.Owner.create({
          name: username,
          contact: email,
          UserId: user.id
        });
      }
    }

    await user.update({
      username,
      email,
      role,
      firstName,
      lastName,
      phone,
      address
    });

    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).send('Error updating user');
  }
});


// Messages -----------------------------------------------

// Route pour afficher les messages de contact
router.get('/messages', ensureAdminOrHebergeur, async (req, res) => {
  try {
    let messages;

    if (req.user.role === 'admin') {
      // L'admin voit tous les messages
      messages = await db.Message.findAll({
        include: [{ model: db.Housing }]
      });
    } else if (req.user.role === 'hebergeur') {
      // L'hébergeur ne voit que les messages liés à ses hébergements
      const owner = await db.Owner.findOne({ where: { UserId: req.user.id } });
      if (!owner) {
        return res.status(403).send('Accès refusé');
      }

      messages = await db.Message.findAll({
        include: [{ model: db.Housing, where: { ownerId: owner.id } }]
      });
    }

    const { themes, destinations } = await getCommonData();
    res.render('admin/dashboard', { title: 'Messages reçus', partial: 'messages', messages, themes, destinations });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).send('Error fetching messages');
  }
});

// Route pour afficher les détails d'un message
router.get('/messages/:id', ensureAdminOrHebergeur, async (req, res) => {
  try {
    const message = await db.Message.findByPk(req.params.id, {
      include: [{ model: db.Housing }]
    });

    if (!message) {
      return res.status(404).send('Message not found');
    }

    // Vérification de l'accès pour les hébergeurs
    if (req.user.role === 'hebergeur' && message.Housing && message.Housing.ownerId !== req.user.id) {
      return res.status(403).send('Accès refusé');
    }

    const themes = await db.Theme.findAll();
    const destinations = await db.Destination.findAll();
    res.render('admin/dashboard', { title: 'Détail du Message', partial: 'messageDetail', message, themes, destinations });
  } catch (err) {
    console.error('Error fetching message detail:', err);
    res.status(500).send('Server Error');
  }
});


// Route pour afficher les messages de l'hébergeur connecté
router.get('/hebergeur/messages', ensureAuthenticated, async (req, res) => {
  try {
      const owner = await db.Owner.findOne({ where: { UserId: req.user.id } });
      if (!owner) {
          return res.status(403).send('Accès refusé');
      }

      const messages = await db.Message.findAll({
          include: [{
              model: db.Housing,
              where: { ownerId: owner.id }
          }]
      });

      res.render('admin/dashboard', { title: 'Mes Messages', partial: 'messages', messages });
  } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).send('Error fetching messages');
  }
});


// Bookings -----------------------------------------------

// Route pour afficher les réservations
router.get('/bookings', ensureAdminOrHebergeur, async (req, res) => {
    try {
        let bookings;
        let housings;

        if (req.user.role === 'admin') {
            bookings = await db.Booking.findAll({
                include: [
                    { model: db.Housing, as: 'housing' },
                    { model: db.User, as: 'user' }
                ]
            });
            housings = await db.Housing.findAll();
        } else if (req.user.role === 'hebergeur') {
            const owner = await db.Owner.findOne({ where: { UserId: req.user.id } });
            if (!owner) {
                return res.status(403).send('Accès refusé');
            }

            bookings = await db.Booking.findAll({
                include: [
                    { model: db.Housing, as: 'housing', where: { ownerId: owner.id } },
                    { model: db.User, as: 'user' }
                ]
            });
            housings = await db.Housing.findAll({ where: { ownerId: owner.id } });
        }

        res.render('admin/dashboard', { 
            title: 'Gestion des Réservations',
            partial: 'bookings',
            bookings,
            housings
        });
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).send('Erreur lors de la récupération des réservations.');
    }
});

// Route pour modifier le statut d'une réservation
router.post('/bookings/:id/status', ensureAdminOrHebergeur, async (req, res) => {
    try {
        const booking = await db.Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).send('Réservation non trouvée');
        }

        booking.status = req.body.status;
        await booking.save();

        res.status(200).send('Statut mis à jour avec succès');
    } catch (err) {
        console.error('Error updating booking status:', err);
        res.status(500).send('Erreur lors de la mise à jour de la réservation.');
    }
});

// Route pour récupérer les événements de réservation d'un hébergement
router.get('/bookings/events/:housingId', ensureAdminOrHebergeur, async (req, res) => {
    try {
        const bookings = await db.Booking.findAll({
            where: { HousingId: req.params.housingId },
            attributes: ['id', 'startDate', 'endDate', 'status']
        });

        const events = bookings.map(booking => ({
            id: booking.id,
            title: booking.status === 'blocked' ? 'Bloqué' : 'Réservé',
            start: booking.startDate.toISOString().split('T')[0],
            end: booking.endDate.toISOString().split('T')[0],
            color: booking.status === 'blocked' ? 'gray' : 'red',
        }));

        res.status(200).json(events); // Renvoi des événements correctement formatés en JSON
    } catch (err) {
        console.error('Error fetching booking events:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour bloquer une date spécifique pour un hébergement
router.post('/bookings/block', ensureAdminOrHebergeur, async (req, res) => {
    try {
        const { startDate, endDate, housingId } = req.body;

        await db.Booking.create({
            startDate: startDate,
            endDate: endDate,
            status: 'blocked',
            HousingId: housingId
        });

        res.status(200).json({ message: 'Date bloquée avec succès' }); // Retourne un JSON au lieu d'un texte brut
    } catch (err) {
        console.error('Error blocking date:', err);
        res.status(500).json({ message: 'Erreur lors du blocage du jour' });
    }
});

// Route pour annuler une réservation spécifique pour un hébergement
router.post('/bookings/cancel', ensureAdminOrHebergeur, async (req, res) => {
  try {
      const { startDate, endDate, housingId } = req.body;

      console.log('Start Date:', startDate);
      console.log('End Date:', endDate);
      console.log('Housing ID:', housingId);

      const { Op } = require('sequelize');

      const booking = await db.Booking.findOne({
          where: {
              startDate: {
                  [Op.gte]: new Date(startDate).setHours(0, 0, 0, 0)
              },
              endDate: {
                  [Op.lte]: new Date(endDate).setHours(23, 59, 59, 999)
              },
              HousingId: housingId,
              status: { [Op.ne]: 'cancelled' }
          }
      });

      if (booking) {
          booking.status = 'cancelled';
          await booking.save();
          res.status(200).json({ message: 'Réservation annulée avec succès' });
      } else {
          console.log('Réservation non trouvée');
          res.status(404).json({ message: 'Réservation non trouvée' });
      }
  } catch (err) {
      console.error('Error cancelling booking:', err);
      res.status(500).json({ message: 'Erreur lors de l\'annulation de la réservation' });
  }
});


module.exports = router;