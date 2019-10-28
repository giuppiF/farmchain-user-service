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
      if(!user) return done(null, false, { errors: { 'email ': 'is invalid' } });
      var comparedPassword = await user.comparePassword(password)
      if(!comparedPassword ) return done(null, false, { errors: { 'password': 'is invalid' } });
      return done(null, user);
    }).catch(done);
}));
