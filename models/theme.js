// models/theme.js
module.exports = (sequelize, DataTypes) => {
  const Theme = sequelize.define('Theme', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Theme.associate = (models) => {
    Theme.hasMany(models.Housing, { foreignKey: 'themeId' });
  };

  return Theme;
};
