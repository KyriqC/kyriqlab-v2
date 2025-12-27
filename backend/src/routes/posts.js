const express = require('express');
const Post = require('../models/Post');

const asyncHandler = require('../middleware/asyncHandler');
const requireAdminKey = require('../middleware/requireAdminKey');

const router = express.Router();

/**
 * GET /api/posts
 * Query:
 *  - status=draft|published|archived
 *  - tag=infra
 *  - featured=true|false
 *  - q=searchTerm (title/summary/content)
 *  - page=1..n
 *  - limit=1..100 (default 10)
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, tag, featured, q, page = '1', limit = '10' } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const filter = {};
    if (status) filter.status = status;
    if (tag) filter.tags = tag;
    if (featured === 'true') filter.featured = true;
    if (featured === 'false') filter.featured = false;

    if (q && q.trim()) {
      const term = q.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { summary: { $regex: term, $options: 'i' } },
        { content: { $regex: term, $options: 'i' } }
      ];
    }

    const sort =
      status === 'published'
        ? { publishedAt: -1, createdAt: -1 }
        : { updatedAt: -1 };

    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Post.countDocuments(filter)
    ]);

    res.json({
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      items
    });
  })
);

// GET /api/posts/:slug
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const item = await Post.findOne({ slug: req.params.slug }).lean();
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  })
);

// POST /api/posts (protected)
router.post(
  '/',
  requireAdminKey,
  asyncHandler(async (req, res) => {
    const created = await Post.create(req.body);
    res.status(201).json(created);
  })
);

// PUT /api/posts/:slug (protected)
router.put(
  '/:slug',
  requireAdminKey,
  asyncHandler(async (req, res) => {
    const updated = await Post.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'Not found' });

    res.json(updated);
  })
);

// DELETE /api/posts/:slug (protected)
router.delete(
  '/:slug',
  requireAdminKey,
  asyncHandler(async (req, res) => {
    const deleted = await Post.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  })
);

module.exports = router;
