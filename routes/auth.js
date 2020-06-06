const express = require("express");
const router = express.Router();
const { signup } = require("../controllers/auth");
const { runValidation } = require("../validators/index");
const { userSignValidator } = require("../validators/auth");

router.route("/signup").post(userSignValidator, runValidation, signup);

module.exports = router;
