// models/housing.js
module.exports = (sequelize, DataTypes) => {
  const Housing = sequelize.define('Housing', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
    themeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Housing.associate = function(models) {
    Housing.belongsTo(models.Owner, { foreignKey: 'OwnerId' });
    Housing.belongsTo(models.Theme, { foreignKey: 'themeId' });
    Housing.hasMany(models.Comment, { foreignKey: 'HousingId' });
  };

  return Housing;
};
