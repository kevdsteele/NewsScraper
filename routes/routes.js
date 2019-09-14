var path = require("path")
var passport = require('../config/passport')

var isAuthenticated = require("../config/middleware/isAuthenticated");
var axios = require("axios");
var cheerio = require("cheerio");

var moment = require("moment")

module.exports = function(app) {

  var db = require("../models");

/* Auth Routes */

app.get('/',  function (req, res) {
    var ejsObj = {
        pageTitle: "Auth"
       
      };
    res.render("pages/auth", ejsObj)});

app.get('/home', isAuthenticated , function (req, res) {
var ejsObj = {
    pageTitle: "Home",
    user: req.user,
    
  };
res.render("pages/home", ejsObj)});

app.get('/error', (req, res) => res.send("error logging in"));

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  app.get("/api/user_data", function(req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      console.log("User is logged in")

      console.log("Results are" + (res))
      res.json({
        first: req.user.first,
        last: req.user.last,
        id: req.user.id
      });
    }
  });
 


app.post('/',
  passport.authenticate('local', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/home');
  });

/* Politico scrapping routes */


// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://politico.com/news/2020-elections/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("li article").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this).find("h1")
          .children("a")
          .text();
        result.link = $(this).find("h1")
          .children("a")
          .attr("href");

          result.img = $(this).find(".fig-graphic")
          .find("img").attr("src")

          result.subhead = $(this).find("p.subhead").text()
          
          result.summary = $(this).find(".story-text").children("p").text().slice(0,-12)

          result.published = moment($(this).find("time").attr("datetime")).format("MM/DD/YYYY HH:MM")
  
        // Create a new Article using the `result` object built from scraping
        
     
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
        
      });
  
      // Send a message to the client
      res.send("Scrape Complete");
    });
  });

  /* article routes */

  app.get("/articles", function(req, res) {
    // Query: In our database, go to the animals collection, then "find" everything,
    // but this time, sort it by name (1 means ascending order)
    db.Article.find({}).sort({published:-1}).find()
    .populate("comments")
    .then(function(dbArticle) {
      res.json(dbArticle)
    })
    .catch(function(err){
      res.json(err)
    })
  
    });
 

  app.get("/savedarticles", function(req, res) {
   
    db.UserDetails.findOne({_id: req.user.id})
     
      .populate({path: 'articles', options: { sort: { 'published': -1 } } })
      .then(function(dbArticle) {
        res.json(dbArticle)
      })
     .catch(function(err){
       res.json(err)
     })
      
    });
 

  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("comments")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });


  app.post("/articles/:id", function (req, res) {

    db.UserDetails.update({_id: req.user.id}, {$addToSet: {articles: req.params.id}})

    .then(function(dbArticle) {
      console.log(dbArticle)

      if (dbArticle.nModified === 0) {
        res.send('Article already in your saved list')
      } else {
      res.send("Article was saved to your list")
      }
    })
    .catch(function(err){
      console.log(err)
      
    })
  })

  app.post("/comments/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Comment.create({first: req.user.first,author: req.user.id, comment: req.body.comment})
      .then(function(dbComment) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.updateOne({ _id: req.params.id }, {$addToSet:{ comments: dbComment._id }});
      })
      .then(function(dbComment) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbComment);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  


}

