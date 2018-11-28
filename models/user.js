const mongoose = require('mongoose');

const user = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  // username: {
  //   type: String,
  //   required: true,
  //   minlength: 3
  // },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
});

module.exports = mongoose.model('User', user);
