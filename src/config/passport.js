const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const Users = mongoose.model('User');

passport.use(new LocalStrategy({
  usernameField: 'mail',
  passwordField: 'password',
}, (mail, password, done) => {
  Users.findOne({ mail })
    .then(async (user) => {
        var comparedPassword = await user.comparePassword(password)
      if(!user || !comparedPassword ) {
        return done(null, false, { errors: { 'email or password': 'is invalid' } });
      }

      return done(null, user);
    }).catch(done);
}));
