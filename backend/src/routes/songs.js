const express = require('express');
const Song = require('../models/Song');

const asyncHandler = require('../middleware/asyncHandler');
const requireAdminKey = require('../middleware/requireAdminKey');

const router = express.Router();

/**
 * GET /api/songs
 * Query:
 *  - artist=ArtistName
 *  - genre=Hip-Hop
 *  - q=searchTerm (title/artist/lyrics)
 *  - active=true|false (for game filtering)
 *  - page=1..n
 *  - limit=1..100 (default 50)
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { artist, genre, q, active, page = '1', limit = '50' } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

    const filter = {};
    
    if (artist && artist !== 'All') {
      filter.artist = artist;
    }
    
    if (genre && genre !== 'All') {
      filter.genre = genre;
    }
    
    if (active === 'true') filter.isActive = true;
    if (active === 'false') filter.isActive = false;

    if (q && q.trim()) {
      const term = q.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { artist: { $regex: term, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Song.find(filter)
        .select('-lyrics') // Don't send lyrics in list view (save bandwidth)
        .sort({ artist: 1, title: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Song.countDocuments(filter)
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

/**
 * GET /api/songs/artists
 * Returns list of unique artists for filtering
 */
router.get(
  '/artists',
  asyncHandler(async (req, res) => {
    const artists = await Song.distinct('artist');
    res.json(artists.sort());
  })
);

/**
 * GET /api/songs/genres
 * Returns list of unique genres for filtering
 */
router.get(
  '/genres',
  asyncHandler(async (req, res) => {
    const genres = await Song.distinct('genre');
    res.json(genres.sort());
  })
);

/**
 * GET /api/songs/random
 * Get random songs for the game
 * Query:
 *  - artist=ArtistName (optional filter)
 *  - count=10 (how many songs)
 */
router.get(
  '/random',
  asyncHandler(async (req, res) => {
    const { artist, count = '10' } = req.query;
    const countNum = Math.min(Math.max(parseInt(count, 10) || 10, 1), 100);

    const filter = { isActive: true };
    if (artist && artist !== 'All') {
      filter.artist = artist;
    }

    // Use MongoDB aggregation for random sampling
    const songs = await Song.aggregate([
      { $match: filter },
      { $sample: { size: countNum } },
      { $project: { title: 1, artist: 1, lyrics: 1, album: 1, coverUrl: 1 } }
    ]);

    res.json(songs);
  })
);

/**
 * GET /api/songs/:id
 * Get single song with full details including lyrics
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const song = await Song.findById(req.params.id).lean();
    if (!song) return res.status(404).json({ error: 'Song not found' });
    res.json(song);
  })
);

/**
 * POST /api/songs (protected)
 * Create a new song
 */
router.post(
  '/',
  requireAdminKey,
  asyncHandler(async (req, res) => {
    const { title, artist, lyrics, year, genre, album, geniusId, coverUrl } = req.body;

    if (!title || !artist) {
      return res.status(400).json({ error: 'Title and artist are required' });
    }

    // Check for duplicate
    const existing = await Song.findOne({ 
      title: { $regex: `^${title}$`, $options: 'i' },
      artist: { $regex: `^${artist}$`, $options: 'i' }
    });
    
    if (existing) {
      return res.status(409).json({ error: 'Song already exists', existing });
    }

    const song = await Song.create({
      title,
      artist,
      lyrics: lyrics || '',
      year: year || 'Unknown',
      genre: genre || 'Hip-Hop',
      album: album || '',
      geniusId: geniusId || '',
      coverUrl: coverUrl || '',
    });

    res.status(201).json(song);
  })
);

/**
 * POST /api/songs/bulk (protected)
 * Create multiple songs at once (for album imports)
 */
router.post(
  '/bulk',
  requireAdminKey,
  asyncHandler(async (req, res) => {
    const { songs } = req.body;

    if (!Array.isArray(songs) || songs.length === 0) {
      return res.status(400).json({ error: 'Songs array is required' });
    }

    const results = {
      created: 0,
      skipped: 0,
      errors: []
    };

    for (const songData of songs) {
      try {
        const { title, artist } = songData;
        
        if (!title || !artist) {
          results.errors.push({ song: songData, error: 'Missing title or artist' });
          continue;
        }

        // Check for duplicate
        const existing = await Song.findOne({
          title: { $regex: `^${title}$`, $options: 'i' },
          artist: { $regex: `^${artist}$`, $options: 'i' }
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        await Song.create({
          title,
          artist,
          lyrics: songData.lyrics || '',
          year: songData.year || 'Unknown',
          genre: songData.genre || 'Hip-Hop',
          album: songData.album || '',
          geniusId: songData.geniusId || '',
          coverUrl: songData.coverUrl || '',
        });

        results.created++;
      } catch (err) {
        results.errors.push({ song: songData.title, error: err.message });
      }
    }

    res.json(results);
  })
);

/**
 * PUT /api/songs/:id (protected)
 * Update a song
 */
router.put(
  '/:id',
  requireAdminKey,
  asyncHandler(async (req, res) => {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!song) return res.status(404).json({ error: 'Song not found' });
    res.json(song);
  })
);

/**
 * DELETE /api/songs/:id (protected)
 * Delete a song
 */
router.delete(
  '/:id',
  requireAdminKey,
  asyncHandler(async (req, res) => {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ error: 'Song not found' });
    res.json({ ok: true });
  })
);

module.exports = router;
