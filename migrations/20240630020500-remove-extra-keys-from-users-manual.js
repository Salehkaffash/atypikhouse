'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Users', 'users_username_unique');
    await queryInterface.removeConstraint('Users', 'users_email_unique');
    // Ajoutez d'autres contraintes à supprimer ici si nécessaire
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Users', {
      fields: ['username'],
      type: 'unique',
      name: 'users_username_unique'
    });
    await queryInterface.addConstraint('Users', {
      fields: ['email'],
      type: 'unique',
      name: 'users_email_unique'
    });
    // Ajoutez d'autres contraintes à restaurer ici si nécessaire
  }
};

