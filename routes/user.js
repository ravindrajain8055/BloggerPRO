const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { read } = require('../controllers/user');

router.get('/profile', protect, read);

module.exports = router;
