const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
// const expressValidator = require('express-validator');
// const { check } = require('express-validator/check');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const request = require('request');
const bcrypt = require('bcryptjs');
const user = require('./routes/user');
const checkAuth = require('./middleware/auth')



mongoose.connect('mongodb://127.0.0.1:27017/trip-planner', {useNewUrlParser: true});
mongoose.connection.on('error', error => console.log(error) );
// mongoose.Promise = global.Promise;

const db = mongoose.connection;

app.use(cors());

// app.use(expressValidator());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/user', user);
////////////// MIDDLEWARE END

// listen on port 3000
app.listen(process.env.PORT || 3000, () => {
  console.log('Server started ...')
});

// const checkAuth = require('./middleware/auth')

///// ROUTES /////
app.get('/showusers', (req, res) => {
  db.collection('users').find().toArray((err, results) => {
    res.json(results);
  });
});

const TRIP_PLANNER_BASE = 'https://api.transport.nsw.gov.au/v1/tp'
const API_KEY = 'qyyB5ajjPGdUAXbZaELGqwpgWr03VFiQ579m'

// TRIP PLANNER API PROXY GET stops
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



// TRIP PLANNER API PROXY GET trip
app.get('/planner/:originid/:destinationid', (req, res) => {
  const headers = {
      'Accept': 'application/json',
      'Authorization': 'apikey qyyB5ajjPGdUAXbZaELGqwpgWr03VFiQ579m'
  };
  const options = {
      url: `https://api.transport.nsw.gov.au/v1/tp/trip?outputFormat=rapidJSON&coordOutputFormat=EPSG%3A4326&depArrMacro=dep&type_origin=any&name_origin=${req.params.originid}&type_destination=any&name_destination=${req.params.destinationid}&calcNumberOfTrips=6&TfNSWTR=true&version=10.2.1.42`,
      headers: headers
  };

  function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        res.json(JSON.parse(body));
      }
  }

  request(options, callback);

});



////////// END ROUTES

// API PROXY GET trip planner

// GOOGLE MAPS SEARCH TRIP CODE
// app.get('/searchtrip/:origin/:destination' , (req, res) => {
//
//   const {
//     origin,
//     destination,
//   } = req.params
//
//   const options = {
//     url: `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=transit&alternatives=true&region=au&key=AIzaSyBND5ksDpE8U7IRPTOobQXYIwGckHeYxRs`,
//   };
//
//   function callback(error, response, body) {
//     if (!error && response.statusCode == 200) {
//       res.json(JSON.parse(body));
//     }
//   }
//
//   request(options, callback);
//
// })

// CODE FOR ORIGIN DEST IN LON/LAT SEARCH
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
