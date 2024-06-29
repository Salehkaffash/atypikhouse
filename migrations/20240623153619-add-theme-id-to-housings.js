'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Housings', 'themeId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Themes', // Nom de la table référencée
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Housings', 'themeId');
  }
};

