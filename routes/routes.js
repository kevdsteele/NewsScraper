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

app.get('/home',isAuthenticated, function (req, res) {
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

/* get user info for diplay*/
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

app.get("/scrape", function(req, res) {
   
    axios.get("https://politico.com/news/2020-elections/2").then(function(response) {

      var $ = cheerio.load(response.data);

      $("li article").each(function(i, element) {
     
        var result = {};

        result.title = $(this).find("h1")
          .children("a")
          .text();
        result.link = $(this).find("h1")
          .children("a")
          .attr("href");

          /* Politico shows images and videos. I used truthy logic to grab the standard img or the video still*/
          result.img = $(this).find(".fig-graphic")
         .find("img").attr("src") || $(this).find("video").text().substr(54).slice(0,-22)

        
          result.subhead = $(this).find("p.subhead").text()
          
          result.summary = $(this).find(".story-text").children("p").text().slice(0,-12)

          result.published = moment($(this).find("time").attr("datetime")).format("MM/DD/YYYY HH:MM")
  
        
 
        db.Article.create(result)
          .then(function(dbArticle) {
          
            console.log(dbArticle);
          })
          .catch(function(err) {
           
            console.log(err);
          });
        
      });
  
   
      res.send("Scrape Complete");
    });
  });

  /* article routes */

  app.get("/articles", function(req, res) {
    //Get articles and sort by date published
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

    db.Article.findOne({ _id: req.params.id })
    
      .populate("comments")
      .then(function(dbArticle) {
        res.json(dbArticle)
      })
      .catch(function(err) {
      
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
   
    db.Comment.create({first: req.user.first,author: req.user.id, comment: req.body.comment})
      .then(function(dbComment) {

        return db.Article.updateOne({ _id: req.params.id }, {$addToSet:{ comments: dbComment._id }});
      })
      .then(function(dbComment) {

        res.json(dbComment);
      })
      .catch(function(err) {
 
        res.json(err);
      });
  });

  app.post("/deletecomment/:id", function(req, res) {
   
    db.Comment.remove({_id: req.params.id})
      .then(function(dbComment) {

        return db.Article.updateOne({ _id: req.body.articleid }, {$pull:{ comments: req.params.id }});
      })
      .then(function(dbComment) {

        res.json(dbComment);
      })
      .catch(function(err) {
      
        res.json(err);
      });
  });
  
  


}

