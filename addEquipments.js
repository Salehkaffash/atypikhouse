const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: process.env.DB_PORT,
  dialectOptions: {
    connectTimeout: 60000 // 60 seconds
  }
});

const Equipment = sequelize.define('Equipment', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false, // simple or premium
  },
});

const equipments = [
  // Equipements simples
  { name: 'Lits', type: 'simple' },
  { name: 'Chauffage', type: 'simple' },
  { name: 'Wi-Fi', type: 'simple' },
  { name: 'Télévision', type: 'simple' },
  { name: 'Air conditionné', type: 'simple' },
  { name: 'Machine à laver', type: 'simple' },
  { name: 'Réfrigérateur', type: 'simple' },
  { name: 'Micro-ondes', type: 'simple' },
  { name: 'Plaque de cuisson', type: 'simple' },
  { name: 'Ustensiles de cuisine', type: 'simple' },

  // Equipements premiums
  { name: 'Jacuzzi', type: 'premium' },
  { name: 'Petit déjeuner inclus', type: 'premium' },
  { name: 'Service de ménage', type: 'premium' },
  { name: 'Piscine privée', type: 'premium' },
  { name: 'Salle de sport', type: 'premium' },
  { name: 'Sauna', type: 'premium' },
  { name: 'Vue sur la mer', type: 'premium' },
  { name: 'Balcon privé', type: 'premium' },
  { name: 'Cheminée', type: 'premium' },
  { name: 'Barbecue', type: 'premium' },
  { name: 'Transfert aéroport', type: 'premium' },
  { name: 'Service de conciergerie', type: 'premium' },
  { name: 'Bain à remous', type: 'premium' },
  { name: 'Cinéma privé', type: 'premium' },
  { name: 'Coffre-fort', type: 'premium' },
  { name: 'Produits de toilette de luxe', type: 'premium' },
  { name: 'Lit bébé', type: 'premium' },
  { name: 'Parking privé', type: 'premium' },
  { name: 'Animaux autorisés', type: 'premium' },
  { name: 'Salle de jeux', type: 'premium' },
];

async function addEquipments() {
  try {
    await sequelize.authenticate(); // Vérifier la connexion à la base de données
    console.log('Connection has been established successfully.');
    await sequelize.sync(); // Synchroniser le modèle avec la base de données
    for (const equipment of equipments) {
      await Equipment.create(equipment);
    }
    console.log('Equipments added successfully');
  } catch (err) {
    console.error('Error adding equipments:', err);
  } finally {
    await sequelize.close(); // Fermer la connexion après l'opération
  }
}

addEquipments();
