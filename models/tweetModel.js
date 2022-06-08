var mongoose = require('mongoose');

var Schema = mongoose.Schema;

let TweetSchema = new Schema(
    {
        text: { type: String, maxlength: 140 },
        author: { type: Schema.Types.ObjectId, ref: 'UserModel' },
        retweetOf: { type: Schema.Types.ObjectId, ref: 'TweetModel' },
        commentOf: { type: Schema.Types.ObjectId, ref: 'TweetModel'},
        comments: [{ type: Schema.Types.ObjectId, ref: 'TweetModel' }],
        likes: [{ type: Schema.Types.ObjectId, ref: 'UserModel' }],
        retweets: [{ type: Schema.Types.ObjectId, ref: 'TweetModel' }],
        img:
        {
            data: Buffer,
            contentType: String
        },
        created: { type: Date, default: Date.now },
    }
)

//Export model
module.exports = mongoose.model('TweetModel', TweetSchema);