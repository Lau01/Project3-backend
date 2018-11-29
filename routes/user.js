const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/auth')

const db = mongoose.connection;

router.post('/signup', function(req, res) {
   bcrypt.hash(req.body.password, 10, function(err, hash){
      if(err) {
        console.log(err)
         return res.status(500).json({
            error: err
         });
      }
      else {
         const user = new User({
            _id: new mongoose.Types.ObjectId(),
            username: req.body.username,
            email: req.body.email,
            password: hash
         });
         user.save().then(function(result) {
            console.log(result);
            // res.status(200).json({
            //    success: 'New user has been created'
            // });

            console.log('new user:', result);

            const JWTToken = jwt.sign({
              // username: user.username,
              email: user.email,
              _id: result._id
              },
              'secret123',
              {expiresIn: '2h'}
            );
            return res.status(200).json({
              success: 'Welcome to the app',
              token: JWTToken
            });


         }).catch(error => {
           console.log(error)
            res.status(500).json({
               error: err
            });
         });
      }
   });
});

router.post('/login', function(req, res){
   User.findOne({email: req.body.email})
   .exec()
   .then(user => {
      bcrypt.compare(req.body.password, user.password, function(err, result){
         if(err) {
            return res.status(401).json({
               failed: 'Unauthorized Access'
            });
         }
         if (result) {
           const JWTToken = jwt.sign({
             // username: user.username,
             email: user.email,
             _id: user._id
             },
             'secret123',
             {expiresIn: '2h'}
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

// save a favTrip
router.post('/favtrip/:origin/:destination', checkAuth, (req, res) => {

    console.log('LOGGED-IN USER:', req.current_user);

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

  db.collection('users').update(
    { email: req.current_user.email},
    { $pull: { favTrips: { origin: req.body.origin, destination: req.body.destination } } },
    { multi: true }
  )

    // console.log(user.favTrips)
    // console.log(req.body.origin)
    // console.log(req.body.destination)
});



module.exports = router;
