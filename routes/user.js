const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/auth')

const db = mongoose.connection;

// User sign up route
router.post('/signup', function(req, res) {
  // hash password with bcrypt
   bcrypt.hash(req.body.password, 10, function(err, hash){
     //handle error if there is one
      if(err) {
        console.log(err)
         return res.status(500).json({
            error: err
         });
      }
      else {
        // new user with submitted details in body
         const user = new User({
            _id: new mongoose.Types.ObjectId(),
            username: req.body.username,
            email: req.body.email,
            password: hash
         });
         // save user after creating
         user.save().then(function(result) {
            res.status(200).json({
               success: 'New user has been created'
            });

            //create a JWT Token for the new user, signing the id and email of user
            const JWTToken = jwt.sign({
              email: user.email,
              _id: result._id
              },
              'secret123',
              {expiresIn: '7 days'}
            );
            return res.status(200).json({
              success: 'Welcome to the app',
              token: JWTToken
            });
         // catch error for new User
         }).catch(error => {
           console.log(error)
            res.status(500).json({
               error: err
            });
         }); // end of new User
      } // end of initial error handling
   }); // bcrypt
}); // signup

// route for logging in
router.post('/login', function(req, res){
   User.findOne({email: req.body.email})
   .exec()
   .then(user => {
     // compare the entered password with stored hash password
      bcrypt.compare(req.body.password, user.password, function(err, result){
         if(err) {
            return res.status(401).json({
               failed: 'Unauthorized Access'
            });
         }
         // if bcrypt compare returns true then sign a new JWT token
         if (result) {
           const JWTToken = jwt.sign({
             email: user.email,
             _id: user._id
             },
             'secret123',
             {expiresIn: '7 days'}
           );
           return res.status(200).json({
             success: 'Welcome to the app',
             token: JWTToken
           });
         }
         return res.status(401).json({
            failed: 'Unauthorized Access'
         });
      });
   })
   .catch(error => {
      res.status(500).json({
         error: error
      });
   });;
});

// save a favorite trip for the current user
router.post('/favtrip/:origin/:destination', checkAuth, (req, res) => {

    // console.log('LOGGED-IN USER:', req.current_user);

    res.json(req.current_user);
    User.findOne({email: req.current_user.email})
    .exec()
    .then(user => {
      user.favTrips.push(req.body.favTrip);
      user.save()
      res.json({saved: true});
    })
    .catch(error => {
      res.status(500).json({
        error: error
      });
    });

})

// GET a users favTrips
router.get('/favtrips', checkAuth, (req, res) => {
  User.findOne({email: req.current_user.email})
  .exec()
  .then(user => {
    console.log(user.favTrips)
    res.json(user.favTrips)
  })
  .catch(err => {
    res.status(500).json({
      error: err
    })
  })
});

// DELETE a particular favTrip
router.post('/deltrips', checkAuth, (req, res) => {

  // db.collection('users').update(
  //   { email: req.current_user.email},
  //   { $pull: { favTrips: { origin: req.body.origin, destination: req.body.destination } } },
  //   { multi: true }
  // )

  User.findOne({email: req.current_user.email})
  .exec()
  .then(user => {
    let favs = user.favTrips
    favs = favs.filter(trip => !(trip.origin === req.body.origin && trip.destination === req.body.destination) )
    user.favTrips = favs;
    user.save();
    res.json({saved: true});
  })
  .catch(error => {
    res.status(500).json({
      error: error
    });
  });

});



module.exports = router;
