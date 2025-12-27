const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },

    summary: { type: String, default: '' },
    content: { type: String, default: '' }, // markdown

    tags: { type: [String], default: [] },
    category: { type: String, default: '' }, // optional

    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    publishedAt: { type: Date, default: null },

    featured: { type: Boolean, default: false },
    featuredImageUrl: String,

    galleryImages: [String]
  },
  { timestamps: true }
);

// Keep publishedAt consistent for create/save
PostSchema.pre('save', function () {
  if (this.isModified('status')) {
    if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
    if (this.status !== 'published') this.publishedAt = null;
  }
});

// Keep publishedAt consistent for findOneAndUpdate / updateOne / etc.
PostSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function () {
  const update = this.getUpdate() || {};
  const $set = update.$set || {};
  const nextStatus = $set.status ?? update.status;

  if (nextStatus) {
    if (nextStatus === 'published') {
      // only set if not already set
      update.$set = { ...$set, publishedAt: $set.publishedAt ?? new Date() };
    } else {
      update.$set = { ...$set, publishedAt: null };
    }
    // ensure update is written back
    this.setUpdate({ ...update, $set: update.$set });
  }
});

module.exports = mongoose.model('Post', PostSchema);
