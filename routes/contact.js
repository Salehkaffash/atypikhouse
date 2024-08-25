const express = require('express');
const router = express.Router();
const db = require('../models');

// Route pour afficher la page de contact
router.get('/', (req, res) => {
    res.render('contact', { success: req.query.success });
});

// Route pour gérer l'envoi du formulaire de contact
router.post('/send', async (req, res) => {
    const { name, email, phone, content, housingId } = req.body;
    try {
        await db.Message.create({
            name,
            email,
            phone,
            content,
            housingId: housingId || null  // Ajoute l'ID de l'hébergement si disponible
        });
        res.redirect('/contact?success=true');
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
