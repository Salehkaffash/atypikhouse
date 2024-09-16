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
        let housing = null;

        // Vérifier si un housingId est fourni et récupérer l'hébergement correspondant
        if (housingId) {
            housing = await db.Housing.findByPk(housingId);
        }

        // Créer le message
        await db.Message.create({
            name,
            email,
            phone,
            content,
            housingId: housingId || null  // Ajoute l'ID de l'hébergement si disponible
        });

        // Notification à l'hébergeur si un hébergement est associé
        if (housing) {
            await db.Notification.create({
                type: 'message',
                content: `Nouveau message de ${name} pour l'hébergement ${housing.title}`,
                UserId: housing.ownerId // Notifier l'hébergeur
            });
        }

        // Définir ou récupérer l'ID de l'administrateur
        const admin = await db.User.findOne({ where: { role: 'admin' } }); // Récupérer un utilisateur admin
        if (admin) {
            await db.Notification.create({
                type: 'message',
                content: `Nouveau message de ${name} pour l'hébergement ${housing ? housing.title : 'N/A'}`,
                UserId: admin.id // Notifier l'administrateur
            });
        }

        res.redirect('/contact?success=true');
    } catch (err) {
        console.error('Error saving message or sending notification:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
