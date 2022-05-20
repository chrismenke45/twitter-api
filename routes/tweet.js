var express = require('express');
var router = express.Router();
let tweetController = require('../controllers/tweetController')

/* GET home page. */
router.get('/', tweetController.index)

router.get('/:id', tweetController.tweet_detail)

router.post('/create', tweetController.tweet_create)

router.delete('/:id/delete', tweetController.tweet_delete)

router.post('/:id/retweet', tweetController.retweet_create)

router.delete('/:id/retweet/:retweetId/delete', tweetController.retweet_delete)

router.post('/:id/comment', tweetController.comment_create)

router.delete('/:id/comment/:commentId/delete', tweetController.comment_delete)

module.exports = router;