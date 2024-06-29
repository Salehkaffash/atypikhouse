module.exports = (sequelize, DataTypes) => {
    const Equipment = sequelize.define('Equipment', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });
  
    return Equipment;
  };
  