const express = require('express');
const router = express.Router();
const { signup, signin, signout } = require('../controllers/auth');
const { userSignupValidator } = require('../validators/auth');
const { userSigninValidator } = require('../validators/auth');
const { runValidation } = require('../validators/index');

router.route('/signup').post(userSignupValidator, runValidation, signup);
router.route('/signin').post(userSigninValidator, runValidation, signin);
router.route('/signout').get(signout);

router.get('/login', (req, res) => {
  res.json({ success: true });
});

module.exports = router;
