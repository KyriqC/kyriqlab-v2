const Song = require('../models/Song');

// --- READ OPERATIONS ---

exports.getSongs = async (req, res) => {
  const { artist, genre, q, active, page = '1', limit = '50' } = req.query;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  // FIX: Allow up to 5000 songs so admin list works
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 5000);

  const filter = {};
  if (artist && artist !== 'All') filter.artist = artist;
  if (genre && genre !== 'All') filter.genre = genre;
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
      .select('-lyrics') // Save bandwidth
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
};

exports.getArtists = async (req, res) => {
  const artists = await Song.distinct('artist');
  res.json(artists.sort());
};

exports.getGenres = async (req, res) => {
  const genres = await Song.distinct('genre');
  res.json(genres.sort());
};

exports.getAlbums = async (req, res) => {
  const albums = await Song.distinct('album');
  res.json(albums.filter(a => a).sort());
};

exports.getYears = async (req, res) => {
  const years = await Song.distinct('year');
  res.json(years.filter(y => y).sort());
};

exports.getRandom = async (req, res) => {
  const { artist, album, year, count = '10' } = req.query;
  const countNum = Math.min(Math.max(parseInt(count, 10) || 10, 1), 100);

  const filter = { isActive: true };
  if (artist && artist !== 'All') filter.artist = artist;
  if (album && album !== 'All') filter.album = album;
  if (year && year !== 'All') filter.year = year;

  const songs = await Song.aggregate([
    { $match: filter },
    { $sample: { size: countNum } },
    { $project: { title: 1, artist: 1, lyrics: 1, album: 1, coverUrl: 1 } }
  ]);

  res.json(songs);
};

exports.getSongById = async (req, res) => {
  const song = await Song.findById(req.params.id).lean();
  if (!song) {
    res.status(404);
    throw new Error('Song not found');
  }
  res.json(song);
};

// --- WRITE OPERATIONS ---

exports.createSong = async (req, res) => {
  const { title, artist, lyrics, year, genre, album, geniusId, coverUrl } = req.body;

  if (!title || !artist) {
    res.status(400);
    throw new Error('Title and artist are required');
  }

  const existing = await Song.findOne({
    title: { $regex: `^${title}$`, $options: 'i' },
    artist: { $regex: `^${artist}$`, $options: 'i' }
  });

  if (existing) {
    return res.status(409).json({ error: 'Song already exists', existing });
  }

  const song = await Song.create({
    title, artist,
    lyrics: lyrics || '',
    year: year || 'Unknown',
    genre: genre || 'Hip-Hop',
    album: album || '',
    geniusId: geniusId || '',
    coverUrl: coverUrl || '',
  });

  res.status(201).json(song);
};

exports.bulkCreateSongs = async (req, res) => {
  const { songs } = req.body;
  if (!Array.isArray(songs) || songs.length === 0) {
    res.status(400);
    throw new Error('Songs array is required');
  }

  const results = { created: 0, skipped: 0, errors: [] };

  for (const songData of songs) {
    try {
      const { title, artist } = songData;
      if (!title || !artist) {
        results.errors.push({ song: songData, error: 'Missing title or artist' });
        continue;
      }

      const existing = await Song.findOne({
        title: { $regex: `^${title}$`, $options: 'i' },
        artist: { $regex: `^${artist}$`, $options: 'i' }
      });

      if (existing) {
        results.skipped++;
        continue;
      }

      await Song.create({
        title, artist,
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
};

exports.updateSong = async (req, res) => {
  const song = await Song.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!song) {
    res.status(404);
    throw new Error('Song not found');
  }
  res.json(song);
};

exports.deleteSong = async (req, res) => {
  const song = await Song.findByIdAndDelete(req.params.id);
  if (!song) {
    res.status(404);
    throw new Error('Song not found');
  }
  res.json({ ok: true });
};
