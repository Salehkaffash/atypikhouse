// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../models');

const initialize = (passport) => {
  const authenticateUser = async (username, password, done) => {
    try {
      const user = await db.User.findOne({ where: { username: username } });
      if (!user) {
        return done(null, false, { message: 'No user with that username' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (isValidPassword) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (err) {
      return done(err);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.User.findByPk(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

module.exports = initialize;
