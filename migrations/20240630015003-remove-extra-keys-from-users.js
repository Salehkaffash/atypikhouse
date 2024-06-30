// migrations/YYYYMMDDHHMMSS-remove-extra-keys-from-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Supprimez certaines contraintes uniques ou clés étrangères qui ne sont pas nécessaires
    await queryInterface.removeConstraint('Users', 'users_username_key');
    await queryInterface.removeConstraint('Users', 'users_email_key');
  },

  down: async (queryInterface, Sequelize) => {
    // Ajoutez les contraintes uniques ou clés étrangères supprimées
    await queryInterface.addConstraint('Users', ['username'], {
      type: 'unique',
      name: 'users_username_key',
    });
    await queryInterface.addConstraint('Users', ['email'], {
      type: 'unique',
      name: 'users_email_key',
    });
  }
};

