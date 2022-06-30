var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TokenSchema = new Schema(
  {
    token: {type: String, required: true},
    userObj: {type: Object, required: true},
    expires: { type: Date, default: () => Date.now() + 3*60*1000 },
  }
);

//Export model
module.exports = mongoose.model('TokenModel', TokenSchema);