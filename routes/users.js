var express = require('express');
var router = express.Router();
let userController = require('../controllers/userController')

/* GET users listing. */
router.get('/auth/twitter', userController.login_get);

router.get('/auth/twitter/callback', userController.loggedin_get)

router.get('/suggested', userController.suggested_get)

router.get('/info/:userid', userController.user_get)

module.exports = router;
