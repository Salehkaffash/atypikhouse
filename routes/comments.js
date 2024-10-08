// routes/comments.js
const express = require('express');
const router = express.Router();
const { Comment, Housing, Booking, User, Notification } = require('../models'); // Ajoutez Notification ici
const upload = require('../config/multer');
const { ensureAuthenticated } = require('../middleware/auth');

// Ajouter un commentaire
router.post('/:housingId/comments', ensureAuthenticated, upload.single('photo'), async (req, res) => {
  try {
    const { content, rating } = req.body;
    const { housingId } = req.params;

    // Vérifier que l'utilisateur a réservé l'hébergement
    const booking = await Booking.findOne({
      where: { HousingId: housingId, UserId: req.user.id }
    });

    if (!booking) {
      return res.status(403).send('Vous devez réserver cet hébergement pour laisser un commentaire.');
    }

    const housing = await Housing.findByPk(housingId);

    if (!housing) {
      return res.status(404).send('Hébergement non trouvé.');
    }

    await Comment.create({
      content,
      rating,
      photo: req.file ? req.file.path : null,
      UserId: req.user.id,
      HousingId: housingId
    });

    // Notifier l'hébergeur
    await Notification.create({
      type: 'comment',
      content: `Nouvel avis laissé pour l'hébergement ${housing.title} par ${req.user.firstName}`,
      UserId: housing.ownerId // Notifier l'hébergeur
    });

    // Notifier également l'administrateur
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (admin) {
      await Notification.create({
        type: 'comment',
        content: `Nouvel avis pour l'hébergement ${housing.title}`,
        UserId: admin.id // Notifier l'administrateur
      });
    }

    res.redirect(`/hebergements/${housingId}`);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).send('Server Error');
  }
});



// Modifier un commentaire
router.post('/:housingId/comments/:id/edit', ensureAuthenticated, upload.single('photo'), async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (comment.UserId !== req.user.id) {
      return res.status(403).send('Vous ne pouvez modifier que vos propres commentaires.');
    }

    const { content, rating } = req.body;
    if (req.file) {
      comment.photo = req.file.path;
    }
    comment.content = content;
    comment.rating = rating;
    await comment.save();

    res.redirect(`/hebergements/${req.params.housingId}`);
  } catch (err) {
    console.error('Error editing comment:', err);
    res.status(500).send('Server Error');
  }
});

// Supprimer un commentaire
router.post('/:housingId/comments/:id/delete', ensureAuthenticated, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (comment.UserId !== req.user.id) {
      return res.status(403).send('Vous ne pouvez supprimer que vos propres commentaires.');
    }
    await comment.destroy();
    res.redirect(`/hebergements/${req.params.housingId}`);
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
