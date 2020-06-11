const { check } = require('express-validator');

exports.userSignupValidator = [
  check('name').not().isEmpty().withMessage('Name is Required'),
  check('email').isEmail().withMessage('Enter a Valid email address'),
  check('password')
    .isLength({ min: 7 })
    .withMessage('Enter a Valid email address'),
];

exports.userSigninValidator = [
  check('email').isEmail().withMessage('Enter a Valid email address'),
  check('password')
    .isLength({ min: 7 })
    .withMessage('Enter a Valid email address'),
];

exports.categoryCreateValidator = [
  check('name').not().isEmpty().withMessage('Name is Required'),
];

exports.tagCreateValidator = [
  check('name').not().isEmpty().withMessage('Name is Required'),
];
