const express = require('express');
const router = express.Router();
const db = require('../models');

// Route pour afficher la page de newsletter
router.get('/', (req, res) => {
    res.render('newsletter');
});


// Route pour s'inscrire à la newsletter
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.json({ success: false, message: "L'email est requis." });
    }

    const existingSubscriber = await db.Newsletter.findOne({ where: { email } });
    if (existingSubscriber) {
      return res.json({ success: false, message: 'Vous êtes déjà inscrit à notre Newsletter !' });
    }

    await db.Newsletter.create({ email });
    return res.json({ success: true, message: 'Merci, vous êtes bien inscrit à notre Newsletter !' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription à la newsletter :', error);
    return res.json({ success: false, message: 'Une erreur est survenue. Veuillez réessayer.' });
  }
});

module.exports = router;