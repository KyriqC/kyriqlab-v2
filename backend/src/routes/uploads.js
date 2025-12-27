// backend/src/routes/uploads.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { nanoid } = require('nanoid');

const asyncHandler = require('../middleware/asyncHandler');
const requireAdminKey = require('../middleware/requireAdminKey');

const router = express.Router();

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');

// ensure dirs exist
fs.mkdirSync(IMAGES_DIR, { recursive: true });

const allowedMime = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif'
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGES_DIR),
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    const safeExt = ext && ext.length <= 10 ? ext : '';
    cb(null, `${Date.now()}-${nanoid(10)}${safeExt}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    if (!allowedMime.has(file.mimetype)) {
      return cb(new Error('Only image uploads are allowed.'));
    }
    cb(null, true);
  }
});

// POST /api/uploads/image (protected)
router.post(
  '/image',
  requireAdminKey,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // public URL served by express static: /uploads/...
    const urlPath = `/uploads/images/${req.file.filename}`;
    res.json({ url: urlPath });
  })
);

module.exports = router;
