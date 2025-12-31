// backend/src/routes/uploads.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { nanoid } = require('nanoid'); // Keep using nanoid since you have it

const asyncHandler = require('../middleware/asyncHandler');
const requireAdminKey = require('../middleware/requireAdminKey');

const router = express.Router();

// 1. Setup Directories
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');
const DOCS_DIR = path.join(UPLOADS_DIR, 'docs'); // New folder for PDFs

// Ensure they exist
fs.mkdirSync(IMAGES_DIR, { recursive: true });
fs.mkdirSync(DOCS_DIR, { recursive: true });

// 2. Configure Storage
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    // Put PDFs in 'docs', images in 'images'
    if (file.mimetype === 'application/pdf') {
      cb(null, DOCS_DIR);
    } else {
      cb(null, IMAGES_DIR);
    }
  },
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    // Unique name: timestamp-randomID.extension
    cb(null, `${Date.now()}-${nanoid(10)}${ext}`);
  }
});

// 3. Configure Upload Filter (Allow Images AND PDFs)
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 
      'application/pdf' // <--- ALLOW PDF
    ];
    
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only Images and PDFs allowed.'));
    }
    cb(null, true);
  }
});

// --- ROUTES ---

// General Upload (Used by Reports page)
// POST /api/uploads
router.post(
  '/',
  requireAdminKey,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Determine subfolder for URL
    const folder = req.file.mimetype === 'application/pdf' ? 'docs' : 'images';
    
    // Return the public URL
    const urlPath = `/uploads/${folder}/${req.file.filename}`;
    res.json({ url: urlPath });
  })
);

// Image Specific Upload (Legacy support for other pages)
// POST /api/uploads/image
router.post(
  '/image',
  requireAdminKey,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    // Force image folder path
    // Note: The storage engine above automatically puts it in 'images' or 'docs' 
    // based on type, but this legacy route expects 'images' URL structure.
    const urlPath = `/uploads/images/${req.file.filename}`;
    res.json({ url: urlPath });
  })
);

module.exports = router;
