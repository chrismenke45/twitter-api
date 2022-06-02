var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    TwitterID: {type: Number, required: true},
    username: {type: String, required: true},
    chosenName: {type: String},
    followers: [{type: Number, ref: 'User'}],
    image: {type: Buffer,}
  }
);

//Export model
module.exports = mongoose.model('UserModel', UserSchema);