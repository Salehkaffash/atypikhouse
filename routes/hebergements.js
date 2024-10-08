// routes/hebergements.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const { Housing, Comment, User, Theme, Owner, Destination, Equipment, Photo, Message } = require('../models');
const upload = require('../config/multer');

// Route pour afficher tous les hébergements
router.get('/', async (req, res) => {
  try {
    const { sortBy, theme } = req.query;
    let queryOptions = {
      include: [
        {
          model: Theme
        },
        {
          model: Photo,
          as: 'Photos'
        }
      ]
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
    const simpleEquipments = await Equipment.findAll({ where: { type: 'simple' } });
    const premiumEquipments = await Equipment.findAll({ where: { type: 'premium' } });
    res.render('add-hebergement', { themes, destinations, simpleEquipments, premiumEquipments });
  } catch (error) {
    console.error('Error fetching themes and destinations:', error);
    res.status(500).send('Server Error');
  }
});

// Route pour ajouter un nouvel hébergement
router.post('/add', ensureAuthenticated, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, type, price, capacity, themeId, destinationId, simpleEquipments = [], premiumEquipments = [], newSimpleEquipment, newPremiumEquipment } = req.body;

    // Si simpleEquipments ou premiumEquipments ne sont pas des tableaux, convertissez-les en tableaux
    const selectedSimpleEquipments = Array.isArray(simpleEquipments) ? simpleEquipments : [simpleEquipments];
    const selectedPremiumEquipments = Array.isArray(premiumEquipments) ? premiumEquipments : [premiumEquipments];

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
      themeId,
      destinationId,
      ownerId: owner.id,
    });

    if (req.files) {
      const photos = req.files.map(file => ({
        path: file.path,
        housingId: housing.id
      }));
      await Photo.bulkCreate(photos);
    }

    // Ajout de nouveaux équipements simples
    if (newSimpleEquipment && newSimpleEquipment.trim() !== "") {
      const simpleEquipment = await Equipment.create({
        name: newSimpleEquipment.trim(),
        type: "simple",
      });
      selectedSimpleEquipments.push(simpleEquipment.id);
    }

    // Ajout de nouveaux équipements premium
    if (newPremiumEquipment && newPremiumEquipment.trim() !== "") {
      const premiumEquipment = await Equipment.create({
        name: newPremiumEquipment.trim(),
        type: "premium",
      });
      selectedPremiumEquipments.push(premiumEquipment.id);
    }
    
    const allEquipments = [].concat(simpleEquipments, premiumEquipments);
    
    if (allEquipments.length > 0) {
      await housing.addEquipment(allEquipments);
    }

    res.redirect('/hebergements');
  } catch (error) {
    console.error('Error adding housing:', error);
    res.status(500).send('Server Error');
  }
});

// Route pour afficher un hébergement spécifique
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching housing with ID:', req.params.id);
    
    const housing = await Housing.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [{ model: User }] },
        { model: Destination },
        { model: Theme },
        { 
          model: Owner,
          as: 'Owner',  // Spécification de l'alias
          include: [
            {
              model: User,
              as: 'User',  // Spécification de l'alias ici aussi
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        },
        { model: Photo, as: 'Photos' },
        { model: Equipment, as: 'Equipments' }
      ]
    });

    if (!housing) {
      return res.status(404).send('Housing not found');
    }

    // Passez l'ID du propriétaire à la vue en utilisant l'alias 'Owner.User'
    const receiver = housing.Owner ? housing.Owner.User : null;

    res.render('single-hebergement', { housing, receiver, user: req.user });
  } catch (err) {
    console.error('Error fetching housing:', err);
    res.status(500).send('Server Error');
  }
});

// Nouvelle route pour gérer l'envoi du message depuis un hébergement
router.post('/sendMessage', async (req, res) => {
  try {
    const { name, email, phone, content, housingId } = req.body;

    // Créer un nouveau message lié à un hébergement spécifique
    await Message.create({
      name,
      email,
      phone,
      content,
      housingId: housingId // Associe le message à l'hébergement
    });

    // Rediriger l'utilisateur vers la page de l'hébergement après l'envoi du message
    res.redirect(`/hebergements/${housingId}`);
  } catch (err) {
    console.error('Erreur lors de l\'envoi du message:', err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message.' });
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
router.post('/hebergements/edit/:id', ensureAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, type, price, capacity, themeId, destinationId, simpleEquipments, premiumEquipments } = req.body;

    const hebergement = await Housing.findByPk(req.params.id);
    await hebergement.update({
      title,
      description,
      type,
      price,
      capacity,
      themeId,
      destinationId
    });

    if (req.files) {
      const photos = req.files.map(file => ({
        path: file.path,
        housingId: hebergement.id
      }));
      await Photo.bulkCreate(photos);
    }

    if (simpleEquipments) {
      await hebergement.setEquipments(simpleEquipments);
    }

    if (premiumEquipments) {
      await hebergement.setEquipments(premiumEquipments);
    }

    res.redirect('/admin/hebergements');
  } catch (err) {
    console.error('Error updating hebergement:', err);
    res.status(500).send('Error updating hebergement');
  }
});


module.exports = router;
