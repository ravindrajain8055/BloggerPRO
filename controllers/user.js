const User = require('../model/User');
const Blog = require('../model/Blog');
const errorHanndler = require('../middleware/errorHandler');
const _ = require('loadash');
const formidable = require('formidable');
const fs = require('fs');

exports.read = (req, res) => {
  return res.json(req.user);
};

exports.publicProfile = (req, res) => {
  let username = req.params.username;
  let user;
  let blogs;

  User.findOne({ username }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: 'USer not found',
      });
    }

    user = data;
    let userId = user._id;
    Blog.find({ postedBy: userId })
      .populate('categories', '_id name slug')
      .populate('tags', '_id name slug')
      .populate('postedBy', '_id name')
      .limit(10)
      .select('-photo -body')
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHanndler(err),
          });
        }

        user.photo = undefined;
        res.json({ user, blogs: data });
      });
  });
};

exports.update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'Cannot update',
      });
    }

    let user = req.user;
    user = _.extend(user, fields);

    if (files.photo) {
      if (files.photo.size > 10000000) {
        return res.status(400).json({
          error: 'Image cannot be bigger than 1 mb',
        });
      }
      user.photo.data = fs.readFileSync(files.photo.path);
      user.photo.contentType = files.photo.type;

      user.save((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHanndler(err),
          });
        }
        user.hashed_password = undefined;
        user.salt = undefined;
        user.photo = undefined;
        res.json(data);
      });
    }
  });
};
