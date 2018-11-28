const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

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
            // username: req.body.username,
            email: req.body.email,
            password: hash
         });
         user.save().then(function(result) {
            console.log(result);
            res.status(200).json({
               success: 'New user has been created'
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
   .then(function(user) {
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

router.post('/favtrip/:origin/:destination', (req, res) => {
    console.log(req.params.origin)
    console.log(req.params.destination)

    
})



module.exports = router;
