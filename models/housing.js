module.exports = (sequelize, DataTypes) => {
  const Housing = sequelize.define('Housing', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    themeId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Themes',
        key: 'id'
      }
    },
    destinationId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Destinations',
        key: 'id'
      }
    },
    ownerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Owners',
        key: 'id'
      }
    }
  }, {
    timestamps: true  // This will add createdAt and updatedAt fields
  });

  Housing.associate = function(models) {
    Housing.belongsTo(models.Theme, { foreignKey: 'themeId' });
    Housing.belongsTo(models.Destination, { foreignKey: 'destinationId' });
    Housing.belongsTo(models.Owner, { foreignKey: 'ownerId', as: 'Owner' }); // Ajout d'un alias pour l'association
    Housing.hasMany(models.Photo, { foreignKey: 'housingId', as: 'Photos' });
    Housing.hasMany(models.Comment, { foreignKey: 'HousingId' });
    Housing.hasMany(models.Booking, { foreignKey: 'HousingId', as: 'bookings' });
    Housing.belongsToMany(models.Equipment, { through: 'HousingEquipments', foreignKey: 'HousingId', as: 'Equipments' });
  };

  return Housing;
};
