var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    twitterId: {type: String, required: true},
    username: {type: String, required: true},
    chosenName: {type: String},
    followers: [{type: Number, ref: 'User'}],
    profile_image: {type: String,},
    background_image: {type: String}
  }
);

//Export model
module.exports = mongoose.model('UserModel', UserSchema);