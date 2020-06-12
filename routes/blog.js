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
  listSearch,
} = require('../controllers/blog');
const { protect } = require('../middleware/auth');
const { adminMiddleware } = require('../controllers/auth');
const { canUpdateDelete } = require('../controllers/auth');

router.post('/blog', protect, create);
router.get('/blog', list);
router.get('/blog-categories-tags', listAll);
router.post('/blog/:slug', read);
router.delete('/blog/:slug', protect, remove);
router.put('/blog/:slug', protect, update);
router.post('/blog/related', related);
router.get('/blogs/search', listSearch);

router.post('/user/blog', protect, create);
router.delete('/user/blog/:slug', protect, canUpdateDelete, remove);
router.put('/user/blog/:slug', protect, canUpdateDelete, update);

module.exports = router;
