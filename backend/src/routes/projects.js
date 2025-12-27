const express = require('express');
const Project = require('../models/Project');

const asyncHandler = require('../middleware/asyncHandler');
const requireAdminKey = require('../middleware/requireAdminKey');

const router = express.Router();

// List (supports ?status=published)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const items = await Project.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  })
);

// Get by slug
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const item = await Project.findOne({ slug: req.params.slug }).lean();
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  })
);

// Create (protected)
router.post(
  '/',
  requireAdminKey,
  asyncHandler(async (req, res) => {
    const created = await Project.create(req.body);
    res.status(201).json(created);
  })
);

// Update by slug (protected)
router.put(
  '/:slug',
  requireAdminKey,
  asyncHandler(async (req, res) => {
    const updated = await Project.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  })
);

// Delete by slug (protected)
router.delete(
  '/:slug',
  requireAdminKey,
  asyncHandler(async (req, res) => {
    const deleted = await Project.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  })
);

module.exports = router;

