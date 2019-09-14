/* MONGOOSE SETUP */
const mongoose = require('mongoose');


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