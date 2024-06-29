const express = require('express');
const router = express.Router();

// Route pour la page du blog
router.get('/', (req, res) => {
  res.render('blog');
});

module.exports = router;
