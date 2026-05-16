const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    type:     { type: String, enum: ['image', 'video'], default: 'image' },
    title:    { type: String, default: '', trim: true },
    images:   [{ type: String }],
    image:    { type: String, default: '' }, // legacy single-image field
    videoUrl: { type: String, default: '' },
    date:     { type: Date, default: Date.now },
  },
  { timestamps: true }
);

gallerySchema.index({ date: -1 });

module.exports = mongoose.model('Gallery', gallerySchema);
