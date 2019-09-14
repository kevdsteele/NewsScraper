/* MONGOOSE SETUP */
const mongoose = require('mongoose');

var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/newsscraper'
mongoose.connect(MONGODB_URI);

const Schema = mongoose.Schema;
const UserDetail = new Schema({
      username: String,
      password: String,
      first: String,
      last:String,
      articles: [{
          type:Schema.Types.ObjectId,
          ref:"Article",
          
      }]
    });

const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

module.exports = UserDetails