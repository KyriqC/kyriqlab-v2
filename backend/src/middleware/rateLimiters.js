const rateLimit = require('express-rate-limit');

// General API limiter (optional, mild)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,           // 1 minute
  max: 120,                      // 120 req/min per IP
  standardHeaders: true,
  legacyHeaders: false,
});

// Genius limiter (stricter)
const geniusLimiter = rateLimit({
  windowMs: 60 * 1000,           // 1 minute
  max: 25,                       // 25 req/min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit hit. Try again in a minute.' },
});

// Extra strict for imports (these trigger multiple outbound calls)
const geniusImportLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,      // 10 minutes
  max: 10,                       // 10 import requests / 10 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Import rate limit hit. Try again later.' },
});

module.exports = { apiLimiter, geniusLimiter, geniusImportLimiter };
