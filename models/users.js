const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs')

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      // returns true if email else false from validator package
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fav_trips: [{
    name: String,
    origin: {
      lat: String,
      lon: String
    },
    destination: {
      lat: String,
      lon: String
    },
  }],
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// pre saving a user, this code runs to hash pw before saving. next() needs to be an argument and called inside function for middleware to continue
UserSchema.pre('save', function(next) {
  const user = this;

  // checks if pw is changed when user data is updated. isModified returns true or false if password if modified
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

UserSchema.methods.generateAuthToken = function() {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({_id: user._id.toHexString(), access: access}, 'secret123', {expiresIn: '24h'}).toString();

  // put token inside the token array
  user.tokens = user.tokens.concat([{access, token}]);

  user.save()
  .then( () => {
    return token;
  });
};

const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;

// module.exports.createUser = function (newUser, callback) {
//
// }
