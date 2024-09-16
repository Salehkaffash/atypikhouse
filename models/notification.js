module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      UserId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users', // Assurez-vous que vous avez une table Users
          key: 'id',
        },
      },
    });
  
    Notification.associate = (models) => {
      Notification.belongsTo(models.User, { foreignKey: 'UserId' });
    };
  
    return Notification;
  };
  