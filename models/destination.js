module.exports = (sequelize, DataTypes) => {
  const Destination = sequelize.define('Destination', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    categories: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  Destination.associate = function(models) {
    Destination.hasMany(models.Housing, { foreignKey: 'destinationId' }); // Correction: foreignKey 'destinationId' should be lowercase
  };

  return Destination;
};
