const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      min: 2,
      max: 150,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    body: {
      // Empty object means u can add any kind of data
      type: {},
      required: true,
      min: 200,
      max: 200000,
    },
    excerpt: {
      type: String,
      max: 1000,
    },
    mtitle: {
      type: String,
    },
    mdesc: {
      type: String,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    categories: [{ type: ObjectId, ref: 'Category', required: true }],
    tag: [{ type: ObjectId, ref: 'Tag', required: true }],
    postedBy: {
      type: ObjectId,
      ref: 'User',
    },
  },
  { timestamp: true }
);

module.exports = mongoose.model('Blog', BlogSchema);
