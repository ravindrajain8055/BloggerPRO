const Blog = require('../model/Blog');
const formidable = require('formidable');
const slugify = require('slugify');
const stripHtml = require('string-strip-html');
const _ = require('lodash');
const Category = require('../model/category');
const Tag = require('../model/Tag');
const fs = require('fs');
const { errorHandler } = require('../middleware/errorHandler');

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'image did not upload',
      });
    }

    const { title, body, categories, tags } = fields;

    if (!title) {
      return res.status(400).json({
        error: 'title is required',
      });
    }

    if (!body) {
      return res.status(400).json({
        error: 'Body is required',
      });
    }

    if (!categories || categories.length === 0) {
      return res.status(400).json({
        error: 'Categories is required',
      });
    }

    if (!tags || tags.length === 0) {
      return res.status(400).json({
        error: 'Tags is required',
      });
    }

    let blog = new Blog();
    blog.title = title;
    blog.body = body;
    blog.slug = slugify(title).toLowerCase();
    blog.mtitle = `${title} || ${process.env.APP_NAME}`;
    blog.mdesc = stripHtml(body.substring(0, 160));
    blog.postedBy = req.user._id;

    let arrayc = categories && categories.split(',');
    let arrayt = tags && tags.split(',');

    if (files.photo) {
      if (files.photo.size > 10000000) {
        return res.status(400).json({
          error: 'Image should be less than 1mb size',
        });
      }
      blog.photo.data = fs.readFileSync(files.photo.path);
      blog.photo.contentType = files.photo.type;
    }

    blog.save((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }

      Blog.findByIdAndUpdate(
        result._id,
        { $push: { categories: arrayc } },
        { new: true }
      ).exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        } else {
          Blog.findByIdAndUpdate(
            result._id,
            { $push: { tags: arrayt } },
            { new: true }
          ).exec((err, data) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler(err),
              });
            } else {
              res.json(data);
            }
          });
        }
      });
    });
  });
};

exports.list = async (req, res) => {
  Blog.find({})
    .populate('categories', '_id name slug')
    .populate('tags', 'id name slug')
    .populate('postedBy', 'id name username')
    .select('-photo')
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }

      res.json(data);
    });
};

exports.listAll = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;

  let blogs;
  let categories;
  let tags;

  Blog.find({})
    .populate('categories', '_id name slug')
    .populate('tags', 'id name slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('postedBy', 'id name username')
    .select('-photo')
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }

      blogs = data;

      Category.find({}).exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }

        categories = data;
      });

      Tag.find({}).exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }

        tags = data;

        res.json({
          blogs,
          categories,
          tags,
          size: blogs.length,
        });
      });
    });
};

exports.read = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Blogs.findOne({ slug })
    .populate('categories', '_id name slug')
    .populate('tags', 'id name slug')
    .populate('postedBy', 'id name username')
    .select('-photo')
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }

      res.json(data);
    });
};

exports.remove = (req, res) => {
  const slug = req.params.slug;

  Blog.findOneAndRemove({ slug }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }

    res.json({
      message: 'Blog deleted succesfully',
    });
  });
};

exports.update = (req, res) => {
  const slug = req.params.slug;

  Blog.findOne({ slug }).exec((err, oldData) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    let form = new formidable.IncomingForm();

    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: 'image did not upload',
        });
      }

      let slugBM = oldData.slug;
      oldData = _.merge(oldData, fields);
      oldData.slug = slugBM;

      const { body, desc, categories, tags } = fields;

      if (categories) {
        oldData.categories = categories.split(',');
      }

      if (tags) {
        oldData.tags = tags.split(',');
      }

      if (files.photo) {
        if (files.photo.size > 10000000) {
          return res.status(400).json({
            error: 'Image should be less than 1mb size',
          });
        }
        oldData.photo.data = fs.readFileSync(files.photo.path);
        oldData.photo.contentType = files.photo.type;
      }

      oldData.save((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        res.json(data);
      });
    });
  });
};

exports.related = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;

  const { _id, category } = req.body;

  Blog.find({ _id: { $ne: _id }, categories: { $in: categories } })
    .limit(limit)
    .populate('postedBy', '_id name profile')
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }

      res.json(data);
    });
};
