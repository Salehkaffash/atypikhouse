const db = require('./models');

const themes = [
  { name: 'Yourte', description: 'Séjour Traditionnel' },
  { name: 'Tiny House', description: 'Séjour Écologique' },
  { name: 'Chalet', description: 'Séjour Familial' },
  { name: 'Bulle', description: 'Séjour Glamping' },
  { name: 'Maison Hobbit', description: 'Séjour Fantastique' }
];

async function addThemes() {
  try {
    await db.sequelize.authenticate(); // Vérifier la connexion à la base de données
    console.log('Connection has been established successfully.');
    for (const theme of themes) {
      await db.Theme.create(theme);
    }
    console.log('Themes added successfully');
  } catch (err) {
    console.error('Error adding themes:', err);
  }
}

addThemes();
