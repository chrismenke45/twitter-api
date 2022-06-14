let TweetModel = require('../models/tweetModel')
let UserModel = require('../models/userModel')

exports.tweets_get = [
    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        let postQuantity = req.query.postQuantity;
        TweetModel.find({ author: { $eq: req.params.userid } }, { commentOf: $or[{ $exists: false }, { $eq: null }] })
            .sort({ 'created': -1 })
            .limit(postQuantity || 12)
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
            .exec()
            .then(tweet_list => {
                res.json(tweet_list);
            })
            .catch(err => {
                return next(err);
            })
    }
]

exports.replies_get = [ //this is named replies but gets tweets AND replies
    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        let postQuantity = req.query.postQuantity;
        TweetModel.find({ author: { $eq: req.params.userid } })
            .sort({ 'created': -1 })
            .limit(postQuantity || 12)
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
            .exec()
            .then(tweet_list => {
                res.json(tweet_list);
            })
            .catch(err => {
                return next(err);
            })
    }
]

exports.media_get = [
    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        let postQuantity = req.query.postQuantity;
        TweetModel.find($or[{ author: { $eq: req.params.userid } }, { likes: { $in: [req.user._id] } }])
            .sort({ 'created': -1 })
            .limit(postQuantity || 12)
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
            .exec()
            .then(tweet_list => {
                res.json(tweet_list);
            })
            .catch(err => {
                return next(err);
            })
    }
]

exports.likes_get = [
    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        let postQuantity = req.query.postQuantity;
        TweetModel.find({ likes: { $in: [req.params.userid] } })
            .sort({ 'created': -1 })
            .limit(postQuantity || 12)
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
            .exec()
            .then(tweet_list => {
                res.json(tweet_list);
            })
            .catch(err => {
                return next(err);
            })
    }
]

exports.follow_put = [
    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {

        let updateFollowee = (followerId, followeeId) => {
            TweetModel.updateOne({ _id: followeeId }, {
                $push: { followers: followerId }
            }).exec()
        }

        let updateFollower = (followerId, followeeId) => {
            TweetModel.updateOne({ _id: followerId }, {
                $push: { following: followeeId }
            }).exec()
        }
        Promise.all([updateFollowee(req.user._id, req.params.userid), updateFollower(req.user._id, req.params.userid)])
            .then(() => {
                res.json({
                    'message': 'User ' + req.params.userid + ' followed by ' + req.user._id
                })
            })
            .catch((err) => {
                res.json({
                    'message': 'Error:' + err
                })
            })
    }
]

exports.unfollow_put = [
    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {

        let updateUnfollowee = (followerId, followeeId) => {
            TweetModel.updateOne({ _id: followeeId }, {
                $pull: { followers: followerId }
            }).exec()
        }

        let updateUnfollower = (followerId, followeeId) => {
            TweetModel.updateOne({ _id: followerId }, {
                $pull: { following: followeeId }
            }).exec()
        }
        Promise.all([updateUnfollowee(req.user._id, req.params.userid), updateUnfollower(req.user._id, req.params.userid)])
            .then(() => {
                res.json({
                    'message': 'User ' + req.params.userid + ' unfollowed by ' + req.user._id
                })
            })
            .catch((err) => {
                res.json({
                    'message': 'Error:' + err
                })
            })
    }
]