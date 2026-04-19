const express = require('express');
const cors = require('cors');
const helmet= require('helmet');
const morgan= require('morgan');

const authRoutes= require('./routes/auth');
const listingRoutes= require('./routes/listings');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:4200' }));
app.use(morgan('dev'));
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/listings', listingRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;