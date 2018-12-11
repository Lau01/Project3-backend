const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware for checking authentication
module.exports = (req, res, next) => {
  try {
    // From the axios request header, take the token string without "Bearer"
    const token = req.headers.authorization.split(" ")[1];
    // Decode the JWT token using jwt.verify.
    const decoded = jwt.verify(token, 'secret123', {expiresIn: '7 days'});
    req.tokenData = decoded;

    // Find the user with the specific token
    User.findOne({_id: req.tokenData._id})
    .exec()
    .then(user => {
      // store user into req object, to be used by all route handlers that need it
      req.current_user = user;
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
  } // end of try/catch block
}
