const User = require('../model/User');
const shortId = require('shortid');
// const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');
// This will help us check if the token has expired or if it is valid
const expressJwt = require('express-jwt');

// access public
// route POST /api/signup
exports.signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({
      error: 'User already Exists',
    });
  }

  let username = shortId.generate();
  let profile = `${process.env.CLIENT_URL}/profile/${username}`;
  let newUser = new User({ name, email, password, profile, username });

  newUser.save((err, user) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.status(200).json({ message: 'signup success', user: user });

    sendTokenResponse(user, 200, res);
  });
};

// access public
// route POST /api/signin
exports.signin = async (req, res, next) => {
  const { email, password } = req.body;
  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      error: 'User with that email does not exist',
    });
  }
  // Authenticate
  if (!user.authenticate(password)) {
    return res.status(400).json({
      error: 'Email & password do not match',
    });
  }

  sendTokenResponse(user, 200, res);
};

// Create Token, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Generate a JWT
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '60d',
  });

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.signout = (req, res, next) => {
  res.clearCookie('token');

  res.status(200).json({
    message: 'Signout Success',
  });
};
