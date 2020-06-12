const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { read, update } = require('../controllers/user');

router.get('/profile', protect, read);
router.get('/user/:username', publicProfile);
router.put('/user/update', protect, update);

module.exports = router;
