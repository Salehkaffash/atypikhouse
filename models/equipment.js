module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define('Equipment', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('simple', 'premium'),
      allowNull: false,
    },
  });

  Equipment.associate = function(models) {
    Equipment.belongsToMany(models.Housing, { through: 'HousingEquipments', foreignKey: 'EquipmentId', as: 'HousingsRelated' }); // Changez l'alias pour éviter le conflit
  };
  

  
  return Equipment;
};
