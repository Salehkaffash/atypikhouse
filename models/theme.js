module.exports = (sequelize, DataTypes) => {
  const Theme = sequelize.define('Theme', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Theme.associate = (models) => {
    Theme.hasMany(models.Housing, { foreignKey: 'themeId' });
  };

  return Theme;
};
