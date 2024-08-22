// routes/hebergements.js

const express = require('express');
const router = express.Router();
const db = require('../models');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const { Housing, Comment, User, Theme, Owner, Destination, Equipment, Photo } = require('../models');
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
          model: Photo,  // Inclusion des photos
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
    const { title, description, type, price, capacity, themeId, destinationId, simpleEquipments = [], premiumEquipments = [] } = req.body;

    console.log('Request body:', req.body); // Log the request body
    console.log('Uploaded files:', req.files); // Log the uploaded files

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

    console.log('Housing created:', housing); // Log the created housing

    if (req.files) {
      const photos = req.files.map(file => ({
        path: file.path,
        housingId: housing.id
      }));
      await Photo.bulkCreate(photos);
    }

    // Combiner les deux types d'équipements en une seule liste
    const allEquipments = [].concat(simpleEquipments, premiumEquipments);

    console.log('All equipments:', allEquipments); // Log all equipments

    // Log to check if the method exists
    console.log('Available methods on housing:', Object.keys(housing.__proto__));
    
    if (allEquipments.length > 0) {
      await housing.addEquipment(allEquipments); // Log before this line to ensure the method exists
      console.log('Equipments added to housing'); // Log after adding equipments
    }

    res.redirect('/hebergements');
  } catch (error) {
    console.error('Error adding housing:', error); // Log any error that occurs
    res.status(500).send('Server Error');
  }
});

// Route pour afficher un hébergement spécifique
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching housing with ID:', req.params.id); // Log the housing ID
    const housing = await Housing.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [User] },
        { model: Destination },
        { model: Theme },
        { model: Owner },
        { model: Photo },
        { model: Equipment }
      ]
    });
    console.log('Fetched housing:', housing); // Log the fetched housing
    if (!housing) {
      return res.status(404).send('Housing not found');
    }
    res.render('single-hebergement', { housing, user: req.user });
  } catch (err) {
    console.error('Error fetching housing:', err); // Log any error that occurs
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
