const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const siteRoutes = require('./routes/siteRoutes');
const accountRoutes = require('./routes/accountRoutes');

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

app.use(express.json({ limit: '50kb' }));

// Lightweight request logging — no extra dependency needed
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

const isTestEnv = process.env.NODE_ENV === 'test';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
});

const accountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many account requests. Please try again later.' },
  skip: () => isTestEnv,
});

app.use('/api', limiter);
app.use('/api/accounts/create', accountLimiter);

app.use('/api/sites', siteRoutes);
app.use('/api/accounts', accountRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// 404 handler — clean JSON for unknown routes instead of default HTML
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler — never leak stack traces
app.use((err, req, res, next) => {
  console.error('[Unhandled]', err.message);
  res.status(500).json({ success: false, message: 'Something went wrong.' });
});

module.exports = app;