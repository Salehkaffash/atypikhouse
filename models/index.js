const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.Owner = require('./owner')(sequelize, Sequelize.DataTypes);
db.Housing = require('./housing')(sequelize, Sequelize.DataTypes);
db.Booking = require('./booking')(sequelize, Sequelize.DataTypes);
db.Comment = require('./comment')(sequelize, Sequelize.DataTypes);
db.Equipment = require('./equipment')(sequelize, Sequelize.DataTypes);
db.Theme = require('./theme')(sequelize, Sequelize.DataTypes);
db.Destination = require('./destination')(sequelize, Sequelize.DataTypes);
db.Page = require('./page')(sequelize, Sequelize.DataTypes);
db.Blog = require('./blog')(sequelize, Sequelize.DataTypes);
db.Photo = require('./photo')(sequelize, Sequelize.DataTypes);

// Associations
db.Housing.belongsToMany(db.Equipment, { through: 'HousingEquipments', foreignKey: 'HousingId' });
db.Equipment.belongsToMany(db.Housing, { through: 'HousingEquipments', foreignKey: 'EquipmentId' });

// Ajout du modèle Message
db.Message = require('./message')(sequelize, Sequelize.DataTypes);

// Associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
