const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: process.env.DB_PORT,
  dialectOptions: {
    connectTimeout: 60000 // 60 seconds
  }
});

async function resetDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Récupérer tous les noms de tables
    const [results] = await sequelize.query("SHOW TABLES");

    // Supprimer toutes les tables
    for (const result of results) {
      const tableName = Object.values(result)[0];
      await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\`;`);
      console.log(`Table ${tableName} dropped successfully.`);
    }

    // Synchronise de nouveau les modèles pour recréer les tables
    await sequelize.sync();
    console.log('All tables created successfully.');

  } catch (err) {
    console.error('Error resetting database:', err);
  } finally {
    await sequelize.close();
  }
}

resetDatabase();
