const jwt = require('jsonwebtoken');
const User = require('../models/user');

//default middleware arguments
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, 'secret123', {expiresIn: '7 days'});
    req.tokenData = decoded;

    User.findOne({_id: req.tokenData._id})
    .exec()
    .then(user => {
      // console.log('found User from token ID:', user)
      req.current_user = user;  // store user into req object, to be used by all route handlers that need it
      next();
    })
    .catch(err => {
      console.log(err);
      return console.log('User from token ID not found!', req.tokenData);
    });


  } catch (error) {
    console.log('ERROR', error);
    return res.status(401).json({
      message: 'Auth failed'
    });
  }
}
