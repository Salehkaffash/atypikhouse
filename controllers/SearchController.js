const db = require('../models');
const { Op } = require('sequelize');

exports.searchHebergement = async (req, res) => {
  try {
    const { destination, category, startDate, endDate, guests } = req.query;

    const housings = await db.Housing.findAll({
      where: {
        destinationId: destination,
        themeId: category,
        capacity: {
          [Op.gte]: guests
        }
      },
      include: [
        {
          model: db.Booking,
          as: 'bookings', // Utilisez l'alias correct défini dans le modèle Housing
          where: {
            [Op.or]: [
              {
                startDate: {
                  [Op.between]: [startDate, endDate]
                }
              },
              {
                endDate: {
                  [Op.between]: [startDate, endDate]
                }
              },
              {
                startDate: {
                  [Op.lte]: startDate
                },
                endDate: {
                  [Op.gte]: endDate
                }
              }
            ]
          },
          required: false // Permet d'inclure les logements même sans réservation
        },
        { model: db.Photo, as: 'Photos' }
      ]
    });

    res.render('search-results', { housings });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).send('Server Error');
  }
};
