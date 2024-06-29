module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    }
  });

  Booking.associate = models => {
    Booking.belongsTo(models.User, { foreignKey: 'UserId', as: 'user' });
    Booking.belongsTo(models.Housing, { foreignKey: 'HousingId', as: 'housing' });
  };

  return Booking;
};
