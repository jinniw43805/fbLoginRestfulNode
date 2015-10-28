var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendfile('./html/auth.html');
});

router.get('/success',function(req, res, next){
  res.send('You are Successfully logged in!!');
});



router.get('/auth/facebook', passport.authenticate('facebook'),function(err){
	console.log(err);
});

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
	  successRedirect: '/success',
	  failureRedirect: '/error'
}));

router.get('/error', function(req, res, next) {
	  res.send("Error logging in.");
});

module.exports = router;
