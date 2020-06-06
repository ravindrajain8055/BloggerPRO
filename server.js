const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

dotenv.config({ path: "./config/config.env" });

const app = express();

connectDB();
// routes
app.use('/', require('./routes/blog'))

// Body parser
app.use(express.json());
// cors
if (process.env.NODE_ENV == "development") {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.listen(PORT);
