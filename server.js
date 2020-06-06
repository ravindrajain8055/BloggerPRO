const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const morgan = require('morgan');

dotenv.config({ path: './config/config.env' });

const app = express();

connectDB();

app.use(morgan('dev'));
app.use(express.json());
// routes
app.use('/api', require('./routes/blog'));
app.use('/api', require('./routes/auth'));

// CORS (Cross-Origin resource sharing)
if (process.env.NODE_ENV == 'development') {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.listen(PORT);
