const passport = require('passport')
let UserModel = require('../models/userModel')
const jwt = require('jsonwebtoken');

exports.login_get = passport.authenticate('twitter', { session: false })

exports.loggedin_get = [passport.authenticate('twitter', { session: false }), (req, res, next) => {
    let user = req.user
    console.log('user',user)
    res.send('http://localhost:3000')
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