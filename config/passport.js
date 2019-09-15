/*  PASSPORT SETUP  */
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var UserDetails = require("../models/User");



passport.use(new LocalStrategy(


  function(username, password, done) {
    console.log("Username is " + username)
      UserDetails.findOne({
        username: username
      }, function(err, user) {
        
        if (err) {
          console.log("error is here" + err)
        
          return done(err);
        }

        if (!user) {
          console.log('Error is in middle' + user)
          
          return done(null, false);
        }

        if (user.password != password) {
          console.log("Bad pw")
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