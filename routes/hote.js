const express = require('express');
const router = express.Router();

// Route pour la page "Devenez Hôte"
router.get('/', (req, res) => {
  res.render('hote');
});

module.exports = router;
