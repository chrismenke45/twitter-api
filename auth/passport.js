const passport = require('passport');

require('dotenv').config();

var TwitterStrategy = require('passport-twitter').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
let UserModel = require('../models/userModel')

let apiUrl = process.env.PRODUCTION_API_IRL || process.env.DEVELOPMENT_API_URL

passport.use('twitter', new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: `${apiUrl}/users/auth/twitter/callback`
  },
  /*function(token, tokenSecret, profile, cb) {
    User.findOrCreate({ twitterId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
  */
  function(token, tokenSecret, profile, done) {
      done(null, profile)
  }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey : process.env.jwtSecret
  },
  function (jwtPayload, cb) {
  
    //find the user in db 
    return UserModel.findById(jwtPayload._id)
        .then(user => {
            return cb(null, user);
        })
        .catch(err => {
          console.log(err);
            return cb(err);
        });
  }
  ));
passport.serializeUser((user, done) => {
    done(null, user)
}
)
passport.deserializeUser((user, done) => {
    done(null, user)
}
)

//Below of from old app
/*
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
*/
    /*function(accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }*/
/*
    function (accessToken, refreshToken, profile, done) {
        done(null, profile);
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey : process.env.jwtSecret
  },
  function (jwtPayload, cb) {
  
    //find the user in db 
    return UserModel.findById(jwtPayload.id)
        .then(user => {
            //return cb(null, user);
          if (user.admin) {
            return cb(null, user);
          } else {
            return cb(null)
          }
        })
        .catch(err => {
            return cb(err);
        });
  }
  ));
passport.serializeUser((user, done) => {
    done(null, user)
}
)
passport.deserializeUser((user, done) => {
    done(null, user)
}
)
*/