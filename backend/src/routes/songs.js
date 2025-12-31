const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const requireAdminKey = require('../middleware/requireAdminKey');
const controller = require('../controllers/songController');

// --- 1. SPECIFIC LISTS (MUST BE FIRST) ---
router.get('/artists', asyncHandler(controller.getArtists));
router.get('/genres', asyncHandler(controller.getGenres));
router.get('/albums', asyncHandler(controller.getAlbums));
router.get('/years', asyncHandler(controller.getYears));

// --- 2. GAME LOGIC ---
router.get('/random', asyncHandler(controller.getRandom));

// --- 3. MAIN LIST ---
router.get('/', asyncHandler(controller.getSongs));

// --- 4. ADMIN ACTIONS ---
router.post('/', requireAdminKey, asyncHandler(controller.createSong));
router.post('/bulk', requireAdminKey, asyncHandler(controller.bulkCreateSongs));

// --- 5. ID ROUTES (MUST BE LAST) ---
router.get('/:id', asyncHandler(controller.getSongById));
router.put('/:id', requireAdminKey, asyncHandler(controller.updateSong));
router.delete('/:id', requireAdminKey, asyncHandler(controller.deleteSong));

module.exports = router;
