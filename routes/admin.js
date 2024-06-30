// routes/admin.js
const express = require('express');
const router = express.Router();
const { ensureAdmin } = require('../middleware/auth'); // Middleware pour s'assurer que l'utilisateur est un admin

router.get('/', ensureAdmin, (req, res) => {
  res.render('admin/dashboard', { user: req.user });
});

module.exports = router;
