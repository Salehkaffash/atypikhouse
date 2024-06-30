'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const constraints = [
      'username_2', 'email_2', 'username_3', 'email_3', 'username_4', 'email_4',
      'username_5', 'email_5', 'username_6', 'email_6', 'username_7', 'email_7',
      'username_8', 'email_8', 'username_9', 'email_9', 'username_10', 'email_10',
      'username_11', 'email_11', 'username_12', 'email_12', 'username_13', 'email_13',
      'username_14', 'email_14', 'username_15', 'email_15', 'username_16', 'email_16',
      'username_17', 'email_17', 'username_18', 'email_18', 'username_19', 'email_19',
      'username_20', 'email_20', 'username_21', 'email_21', 'username_22', 'email_22',
      'username_23', 'email_23', 'username_24', 'email_24', 'username_25', 'email_25',
      'username_26', 'email_26', 'username_27', 'email_27', 'username_28', 'email_28',
      'username_29', 'email_29', 'username_30', 'email_30', 'username_31', 'email_31',
      'username_32'
    ];

    for (const constraint of constraints) {
      await queryInterface.removeConstraint('Users', constraint);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Ajouter les contraintes de retour si nécessaire
  }
};

