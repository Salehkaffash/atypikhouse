// models/photo.js
module.exports = (sequelize, DataTypes) => {
    const Photo = sequelize.define('Photo', {
      path: {
        type: DataTypes.STRING,
        allowNull: false, // Le chemin de l'image doit être défini
      },
      housingId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Housings', // Utilisation du nom correct de la table
          key: 'id',
        },
        onDelete: 'CASCADE', // Supprimer les photos si l'hébergement est supprimé
        onUpdate: 'CASCADE',
      },
    }, {
      timestamps: true // Ajoute les champs createdAt et updatedAt
    });
  
    Photo.associate = function(models) {
      Photo.belongsTo(models.Housing, { foreignKey: 'housingId' }); // Association avec le modèle Housing
    };
  
    return Photo;
  };
  