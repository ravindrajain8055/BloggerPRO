const User = require('../model/User');
const shortId = require('shortid');
// const ErrorResponse = require('../utils/errorResponse');

exports.signup = (req, res, next) => {
  const { name, email, password } = req.body;

  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(401).json({
        message: 'User already exists',
      });
    }

    let username = shortId.generate();
    let profile = `${process.env.CLIENT_URL}/profile/${username}`;
    let newUser = new User({ name, email, password, profile, username });

    newUser.save((err, success) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.status(200).json({ message: 'signup success', user: success });
    });
  });
};
