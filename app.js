var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var FACEBOOK_APP_ID = '1652565571693511';
var FACEBOOK_APP_SECRET = '9ce154d4db11dc6e856f5d9141acd4e9';
var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');
// DB stuff
var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };       
var mongodbUri = 'mongodb://tony:tony123@ds045464.mongolab.com:45464/agilemount';
var mongooseUri = uriUtil.formatMongoose(mongodbUri);

// Connect to the db
mongoose.connect(mongooseUri, options);
var conn = mongoose.connection;             
 
conn.on('error', console.error.bind(console, 'connection error:'));  
 

var User = mongoose.model('User',{
	oauthID : Number,
	name : String
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes);

app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
// handle fb callback 
// passport.use(new FacebookStrategy({
//   clientID: FACEBOOK_APP_ID,
//   clientSecret: FACEBOOK_APP_SECRET,
//   callbackURL: 'http://localhost:3000/auth/facebook/callback'
// },

// function(accessToken, refreshToken, profile, done) {
//       //Assuming user exists
//   User.findOne({ oAuthID : profile.id }, function ( err, user){
//     if(err){ 
//       console.log(err);
//     }

//     if(!err && user != null){
//       // user had existed
//       done(null, user);
//     }else{
//       // set User profile
//       var user = new User ({
//         oAuthID : profile.id,
//         name : profile.displayName,
//         created : Date.now()
//       });

//       // create User profile 
//       user.save(function( err){
//         if( err){
//           console.log(err);
//         }else{
//           console.log("saving user");
//           done(null,user);
//         };
//       });
//     };
//   });
// }));	  
passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: 'http://localhost:3000/auth/facebook/callback'
},
function(accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
     console.log(accessToken);
     console.log(profile);
    // return done(null, profile);
    User.findOne({ oauthID: profile.id }, function(err, user) {
     if(err) { console.log(err); }
     if (!err && user != null) {
       done(null, user);
     } else {

      console.log("start storing...");
       var user = new User({
         oauthID: profile.id,
         name: profile.displayName,
         created: Date.now()
       });
       user.save(function(err) {
         if(err) {
           console.log(err);
         } else {
           console.log("saving user ...");
           done(null, user);
         };
       });
     };
    });
  });

  }
));

passport.serializeUser(function(user, done) {
  console.log('serializeUser: ' + user._id)
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
	User.findById(obj, function(err, user){
     console.log(user);
     if(!err) done(null, user);
     else   done(err, null)
 //done(null, obj);
  })
});


module.exports = app;
