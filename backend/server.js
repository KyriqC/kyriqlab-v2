// backend/server.js
require('dotenv').config();

const { apiLimiter } = require('./src/middleware/rateLimiters');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const authRoutes = require('./src/routes/auth');

const connectMongo = require('./src/db/connectMongo');
const postsRoutes = require('./src/routes/posts');
const songsRoutes = require('./src/routes/songs');
const uploadsRoutes = require('./src/routes/uploads');
const geniusRoutes = require('./src/routes/genius');

const app = express();

// Security - configure helmet to allow images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

app.use(cors());
app.use(morgan('dev'));


// Allow up to 20MB uploads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(apiLimiter);


// Serve uploads folder publicly
const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));
console.log(`Uploads served at /uploads from ${uploadsDir}`);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'kyriqlab-api',
    db: process.env.MONGO_DB || 'kyriqlab',
    host: (process.env.MONGO_URI || '').split('@').pop() || 'mongo',
    time: new Date().toISOString()
  });
});

app.set('trust proxy', 1);
// API Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/posts', postsRoutes);
app.use('/api/songs', songsRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/genius', geniusRoutes);
app.use('/api/reports', require('./src/routes/reports'));

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Error:', err.message);
  const msg = err?.message || 'Server error';
  const status = err?.status || 400;
  res.status(status).json({ error: msg });
});

const PORT = process.env.PORT || 3100;

(async () => {
  await connectMongo(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const server = app.listen(PORT, () =>
    console.log(`kyriqlab-api listening on :${PORT}`)
  );

  server.requestTimeout = 10 * 60 * 1000;  // 10 min
  server.headersTimeout = 11 * 60 * 1000; // must be > requestTimeout
})();
