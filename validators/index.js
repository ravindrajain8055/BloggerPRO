const { validationResult } = require("express-validator");

exports.runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // [0] so that as soon as we get an error just give that no need to loop through errors
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};
