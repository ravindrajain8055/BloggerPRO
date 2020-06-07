const User = require('../model/User');

exports.read = (req, res) => {
  return res.json(req.user);
};
