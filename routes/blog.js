const express = require('express');
const router = express.Router();
const {
  create,
  list,
  listAll,
  read,
  remove,
  update,
  related,
} = require('../controllers/blog');
const { protect } = require('../middleware/auth');
const { adminMiddleware } = require('../controllers/auth');

router.post('/blog', protect, create);
router.get('/blog', list);
router.get('/blog-categories-tags', listAll);
router.post('/blog/:slug', read);
router.delete('/blog/:slug', protect, remove);
router.put('/blog/:slug', protect, update);
router.post('/blog/related', related);

module.exports = router;
