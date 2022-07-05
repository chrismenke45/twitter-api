const passport = require('passport')
let UserModel = require('../models/userModel')
let TokenModel = require('../models/tokenModel')
const jwt = require('jsonwebtoken');
const { json } = require('express');
let clientURL = process.env.PRODUCTION_CLIENT_URL || process.env.DEVELOPMENT_CLIENT_URL

exports.login_get = passport.authenticate('twitter', { session: false })

/*exports.loggedin_get = [passport.authenticate('twitter', { session: false }), (req, res, next) => {
    let user = {
        twitterId: req.user._json.id_str,
        username: req.user._json.screen_name,
        chosenName: req.user._json.name,
        profile_image: req.user._json.profile_image_url_https,
        background_image: req.user._json.profile_background_image_url_https,
    }
    var expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);
    UserModel.findOne({ twitterId: user.twitterId })
        .then(currentUser => {
            if (!currentUser._id) {//Need to get rid of this if statement and only have first option if we want user image/name to update when it does on twitter
                let newUser = new UserModel(user)
                newUser.save()
                    .then(theNewUser => {
                        theNewUser = {
                            ...theNewUser,
                            expiresIn: expireTime.toString()
                        }
                        const token = jwt.sign(theNewUser._doc, process.env.jwtSecret, { expiresIn: "1h" });
                        res.cookie('jwt', token, { maxAge: 3999 });
                        res.cookie('user', encodeURIComponent(JSON.stringify(theNewUser._doc)), { maxAge: 3999 })
                        res.redirect(clientURL + '/set-credentials')
                    })
            } else {
                currentUser = {
                    ...currentUser._doc,
                    expiresIn: expireTime.toString()
                }
                const token = jwt.sign(currentUser, process.env.jwtSecret, { expiresIn: "1h" });
                res.cookie('jwt', token, { maxAge: 3999 });
                res.cookie('user', encodeURIComponent(JSON.stringify(currentUser)), { maxAge: 3999 })
                res.redirect(clientURL + '/set-credentials')
            }
        })
        .catch(err => {
            return next(err)
        })
}]
*/

exports.loggedin_get = [passport.authenticate('twitter', { session: false }), (req, res, next) => {
    let user = {
        twitterId: req.user._json.id_str,
        username: req.user._json.screen_name,
        chosenName: req.user._json.name,
        profile_image: req.user._json.profile_image_url_https,
        background_image: req.user._json.profile_background_image_url_https,
    }
    let expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);
    UserModel.findOne({ twitterId: user.twitterId })
        .then(currentUser => {
            if (!currentUser || !currentUser._id) {//Need to get rid of this if statement and only have first option if we want user image/name to update when it does on twitter
                let newUser = new UserModel(user)
                newUser.save()
                    .then(theNewUser => {
                        let newToken = new TokenModel({
                            userObj: {
                                ...theNewUser._doc,
                                expiresIn: expireTime
                            },
                            token: jwt.sign(theNewUser._doc, process.env.jwtSecret, { expiresIn: "1h" }),
                        })
                        newToken.save()
                        .then(theToken => {
                            res.redirect(clientURL + '/set-credentials' + theToken._id)
                        })
                    })
            } else {
                let newToken = new TokenModel({
                    userObj: {
                        ...currentUser._doc,
                        expiresIn: expireTime
                    },
                    token: jwt.sign(currentUser._doc, process.env.jwtSecret, { expiresIn: "1h" }),
                })
                newToken.save()
                .then(theToken => {
                    res.redirect(clientURL + '/set-credentials?id=' + theToken._id)
                })
            }
        })
        .catch(err => {
            return next(err)
        })
}]

exports.token_get = (req, res, next) => {
    let id = req.query.id;
    if (!id) {
        res.json({
            'message': 'token id required'
        })
    } else {
        TokenModel.findById(id).exec()
        .then(token => {
            if (token.expires < new Date()) {
                res.json({
                    'message': 'token expired'
                })
            } else if (!token) {
                res.json({
                    'message': 'Invalid token id'
                })
            } else {
                TokenModel.findByIdAndDelete(token._id).exec()
                .then(deletedToken => {
                    res.json(deletedToken)
                })
                .catch(err => {
                    console.error(err);
                    return next(err);
                })
            }
        })
        .catch(err => {
            console.error(err);
            return next(err);
        })
    } 
}

exports.token_delete = (req, res, next) => {
    TokenModel.deleteMany({ expires : { $lte : new Date()}})
    .exec()
    .then(response => {
        res.json({
            'message': `Deleted ${response.deletedCount} token${response.deletedCount === 1 ? '' : 's'}`
        })
    })
    .catch(err => {
        console.error(err);
        return next(err);
    })
}

exports.suggested_get = [
    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        UserModel.find({"_id": { $ne: req.user._id }})
        .sort({ 'created': -1 })
        .limit(3)
        .exec()
        .then(user_list => {
            res.json(user_list);
        })
        .catch(err => {
            return next(err);
        })

    }
]

exports.user_get = [
    passport.authenticate('jwt', { session: false }),

    (req, res, next) => {
        UserModel.findById(req.params.userid)
        .exec()
        .then(user => {
            res.json(user);
        })
        .catch(err => {
            return next(err);
        })

    }
]