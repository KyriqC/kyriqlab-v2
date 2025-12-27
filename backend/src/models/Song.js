const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    lyrics: { type: String, default: '' },
    year: { type: String, default: 'Unknown' },
    genre: { type: String, default: 'Hip-Hop' },
    album: { type: String, default: '' },
    
    // Optional metadata
    geniusId: { type: String, default: '' }, // For deduplication
    coverUrl: { type: String, default: '' }, // Album art URL from Genius
    
    // For game filtering
    isActive: { type: Boolean, default: true }, // Can be used in game
  },
  { timestamps: true }
);

// Compound index for quick lookups and preventing duplicates
SongSchema.index({ title: 1, artist: 1 }, { unique: true });

// Text index for search
SongSchema.index({ title: 'text', artist: 'text', lyrics: 'text' });

module.exports = mongoose.model('Song', SongSchema);
