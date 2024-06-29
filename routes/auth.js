// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const { User } = require('../models');
const upload = require('../config/multer');

// Route de login
router.get('/login', (req, res) => {
  res.render('login', { error: req.flash('error') });
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) => {
  if (req.session.returnTo) {
    const returnTo = req.session.returnTo;
    delete req.session.returnTo;
    res.redirect(returnTo);
  } else {
    res.redirect('/profile');
  }
});

// Route de registre
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

router.post('/register', upload.single('photo'), async (req, res) => {
  const { username, email, password, firstName, lastName, phone, address } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      address,
      photo: req.file ? req.file.path : null
    });
    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/login');
  } catch (error) {
    console.error('Error registering user:', error);
    res.render('register', { error: 'An error occurred during registration. Please try again.' });
  }
});

// Route de profile
router.get('/profile', async (req, res) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;  // Sauvegarder l'URL de la page d'origine
    return res.redirect('/login');
  }
  try {
    const user = await User.findByPk(req.user.id);
    res.render('profile', { user, error: req.flash('error'), success: req.flash('success') });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.render('profile', { user: null, error: 'An error occurred while fetching your profile. Please try again.', success: null });
  }
});

router.post('/profile', upload.single('photo'), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, password, confirmPassword } = req.body;

    if (password && password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/profile');
    }

    const user = await User.findByPk(req.user.id);

    if (req.file) {
      user.photo = req.file.path;
    }
    
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.phone = phone;
    user.address = address;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    req.flash('success', 'Profile updated successfully.');
    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating profile:', error);
    req.flash('error', 'An error occurred while updating your profile. Please try again.');
    res.redirect('/profile');
  }
});

router.post('/profile/delete', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    await user.destroy();
    req.logout(() => {
      req.flash('success', 'Your account has been deleted.');
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    req.flash('error', 'An error occurred while deleting your profile. Please try again.');
    res.redirect('/profile');
  }
});

// Route de déconnexion
router.get('/logout', (req, res) => {
  req.logout(() => {
    req.flash('success', 'You are logged out');
    res.redirect('/');
  });
});

module.exports = router;
