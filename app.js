const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const { check } = require('express-validator/check');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const mongoose = require('mongoose');
const users = require('./routes/users');
const cors = require('cors');
const app = express();
const request = require('request');

// const proxy = require('express-http-proxy');

const User = require('./models/users');

mongoose.connect('mongodb://127.0.0.1:27017/trip-planner', {useNewUrlParser: true});
mongoose.connection.on('error', error => console.log(error) );
mongoose.Promise = global.Promise;

const db = mongoose.connection;


// did not include express session
//////// MIDDLEWARE

// app.use(expressValidator({
//   errorFormatter: function(param, msg, value) {
//       var namespace = param.split('.')
//       , root    = namespace.shift()
//       , formParam = root;
//
//     while(namespace.length) {
//       formParam += '[' + namespace.shift() + ']';
//     }
//     return {
//       param : formParam,
//       msg   : msg,
//       value : value
//     };
//   }
// }));

app.use(passport.initialize());
app.use(passport.session());

app.use(cors());

app.use(expressValidator());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//////////////

// listen on port 3000
app.listen(3000, () => {
  console.log('Server started on PORT:', 3000)
});

///// ROUTES /////

// app.get('/test', (req, res) => {
//   res.json("test: working!")
// });

app.get('/users', (req, res) => {
  db.collection('users').find().toArray((err, results) => {
    res.json(results);
  });
});

const TRIP_PLANNER_BASE = 'https://api.transport.nsw.gov.au/v1/tp'
const API_KEY = 'qyyB5ajjPGdUAXbZaELGqwpgWr03VFiQ579m'

// API PROXY GET stops
app.get('/stop/:id', (req, res) => {
  const headers = {
      'Accept': 'application/json',
      'Authorization': `apikey ${API_KEY}`
  };

  const options = {
      url: `${TRIP_PLANNER_BASE}/stop_finder?outputFormat=rapidJSON&type_sf=any&name_sf=${req.params.id}&coordOutputFormat=EPSG%3A4326&TfNSWSF=true&version=10.2.1.42`,
      headers: headers
  };

  function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        res.json(JSON.parse(body));
      }
  }
  request(options, callback);
})

// API PROXY GET trip planner

app.get('/searchtrip/:originlat/:originlon/:destinationlat/:destinationlon' , (req, res) => {

  const {
    originlat,
    originlon,
    destinationlat,
    destinationlon
  } = req.params

  const headers = {
      'Accept': 'application/json',
      'Authorization': 'apikey qyyB5ajjPGdUAXbZaELGqwpgWr03VFiQ579m'
  };

  const options = {
      url: `${TRIP_PLANNER_BASE}/trip?outputFormat=rapidJSON&coordOutputFormat=EPSG%3A4326&depArrMacro=dep&type_origin=coord&name_origin=${originlon}%3A${originlat}%3AEPSG%3A4326&type_destination=coord&name_destination=${destinationlon}%3A${destinationlat}%3AEPSG%3A4326&calcNumberOfTrips=6&TfNSWTR=true&version=10.2.1.42`,
      headers: headers
  };

  function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        res.json(JSON.parse(body));
      }
  }

  request(options, callback);

})
// app.get('/searchtrip/:originlat/:originlon/:destinationlat/:destinationlon', (req, res) => {
//
//
//   const headers = {
//       'Accept': 'application/json',
//       'Authorization': `apikey ${API_KEY}`
//   };
//
//   const options = {
//       url: `${TRIP_PLANNER_BASE}/trip?outputFormat=rapidJSON&coordOutputFormat=EPSG%3A4326&depArrMacro=dep&type_origin=coord&name_origin=${req.params.originlon}%3A${req.params.originlat}%3AEPSG%3A4326&type_destination=coord&name_destination=${req.params.destinationlat}%3A${req.params.destinationlon}%3AEPSG%3A4326&calcNumberOfTrips=6&TfNSWTR=true&version=10.2.1.42`,
//       headers: headers
//   };
//
//   function callback(error, response, body) {
//       if (!error && response.statusCode == 200) {
//         res.json(JSON.parse(body));
//       }
//   }
//
//   request(options, callback);
//
// })

// Signing up new user
app.post('/users', (req, res) => {
  const {
    username,
    email,
    password
  } = req.body

  // console.log(username, email, password)

  const user = new User({
    username: username,
    email: email,
    password: password
  }); //new users

  user.save()
  .then( () => {
    // calling method defined in user.js
    return user.generateAuthToken()
  })
  .then(token => {
    // send token back as http header
    // header takes 2 arguments as key/value pairs
    // key is header name, value is what you set header to
    res.header('jwt_auth', token).send('user');
  })
  .catch(err => {
    res.status(400).send(err)
  });



  // check('username')
  // .isEmpty()
  // .withMessage('empty')

  //expressValidator checks
  // req.checkBody(username, 'Name is required').notEmpty();
  // req.checkBody(email, 'Email is required').notEmpty();
  // req.checkBody(email, 'Email is not valid').isEmail();
  // req.checkBody(password, 'Password is required').notEmpty();
  // req.checkBody(confirmPassword, 'Passwords do not match').equals(password);

  // var errors = req.validationErrors();
  // console.log(errors)
  // if (errors) {
  //   console.log(errors)
  // } else {
  //   console.log('passed');
  // }


}); // POST to signup


// //LOGIN
// app.post('/users/login', (req, res) => {
//   const {
//     username,
//     email,
//     password
//   } = req.body
//
//   res.send(req.body);
//
//
// })
