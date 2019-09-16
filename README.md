# Politio News Scraper
An appication that scrapes Politico election news and allows users to like and comment on articles

** Fully developed by  Kevin Steele for GWU Full Stack Web Development BootCamp 

## Dependencies

Node, Express, Mongo, Mongoose, Passport, EJS, Cherrio, Axios, DOTENV

Run npm i to install all dependencies

Create a collection named userInfo and create a user document based on the Users schema definiton to be able to login to the site 

This application is intended to be hosted on Heroku. Please create a .env file with your Heroku mLab Mongo DB settings or update the localhost DB database name in the server.js file

## Organization 

Config - contains the Passport authentication middleware settings

Models - contains the Mongoose schema definitions for Users, Articles and Comments

Public - contains the CSS and  Javascript for the applications

Routes - contains the API and HTML routes for the application

Views - contains the EJS templates for the HTML pages and EJS partials for the headers, footer and navigation elements

