const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

const passportConfig = (passport) => {
    passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return done(null, false, { message: 'Password or username is incorrect' });
    }

    const isValid = await user.isValidPassword(password);
    if (!isValid) {
      return done(null, false, { message: 'Password or username is incorrect' });
    }

    return done(null, user);
  } catch (error) {
    done(error);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

  module.exports = passportConfig;
  
