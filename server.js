
var express = require('express');
var app = express();
var passport = require('./config/passport');
var session = require("express-session");
var bodyParser = require('body-parser');
var mongoose = require("mongoose")




app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({ secret: "keyboard cat", resave: true, saveUninitialized: true })
);

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");

require('./routes/routes.js')(app)

var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/newsscraper'
mongoose.connect(MONGODB_URI);


//Setting up web server and port 
const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));

