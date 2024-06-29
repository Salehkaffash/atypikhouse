// routes/profile.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { ensureAuthenticated } = require('../middleware/auth');
const db = require('../models');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.get('/profile', ensureAuthenticated, async (req, res) => {
  res.render('profile', { user: req.user });
});

router.post('/profile', ensureAuthenticated, upload.single('photo'), async (req, res) => {
  const { firstName, lastName, email, phone, address } = req.body;
  const photo = req.file ? req.file.path : req.user.photo;
  try {
    await db.User.update(
      { firstName, lastName, email, phone, address, photo },
      { where: { id: req.user.id } }
    );
    res.redirect('/profile');
  } catch (e) {
    console.log(e);
    res.redirect('/profile');
  }
});

module.exports = router;
