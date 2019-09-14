/*  PASSPORT SETUP  */
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var UserDetails = require("../models/User");

passport.use(new LocalStrategy(
  function(username, password, done) {
      UserDetails.findOne({
        username: username
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        if (user.password != password) {
          return done(null, false);
        }
        return done(null, user);
      });
  }
));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
  });
  
  passport.deserializeUser(function(id, cb) {
    UserDetails.findById(id, function(err, user) {
      cb(err, user);
    });
  });


module.exports = passport;