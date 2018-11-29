const mongoose = require('mongoose');

const user = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  favTrips: [{
    origin: {
      type: String,
      minLength: 2
    },
    destination: {
      type: String,
      minLength: 2
    },
  }]
});

module.exports = mongoose.model('User', user);
