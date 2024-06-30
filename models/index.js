const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user');
db.Owner = require('./owner');
db.Housing = require('./housing');
db.Booking = require('./booking');
db.Comment = require('./comment');
db.Equipment = require('./equipment');
db.Notification = require('./notification');
db.Theme = require('./theme');
db.Destination = require('./destination');

// Associations

db.Owner.hasMany(db.Housing);
db.Housing.belongsTo(db.Owner);

db.Housing.hasMany(db.Booking);
db.Booking.belongsTo(db.Housing);

db.User.hasMany(db.Booking);
db.Booking.belongsTo(db.User);

db.User.hasMany(db.Comment);
db.Comment.belongsTo(db.User);

db.Housing.hasMany(db.Comment);
db.Comment.belongsTo(db.Housing);

db.Housing.belongsToMany(db.Equipment, { through: 'HousingEquipments' });
db.Equipment.belongsToMany(db.Housing, { through: 'HousingEquipments' });

db.Housing.belongsTo(db.Theme, { foreignKey: 'themeId', as: 'theme' });
db.Theme.hasMany(db.Housing, { foreignKey: 'themeId', as: 'housings' });

db.User.hasMany(db.Notification);
db.Notification.belongsTo(db.User);

module.exports = db;