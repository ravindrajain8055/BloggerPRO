const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { create, list, read, remove } = require('../controllers/category');
const { categoryCreateValidator } = require('../validators/auth');
const { runValidation } = require('../validators/index');
const { adminMiddleware } = require('../controllers/auth');

router.post(
  '/category',
  protect,
  adminMiddleware,
  runValidation,
  categoryCreateValidator,
  create
);

router.get('/categories', list);
router.get('/category/:slug', read);
router.delete('/category/:slug', protect, adminMiddleware, remove);

module.exports = router;
