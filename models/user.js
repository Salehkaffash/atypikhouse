module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true, // Commenter cette ligne pour supprimer l'index unique
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Garder l'email comme unique
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user',
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  User.associate = function(models) {
    User.hasMany(models.Booking, { foreignKey: 'UserId', as: 'bookings' });
    User.hasMany(models.Comment, { foreignKey: 'UserId', as: 'comments' });
  };

  return User;
};
