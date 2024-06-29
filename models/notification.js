module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    });
  
    return Notification;
  };
  