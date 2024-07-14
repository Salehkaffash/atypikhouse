// models/equipment.js
module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define('Equipment', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    HousingId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Housings',
        key: 'id'
      }
    }
  });

  Equipment.associate = function(models) {
    Equipment.belongsTo(models.Housing, { foreignKey: 'HousingId' });
  };

  return Equipment;
};
