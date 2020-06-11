const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

dotenv.config({ path: './config/config.env' });

const app = express();

connectDB();
// a Logger middleware
app.use(morgan('dev'));
app.use(express.json());

// security
app.use(mongoSanitize());
// set security headers
app.use(helmet());

app.use(xss());
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000,
});

app.use(limiter);
// http parameter pollution attacks
app.use(hpp());
// routes
app.use('/api', require('./routes/blog'));
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/user'));
app.use('/api', require('./routes/category'));
app.use('/api', require('./routes/tag'));

// CORS (Cross-Origin resource sharing)
if (process.env.NODE_ENV == 'development') {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.listen(PORT);
