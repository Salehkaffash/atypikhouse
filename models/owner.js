module.exports = (sequelize, DataTypes) => {
  const Owner = sequelize.define('Owner', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  });

  Owner.associate = function(models) {
    Owner.belongsTo(models.User, { foreignKey: 'UserId' });
    Owner.hasMany(models.Housing, { foreignKey: 'ownerId' }); // Correction: foreignKey 'ownerId' should be lowercase
  };

  return Owner;
};
