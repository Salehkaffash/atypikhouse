'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Themes', [
      { name: 'Yourte', description: 'Séjour Traditionnel', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tiny House', description: 'Séjour Écologique', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Chalet', description: 'Séjour Familial', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bulle', description: 'Séjour Glamping', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Maison Hobbit', description: 'Séjour Fantastique', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Themes', null, {});
  }
};

