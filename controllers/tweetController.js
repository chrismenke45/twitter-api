let TweetModel = require('../models/tweetModel')
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
    TweetModel.find({ $or: [{ commentOf: { $exists: false } }, { commentOf: { $eq: null } }] })
        .sort({ 'created': -1 })
        .limit(postQuantity || 12)
        .populate('author')
        .populate('retweetOf')
        .populate('retweets')
        //.populate('retweetOf.author')
        .populate({
            path: 'retweetOf',
            populate: {
                path: 'author retweets', //need 'author' AND 'retweets' of 'retweetOf' so origional tweet can be displayed
                select: '_id profile_image chosenName username author' //dont return all key/values, only the ones that we need
            },
        })
        .populate({
            path: 'commentOf',
            populate: {
                path: 'author', //need 'author' AND 'retweets' of 'retweetOf' so origional tweet can be displayed
                select: '_id chosenName profile_image retweets username' //dont return all key/values, only the ones that we need
            },
        })
        .exec()
        .then(tweet_list => {
            res.json(tweet_list);
        })
        .catch(err => {
            return next(err);
        })
}

exports.following_tweets_get = [

    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        let postQuantity = req.query.postQuantity;
        TweetModel.find({ $and: [{ $and: [ {author: req.user._id }, { $or: [{ commentOf: { $exists: false } }, { commentOf: { $eq: null } }] } ] }, { $and: [ {author: { $in: req.user.following } }, { $or: [{ commentOf: { $exists: false } }, { commentOf: { $eq: null } }] } ] } ] })
            .sort({ 'created': -1 })
            .limit(postQuantity || 12)
            .populate('author')
            .populate('retweetOf')
            .populate('retweets')
            //.populate('retweetOf.author')
            .populate({
                path: 'retweetOf',
                populate: {
                    path: 'author retweets', //need 'author' AND 'retweets' of 'retweetOf' so origional tweet can be displayed
                    select: '_id profile_image chosenName username author' //dont return all key/values, only the ones that we need
                },
            })
            .populate({
                path: 'commentOf',
                populate: {
                    path: 'author', //need 'author' AND 'retweets' of 'retweetOf' so origional tweet can be displayed
                    select: '_id chosenName profile_image retweets username' //dont return all key/values, only the ones that we need
                },
            })
            .exec()
            .then(tweet_list => {
                res.json(tweet_list);
            })
            .catch(err => {
                return next(err);
            })
    }
]


exports.tweet_detail = [

    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {

        const findTweet = (theid) => {
            return TweetModel.findById(theid)
                .populate('author')
                .populate('retweetOf')
                .populate('retweets')
                .populate({
                    path: 'retweetOf',
                    populate: {
                        path: 'author retweets', //need 'author' AND 'retweets' of 'retweetOf' so origional tweet can be displayed
                        select: '_id profile_image chosenName username author' //dont return all key/values, only the ones that we need
                    },
                })
        }
        const findComments = (theid, postQuantity) => {
            return TweetModel.find({ commentOf: theid })
                .sort({ 'created': -1 })
                .limit(postQuantity || 12)
                .populate('author')
                .populate('retweets')
                .populate({
                    path: 'commentOf',
                    populate: {
                        path: 'author', //need 'author' of 'retweetOf' so origional tweet can be displayed
                        select: '_id chosenName profile_image username' //dont return all key/values, only the ones that we need
                    },
                })
                .populate({
                    path: 'commentOf',
                    populate: {
                        path: 'retweets',
                        select: 'author'
                    }
                })

        }

        Promise.all([findTweet(req.params.id), findComments(req.params.id, req.query.postQuantity)])
            .then(theTweet => {
                res.json(theTweet);
            })
            .catch(err => {
                return next(err);
            })
    }
]

exports.tweet_create = [

    passport.authenticate('jwt', { session: false }),

    upload.single('img'),

    body('text', 'Tweets are limited to 140 characters').trim().isLength({ max: 140 }).escape(),


    (req, res, next) => {
        const errors = validationResult(req);

        let tweet = new TweetModel(
            {
                author: req.user._id,
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

exports.tweet_delete = [
    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        let retweetsDelete = (tweet) => {
            if (tweet.retweets && tweet.retweets.length != 0) {
                Promise.all(
                    tweet.retweets.map(theRetweet => {
                        return TweetModel.findByIdAndRemove(theRetweet)
                    })
                )
            }
        }
        let commentReferenceDelete = (tweet) => {
            if (tweet.commentOf) {
                TweetModel.findByIdAndUpdate(tweet.commentOf, {
                    $pull: { comments: tweet._id }
                }).exec()
            }
        }
        let retweetReferenceDelete = (tweet) => {
            if (tweet.retweetOf) {
                TweetModel.findByIdAndUpdate(tweet.retweetOf, {
                    $pull: { comments: tweet._id }
                }).exec()
            }
        }
        TweetModel.findById(req.params.id)
            .then(theTweet => {
                Promise.all([retweetsDelete(theTweet), commentReferenceDelete(theTweet), retweetReferenceDelete(theTweet)])
            })
            .then((theTweet) => {
                TweetModel.findByIdAndDelete(req.params.id).exec()
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
]

exports.like_put = [
    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        TweetModel.updateOne({ _id: req.params.id }, {
            $addToSet: { likes: req.user._id }
        }).exec()
            .then(() => {
                res.json({ message: `Tweet ${req.params.id} liked by User ${req.user._id}` })
            })
    }
]

exports.unlike_put = [
    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        TweetModel.updateOne({ _id: req.params.id }, {
            $pull: { likes: req.user._id }
        }).exec()
            .then(() => {
                res.json({ message: `Tweet ${req.params.id} unliked by User ${req.user._id}` })
            })
    }
]

exports.retweet_create = [
    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        let OGTweetId
        TweetModel.findById(req.params.id).exec()
            .then(theTweet => {
                if (theTweet.retweetOf) {
                    OGTweetId = theTweet.retweetOf
                } else if (theTweet.commentOf) {
                    OGTweetId = theTweet.commentOf
                } else {
                    OGTweetId = theTweet._id
                }
                return OGTweetId
            })
            .then(originalTweetId => {
                TweetModel.findById(originalTweetId).populate('retweets').exec()
                    .then(originalTweet => {
                        if (originalTweet.retweets && originalTweet.retweets.some(e => e.author.toString() === req.user._id.toString())) {
                            res.json({
                                'message': 'user already retweeted '
                            })
                        } else {
                            let tweet = new TweetModel(
                                {
                                    retweetOf: originalTweetId,
                                    author: req.user._id
                                })
                            tweet.save()
                                .then(newTweet => {
                                    TweetModel.updateOne({ _id: OGTweetId }, {
                                        $push: { retweets: newTweet._id }
                                    }).exec();
                                })
                                .then(() => {
                                    res.json({
                                        'message': 'retweet posted'
                                    })
                                })
                                .catch(err => {
                                    return next(err);
                                })
                        }

                    })
            })/*
            .then(newTweet => {
                TweetModel.updateOne({ _id: OGTweetId }, {
                    $push: { retweets: newTweet._id }
                }).exec();
            })
            .then(() => {
                res.json({
                    'message': 'retweet posted'
                })
            })*/
            .catch(err => {
                return next(err);
            })
    }
]


exports.comment_create = [

    passport.authenticate('jwt', { session: false }),

    upload.single('img'),

    body('text', 'Tweets are limited to 140 characters').trim().isLength({ max: 140 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            let tweet = new TweetModel(
                {
                    commentOf: req.params.id,
                    text: req.body.text,
                    img: {
                        data: (req.file ? fs.readFileSync(path.join(__dirname, '..', 'uploads', req.file.filename)) : null),
                        contentType: 'image/png'
                    },
                })
            res.json({ 'tweet': tweet, 'errors': errors.array() })
        } else {

            let OGTweetId

            TweetModel.findById(req.params.id).exec()
                .then(theTweet => {
                    if (theTweet.retweetOf) {
                        OGTweetId = theTweet.retweetOf
                    } else if (theTweet.commentOf) {
                        OGTweetId = theTweet.commentOf
                    } else {
                        OGTweetId = theTweet._id
                    }
                    return OGTweetId
                })
                .then(originalTweetId => {
                    let tweet = new TweetModel(
                        {
                            commentOf: originalTweetId,
                            text: req.body.text,
                            img: {
                                data: (req.file ? fs.readFileSync(path.join(__dirname, '..', 'uploads', req.file.filename)) : null),
                                contentType: 'image/png'
                            },
                            author: req.user._id
                        })
                    return tweet.save()
                })
                .then(theTweet => {
                    TweetModel.updateOne({ _id: OGTweetId }, {
                        $push: { comments: theTweet._id }
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

