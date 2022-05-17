var mongoose = require('mongoose');

var Schema = mongoose.Schema;

let TweetSchema = new Schema(
    {
        text: { type: String, maxlength: 140 },
        author: { type: Schema.Types.ObjectId, required: true},
        retweetOf: { type: Schema.Types.ObjectId, ref: 'TweetSchema' },
        comments: [{ type: Schema.Types.ObjectId, ref: 'TweetSchema' }],
        likes: [{ type: Number}],
        retweets: [{ type: Schema.Types.ObjectId, ref: 'TweetSchema' }],
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