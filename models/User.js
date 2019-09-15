/* MONGOOSE SETUP */
var mongoose = require('mongoose');


var Schema = mongoose.Schema;
var UserDetail = new Schema({
      username: String,
      password: String,
      first: String,
      last:String,
      articles: [{
          type:Schema.Types.ObjectId,
          ref:"Article",
          
      }]
    });

var UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

module.exports = UserDetails