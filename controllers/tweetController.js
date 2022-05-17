let TweetModel = require('../models/TweetModel')
let UserModel = require('../models/UserModel')
let async = require('async')
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
    TweetModel.findById(req.params.id).populate('author').exec((err, tweet) => {
        if (err) { return next(err); }
        res.json(tweet)
    })
}

exports.post_detail = (req, res, next) => {
    Post.findById(req.params.id).populate('comments').exec((err, post) => {
        if (err) { return next(err); }
        res.json(post)
    })
}

exports.post_create_post = [

    //passport.authenticate('jwt', { session: false }),

    upload.single('img'),

    body('text', 'Tweets are limited to 140 characters').trim().isLength({ max: 140 }).escape(),
    body('post_text').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        let tweet = new TweetModel(
            {
                text: req.body.text,
                img: {
                    data: (req.file ? fs.readFileSync(path.join(__dirname, '..', 'uploads' , req.file.filename)) : null),
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