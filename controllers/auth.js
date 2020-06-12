const User = require('../model/User');
const shortId = require('shortid');
// const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');
// This will help us check if the token has expired or if it is valid
const expressJwt = require('express-jwt');
const { errorHandler } = require('../middleware/errorHandler');
const { OAuth2Client } = require('google-auth-library');

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
    user: user,
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

exports.adminMiddleware = (req, res, next) => {
  const adminUserId = req.user.id;
  User.findById({ _id: adminUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }

    if (user.role !== 1) {
      return res.status(400).json({
        error: 'Admin resource,Access denied',
      });
    }
    req.profile = user;
    next();
  });
};

exports.canUpdateDelete = (req, res, next) => {
  const slug = req.params.slug;
  Blog.findOne({ slug }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    if (data.postedBy._id.toString() === req.user.id.toString()) {
      user = req.user;
    }
    if (!user) {
      return res.status(400).json({
        error: 'Not Authorised',
      });
    }
    next();
  });
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
  const idToken = req.body.tokenId;
  client.verifyIdToken(
    { idToken, audience: process.env.GOOGLE_CLIENT_ID }.then(res => {
      const { email_verified, name, email, jti } = res.payload;
      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: '60d',
            });
            res.cookie('token', token, { expiresIn: '60d' });
            const { _id, email, name, role, username } = user;
            return res.json({
              token,
              user: { _id, email, name, role, username },
            });
          } else {
            let username = shortId.generate();
            let profile = `${process.env.CLIENT_URL}/profile/${username}`;
            let password = jti;
            user = new User({ name, email, profile, username, profile });

            user.save((err, data) => {
              if (err) {
                return res.status(400).json({
                  error: errorHandler(err),
                });
              }

              const token = jwt.sign(
                { _id: data._id },
                process.env.JWT_SECRET,
                {
                  expiresIn: '60d',
                }
              );
              res.cookie('token', token, { expiresIn: '60d' });
              const { _id, email, name, role, username } = data;
              return res.json({
                token,
                user: { _id, email, name, role, username },
              });
            });
          }
        });
      } else {
        return res.status(400).json({
          error: 'Google Login failed, Try aagain ',
        });
      }
    })
  );
};
