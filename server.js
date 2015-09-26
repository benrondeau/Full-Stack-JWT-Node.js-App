/*********************************
Step 1 - Basic App Setup
*********************************/

//Dependencies
'use strict';

var express = require('express'); //middleware
var morgan = require('morgan'); //log server functions to console
var bodyParser = require('body-parser'); //get values from HTTP requests

//App settings
var app = express();
app.use(morgan('dev')); // Log server operations to console. Has to be before routing functions....
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Set directory folder
app.use(express['static'](__dirname + '/public'));

//Routing
app.get('/', function (req, res) {
  res.sendfile('./public/index.html');
});

//Server
var port = process.env.PORT || 3000;
app.listen(port);
console.log('Magic happens at http://localhost:' + port);

/*********************************
Step 2 - Getting a JWT
*********************************/

var jwt = require('jsonwebtoken'); // all JWT functions
var credentials = require('./server/private/credentials'); //import credentials

var tokenSecret = credentials.tokenSecret;
var username = credentials.username;
var password = credentials.password;

app.post('/authenticate', function (req, res) {

  if (req.body.username === username && req.body.password === password) {

    var jwtClaim = {
      iss: 'mywebsite.com',
      id: username
    };

    // create a token
    var token = jwt.sign(jwtClaim, tokenSecret, {
      expiresInMinutes: 1440 // expires in 24 hours
    });

    // return the information including token as JSON
    res.json({
      success: true,
      message: 'Success',
      token: token
    });
  } else {
    res.status(401).end();
  }
});

/*********************************
Step 3 - Create Protected Routes and Verify JWT
*********************************/

// Protected routes
var protectedRoutes = express.Router(); //middleware for protected routes - an instance of an express router inside of an express app.

protectedRoutes.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, tokenSecret, function (err, decoded) {

      /***** Check for valid expiration date *****/

      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(401).send('Access Denied. Invalid Credentials');
  }
});

// apply the routes to our application with the prefix
app.use('/api', protectedRoutes);

// These routes are RELATIVE to /protected
protectedRoutes.get('/', function (req, res) {
  res.send('Laser Cats!!'); /******* send html instead *******/
});
