const express = require('express');
const { geniusLimiter, geniusImportLimiter } = require('../middleware/rateLimiters');
const asyncHandler = require('../middleware/asyncHandler');
const requireAdminKey = require('../middleware/requireAdminKey');

const router = express.Router();

// Genius API base URL
const GENIUS_API = 'https://api.genius.com';
const GENIUS_TOKEN = process.env.GENIUS_ACCESS_TOKEN || '';

// Helper to make Genius API requests
async function geniusRequest(endpoint, params = {}) {
  if (!GENIUS_TOKEN) {
    throw new Error('GENIUS_ACCESS_TOKEN not configured');
  }

  const url = new URL(`${GENIUS_API}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${GENIUS_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Genius API error: ${res.status}`);
  }

  return res.json();
}

// Helper to clean lyrics text
function cleanLyrics(rawLyrics) {
  if (!rawLyrics) return '';
  
  let lyrics = rawLyrics
    // Remove the data-lyrics-container HTML artifacts
    .replace(/data-lyrics-container="true"[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    // Remove common Genius artifacts
    .replace(/\d+\s*Contributors?/gi, '')
    .replace(/Translations?/gi, '')
    .replace(/You might also like/gi, '')
    .replace(/See [^\n]+ Live/gi, '')
    .replace(/Get tickets as low as \$\d+/gi, '')
    .replace(/Embed/gi, '')
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();

  return lyrics;
}

// Helper to extract lyrics from Genius page
async function fetchLyrics(songUrl) {
  try {
    const res = await fetch(songUrl, {
      headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://genius.com/',
  'Origin': 'https://genius.com',
  'DNT': '1',
  'Connection': 'keep-alive',
      }
    });
    if (!res.ok) return '';

    const html = await res.text();
    
    // Extract all text between lyrics containers
    const containerRegex = /data-lyrics-container="true"[^>]*>([\s\S]*?)(?=<div|$)/gi;
    let match;
    const parts = [];
    
    while ((match = containerRegex.exec(html)) !== null) {
      parts.push(match[1]);
    }
    
    let lyrics = '';
    if (parts.length > 0) {
      lyrics = parts.join('\n');
    } else {
      const lyricsMatch = html.match(/class="Lyrics__Container[^"]*"[^>]*>([\s\S]*?)<\/div>/gi);
      if (lyricsMatch) {
        lyrics = lyricsMatch.join('\n');
      }
    }
    
    // Clean up the lyrics
    lyrics = lyrics
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1')
      .replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1')
      .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '$1')
      .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '$1');
    
    return cleanLyrics(lyrics);
  } catch (e) {
    console.error('Failed to fetch lyrics:', e.message);
    return '';
  }
}

// GET /api/genius/search - Search for songs
router.get(
  '/search',
  requireAdminKey, geniusLimiter,
  asyncHandler(async (req, res) => {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const data = await geniusRequest('/search', { q });
    
    const results = (data.response?.hits || []).map(hit => ({
      id: hit.result.id,
      title: hit.result.title,
      artist: hit.result.primary_artist?.name || 'Unknown',
      thumbnail: hit.result.song_art_image_thumbnail_url,
      url: hit.result.url,
      releaseDate: hit.result.release_date_for_display,
    }));

    res.json(results);
  })
);

// GET /api/genius/song/:id - Get full song details
router.get(
  '/song/:id',
  requireAdminKey,geniusLimiter,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const data = await geniusRequest(`/songs/${id}`);
    const song = data.response?.song;

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const lyrics = await fetchLyrics(song.url);

    res.json({
      id: song.id,
      title: song.title,
      artist: song.primary_artist?.name || 'Unknown',
      album: song.album?.name || '',
      year: song.release_date_for_display?.split(',').pop()?.trim() || 'Unknown',
      coverUrl: song.song_art_image_url || song.album?.cover_art_url || '',
      lyrics,
      geniusUrl: song.url,
    });
  })
);



// GET /api/genius/albums/search - Album search via Genius web "multi" search (reliable)
router.get(
  '/albums/search',
  requireAdminKey, geniusLimiter,
  asyncHandler(async (req, res) => {
    const rawQ = (req.query.q || '').toString().trim();
    if (!rawQ) return res.status(400).json({ error: 'Search query required' });

    const norm = (s) =>
      (s || '')
        .toString()
        .toLowerCase()
        .replace(/[’']/g, "'")
        .replace(/[^a-z0-9\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const qNorm = norm(rawQ);
    const qTokens = qNorm.split(' ').filter(Boolean);

    const badAlbumWords = [
      'mixtape','mix tape','playlist','karaoke','instrumental','tribute','cover',
      'remix','version','live','edit','demo','freestyle','session','podcast',
      'audiobook','soundtrack','ost','score','reaction','vol','volume'
    ];
    const looksBad = (nameN) => badAlbumWords.some(w => nameN.includes(w));

    function scoreAlbum(name, artist) {
      const nameN = norm(name);
      const artistN = norm(artist);
      let score = 0;

      for (const t of qTokens) {
        if (t.length < 3) continue;
        if (nameN.includes(t)) score += 4;
        if (artistN.includes(t)) score += 2;
      }
      if (nameN.includes(qNorm)) score += 8;
      if (looksBad(nameN)) score -= 12;
      return score;
    }

    async function fetchJsonWithTimeout(url, ms = 4000) {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), ms);
      try {
        const r = await fetch(url, {
          signal: ac.signal,
          headers: {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',

  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',

  'Referer': 'https://genius.com/',
  'Origin': 'https://genius.com',

  'DNT': '1',
  'Connection': 'keep-alive',
}
,
        });

        if (!r.ok) throw new Error(`Genius web API error: ${r.status}`);
        return await r.json();
      } finally {
        clearTimeout(t);
      }
    }

    const url = new URL('https://genius.com/api/search/multi');
    url.searchParams.set('q', rawQ);

    let data;
    try {
      data = await fetchJsonWithTimeout(url.toString(), 4000);
    } catch (e) {
      console.error('albums/search failed:', e?.message || e);
      return res.json([]);
    }

    const sections = data?.response?.sections || [];

    // Pull album results from ALL sections (top_hit + album + etc)
    const albumHits = [];
    for (const s of sections) {
      for (const h of (s?.hits || [])) {
        const r = h?.result;
        const isAlbum =
          h?.type === 'album' ||
          h?.index === 'album' ||
          r?._type === 'album';

        if (isAlbum && r?.id) albumHits.push(h);
      }
    }

    const hits = albumHits.slice(0, 20);

    const out = [];
    const seen = new Set();

    for (const h of hits) {
      const r = h?.result;
      if (!r?.id) continue;

      const key = String(r.id);
      if (seen.has(key)) continue;
      seen.add(key);

      const name = r.name || r.title || '';
      const artist =
        r.artist?.name ||
        r.primary_artist?.name ||
        r.primary_artist_names ||
        (r.full_title ? r.full_title.split(' by ').pop() : 'Unknown') ||
        'Unknown';

      out.push({
        id: r.id,
        name,
        artist,
        coverUrl: r.cover_art_url || r.cover_art_thumbnail_url || r.header_image_url || '',
        releaseDate: r.release_date_for_display || null,
        url: r.url || null,
        _score: scoreAlbum(name, artist),
      });
    }

    const albums = out
      .sort((a, b) => (b._score || 0) - (a._score || 0))
      .slice(0, 10)
      .map(({ _score, ...pub }) => pub);

    res.json(albums);
  })
);




// GET /api/genius/album/:id - Get album tracks
router.get(
  '/album/:id',
  requireAdminKey, geniusLimiter,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const albumData = await geniusRequest(`/albums/${id}`);
    const album = albumData.response?.album;

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    const tracksData = await geniusRequest(`/albums/${id}/tracks`, { per_page: 50 });
    const tracks = (tracksData.response?.tracks || []).map(track => ({
      id: track.song.id,
      title: track.song.title,
      artist: track.song.primary_artist?.name || album.artist?.name || 'Unknown',
      trackNumber: track.number,
    }));

    res.json({
      id: album.id,
      name: album.name,
      artist: album.artist?.name || 'Unknown',
      coverUrl: album.cover_art_url,
      releaseDate: album.release_date_for_display,
      year: album.release_date_for_display?.split(',').pop()?.trim() || 'Unknown',
      tracks,
    });
  })
);

// POST /api/genius/import-song - Import single song
router.post(
  '/import-song',
  requireAdminKey, geniusLimiter,
  asyncHandler(async (req, res) => {
    const { geniusId, genre = 'Hip-Hop' } = req.body;

    if (!geniusId) {
      return res.status(400).json({ error: 'Genius song ID required' });
    }

    const data = await geniusRequest(`/songs/${geniusId}`);
    const gSong = data.response?.song;

    if (!gSong) {
      return res.status(404).json({ error: 'Song not found on Genius' });
    }

    const lyrics = await fetchLyrics(gSong.url);
    const Song = require('../models/Song');

    // Check if already exists
    const titleEscaped = gSong.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const artistEscaped = (gSong.primary_artist?.name || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const existing = await Song.findOne({
      title: { $regex: `^${titleEscaped}$`, $options: 'i' },
      artist: { $regex: `^${artistEscaped}$`, $options: 'i' },
    });

    if (existing) {
      return res.status(409).json({ error: 'Song already exists', existing });
    }

    const song = await Song.create({
      title: gSong.title,
      artist: gSong.primary_artist?.name || 'Unknown',
      album: gSong.album?.name || '',
      year: gSong.release_date_for_display?.split(',').pop()?.trim() || 'Unknown',
      genre,
      lyrics,
      geniusId: String(gSong.id),
      coverUrl: gSong.song_art_image_url || gSong.album?.cover_art_url || '',
    });

    res.status(201).json(song);
  })
);

// POST /api/genius/import-album - Import full album
router.post(
  '/import-album',
  requireAdminKey, geniusLimiter,
  asyncHandler(async (req, res) => {
    const { albumId, genre = 'Hip-Hop' } = req.body;

    if (!albumId) {
      return res.status(400).json({ error: 'Album ID required' });
    }

    const albumData = await geniusRequest(`/albums/${albumId}`);
    const album = albumData.response?.album;

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    const tracksData = await geniusRequest(`/albums/${albumId}/tracks`, { per_page: 50 });
    const tracks = tracksData.response?.tracks || [];

    const Song = require('../models/Song');
    const results = {
      album: album.name,
      artist: album.artist?.name,
      total: tracks.length,
      imported: 0,
      skipped: 0,
      errors: [],
    };

    for (const track of tracks) {
      try {
        const geniusId = track.song.id;
        const title = track.song.title;
        const artist = track.song.primary_artist?.name || album.artist?.name || 'Unknown';

        const titleEscaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const artistEscaped = artist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        const existing = await Song.findOne({
          title: { $regex: `^${titleEscaped}$`, $options: 'i' },
          artist: { $regex: `^${artistEscaped}$`, $options: 'i' },
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        const songData = await geniusRequest(`/songs/${geniusId}`);
        const gSong = songData.response?.song;

        if (!gSong) {
          results.errors.push({ title, error: 'Not found on Genius' });
          continue;
        }

        await new Promise(r => setTimeout(r, 800));
        const lyrics = await fetchLyrics(gSong.url);

        await Song.create({
          title: gSong.title,
          artist,
          album: album.name,
          year: album.release_date_for_display?.split(',').pop()?.trim() || 'Unknown',
          genre,
          lyrics,
          geniusId: String(geniusId),
          coverUrl: gSong.song_art_image_url || album.cover_art_url || '',
        });

        results.imported++;
      } catch (e) {
        results.errors.push({ title: track.song.title, error: e.message });
      }
    }

    res.json(results);
  })
);

module.exports = router;
