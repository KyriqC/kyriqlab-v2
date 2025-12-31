const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const requireAdminKey = require('../middleware/requireAdminKey');
const asyncHandler = require('../middleware/asyncHandler');

// PUBLIC: Get All Published Reports
router.get('/', asyncHandler(async (req, res) => {
  const reports = await Report.find({ published: true }).sort({ date: -1 });
  res.json(reports);
}));

// PUBLIC: Get Single Report
router.get('/:id', asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json(report);
}));

// ADMIN: Create New Report
router.post('/', requireAdminKey, asyncHandler(async (req, res) => {
  const { title, description, pdfUrl, coverImage, published } = req.body;
  
  const report = await Report.create({
    title,
    description,
    pdfUrl,
    coverImage,
    published: published === true || published === 'true'
  });
  
  res.status(201).json(report);
}));

// ADMIN: Delete Report
router.delete('/:id', requireAdminKey, asyncHandler(async (req, res) => {
  await Report.findByIdAndDelete(req.params.id);
  res.json({ success: true });
}));

module.exports = router;
