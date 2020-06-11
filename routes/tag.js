const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { create, list, read, remove } = require('../controllers/tag');
const { tagCreateValidator } = require('../validators/auth');
const { runValidation } = require('../validators/index');
const { adminMiddleware } = require('../controllers/auth');

router.post(
  '/category',
  protect,
  adminMiddleware,
  runValidation,
  tagCreateValidator,
  create
);

router.get('/tags', list);
router.get('/tag/:slug', read);
router.delete('/tag/:slug', protect, adminMiddleware, remove);

module.exports = router;
