var express = require('express');
var router = express.Router();
let profileController = require('../controllers/profileController')

router.get('/:userid/tweets', profileController.tweets_get)

router.get('/:userid/replies', profileController.replies_get) //this is named replies but gets tweets AND replies

router.get('/:userid/media', profileController.media_get)

router.get('/:userid/likes', profileController.likes_get)

router.put(':userid/follow', profileController.follow_put)

router.put(':userid/unfollow', profileController.unfollow_put)

module.exports = router;