const passport = require('passport')
let UserModel = require('../models/userModel')
const jwt = require('jsonwebtoken');
let clientURL = process.env.PRODUCTION_CLIENT_URL || process.env.DEVELOPMENT_CLIENT_URL

exports.login_get = passport.authenticate('twitter', { session: false })

exports.loggedin_get = [passport.authenticate('twitter', { session: false }), (req, res, next) => {
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

/*exports.loggedin_get = [passport.authenticate('twitter', { session: false }), (req, res, next) => {
    let user = req.user
    var expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);
    let clientUserObject = {
        firstName: user.name.givenName,
        fullName: user.displayName,
        photo: user.photos[0].value,
        expiresIn: expireTime.toString(),
    }
    UserModel.findById(user.id)
        .then(currentUser => {

            if (!currentUser) {
                let newUser = new UserModel({
                    _id: parseInt(user.id),
                    username: user.displayName,
                    admin: false,
                })
                newUser.save()
                    .then(theNewUser => {
                        clientUserObject.admin = false;
                        const token = jwt.sign(user, process.env.jwtSecret);
                        res.cookie('jwt', token, { maxAge: 3999 });
                        res.cookie('user', encodeURIComponent(JSON.stringify(clientUserObject)), { maxAge: 3999 })
                        res.redirect(url + '/set-credentials')
                    })
                    .catch(err => {
                        next(err)
                    })
*/
/*currentUser.admin = true;
currentUser.save()
.then(NU => {
console.log(NU)
})*/
/*
            } else {
                clientUserObject.admin = currentUser.admin
                const token = jwt.sign(user, process.env.jwtSecret, {expiresIn: "1h"});
                res.cookie('jwt', token, { maxAge: 3999 });
                res.cookie('user', encodeURIComponent(JSON.stringify(clientUserObject)), { maxAge: 3999 })
                res.redirect(url + '/set-credentials')
            }
        })
        .catch(err => {
            next(err)
        })
}]*/