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

const Theme = sequelize.define('Theme', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const themes = [
  { name: 'Yourte', description: 'Séjour Traditionnel' },
  { name: 'Tiny House', description: 'Séjour Écologique' },
  { name: 'Chalet', description: 'Séjour Familial' },
  { name: 'Bulle', description: 'Séjour Glamping' },
  { name: 'Maison Hobbit', description: 'Séjour Fantastique' }
];

async function addThemes() {
  try {
    await sequelize.authenticate(); // Vérifier la connexion à la base de données
    console.log('Connection has been established successfully.');
    await sequelize.sync(); // Synchroniser le modèle avec la base de données
    for (const theme of themes) {
      await Theme.create(theme);
    }
    console.log('Themes added successfully');
  } catch (err) {
    console.error('Error adding themes:', err);
  } finally {
    await sequelize.close(); // Fermer la connexion après l'opération
  }
}

addThemes();
