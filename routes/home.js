// routes/home.js
const express = require('express');
const router = express.Router();

// Route pour la page d'accueil
router.get('/', (req, res) => {
  res.render('index');
});

module.exports = router;
