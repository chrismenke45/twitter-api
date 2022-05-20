let TweetModel = require('../models/TweetModel')
//let UserModel = require('../models/UserModel')
//let async = require('async')
const { body, validationResult } = require('express-validator');

//for image staorage
var path = require('path');
var multer = require('multer');
var fs = require('fs');
const passport = require('passport');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({ storage: storage });






exports.index = (req, res, next) => {
    let postQuantity = req.query.postQuantity;
    TweetModel.find({})
        .sort({ 'created': -1 })
        .limit(postQuantity || 12)
        .exec((err, tweet_list) => {
            if (err) { return next(err); }
            res.json(tweet_list)
        })
}

exports.tweet_detail = (req, res, next) => {
    TweetModel.findById(req.params.id).populate('author').populate('comments').exec((err, tweet) => {
        if (err) { return next(err); }
        res.json(tweet)
    })
}

exports.tweet_create = [

    //passport.authenticate('jwt', { session: false }),

    upload.single('img'),

    body('text', 'Tweets are limited to 140 characters').trim().isLength({ max: 140 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        let tweet = new TweetModel(
            {
                text: req.body.text,
                img: {
                    data: (req.file ? fs.readFileSync(path.join(__dirname, '..', 'uploads', req.file.filename)) : null),
                    contentType: 'image/png'
                },

            })

        if (!errors.isEmpty()) {
            res.json({ 'tweet': tweet, 'errors': errors.array() })
        } else {
            tweet.save((err) => {
                if (err) { return next(err) }
                res.json(tweet)
            })
        }
    }
]

exports.tweet_delete = (req, res, next) => {

    //passport.authenticate('jwt', { session: false }),

    TweetModel.findById(req.params.id)
        .then(theTweet => {
            if (theTweet.comments.length != 0) {
                theTweet.comments.map(theComment => {
                    TweetModel.findByIdAndRemove(theComment, (err) => {
                        if (err) { return next(err); }
                    })
                })
            }
            return theTweet
        })
        .then(theTweet => {
            if (theTweet.retweets.length != 0) {
                theTweet.retweets.map(theRetweet => {
                    TweetModel.findByIdAndRemove(theRetweet, (err) => {
                        if (err) { return next(err); }
                    })
                })
            }
            return
        })
        .then(() => {
            TweetModel.findByIdAndRemove(req.params.id)
        })
        .then(() => {
            res.json({
                message: "Post successfully deleted"
            })
        })
        .catch(err => {
            return next(err)
        })
}
/*
exports.tweet_delete = (req, res, next) => {

    //passport.authenticate('jwt', { session: false }),

    TweetModel.findById(req.params.id).exec((err, theTweet) => {
        if (err) { return next(err); }
        return theTweet
    })
        .then(theTweet => {
            if (theTweet.comments.length != 0) {
                theTweet.comments.map(theComment => {
                    TweetModel.findByIdAndRemove(theComment, (err) => {
                        if (err) { return next(err); }
                    })
                })
            }
            return theTweet
        })
        .then(theTweet => {
            if (theTweet.retweets.length != 0) {
                theTweet.retweets.map(theRetweet => {
                    TweetModel.findByIdAndRemove(theRetweet, (err) => {
                        if (err) { return next(err); }
                    })
                })
            }
            return
        })
        .then(() => {
            TweetModel.findByIdAndRemove(req.params.id, function deletePost(err) {
                if (err) { return next(err); }
                return
            })
        })
        .then(() => {
            res.json({
                message: "Post successfully deleted"
            })
        })
        .catch(err => {
            return next(err)
        })
}
*/
exports.retweet_create = (req, res, next) => {
    let tweet = new TweetModel(
        {
            retweetOf: req.params.id,
        })
        tweet.save()
            .then(theTweet => {
                console.log(theTweet)
                TweetModel.updateOne({ _id: req.params.id }, {
                    $push: { retweets: theTweet._id}
                }).exec();
            })
            .then(() => {
                res.json({
                    'message': 'retweet posted'
                })
            })
            .catch(err => {
                console.log(err);
                return next(err);
            })
}

exports.retweet_delete = (req, res, next) => {
    TweetModel.findByIdAndDelete(req.params.retweetId, (err) => {
        if (err) { return next(err) }
    })
        .then(() => {
            TweetModel.findByIdAndUpdate(req.params.id, {
                $pull: { retweets: req.params.retweetId }
            })
        })
        .then(() => {
            res.json({
                message: 'Retweet successfully deleted'
            })
        })
}

exports.comment_create = [

    //passport.authenticate('jwt', { session: false }),

    upload.single('img'),

    body('text', 'Tweets are limited to 140 characters').trim().isLength({ max: 140 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        let tweet = new TweetModel(
            {
                commentOf: req.params.id,
                text: req.body.text,
                img: {
                    data: (req.file ? fs.readFileSync(path.join(__dirname, '..', 'uploads', req.file.filename)) : null),
                    contentType: 'image/png'
                },

            })

        if (!errors.isEmpty()) {
            res.json({ 'tweet': tweet, 'errors': errors.array() })
        } else {
            tweet.save()
            .then(theTweet => {
                console.log(theTweet)
                TweetModel.updateOne({ _id: req.params.id }, {
                    $push: { comments: theTweet._id}
                }).exec();
            })
            .then(() => {
                res.json({
                    'message': 'comment posted'
                })
            })
            .catch(err => {
                console.log(err);
                return next(err);
            })
        }
    }
]

exports.comment_delete = (req, res, next) => {
    TweetModel.findByIdAndDelete(req.params.commentId, (err) => {
        if (err) { return next(err) }
    })
        /*.then(() => {
            TweetModel.findByIdAndUpdate(req.params.id, {
                $pull: { comments: req.params.commentId }
            })
        })*/
        .then(() => {
            res.json({
                message: 'Comment successfully deleted'
            })
        })
}
