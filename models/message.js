module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
      name: {
          type: DataTypes.STRING,
          allowNull: false
      },
      email: {
          type: DataTypes.STRING,
          allowNull: false
      },
      phone: {
          type: DataTypes.STRING,
          allowNull: true
      },
      content: {
          type: DataTypes.TEXT,
          allowNull: false
      },
      status: {
          type: DataTypes.STRING,
          defaultValue: 'new'
      },
      housingId: {  // Ajout de cette ligne
          type: DataTypes.INTEGER,
          references: {
              model: 'Housings',
              key: 'id'
          }
      }
  });

  Message.associate = function(models) {
      Message.belongsTo(models.Housing, { foreignKey: 'housingId' }); // Association avec le modèle Housing
  };

  return Message;
};
