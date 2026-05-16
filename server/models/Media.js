const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    title: {
      az: { type: String, required: true, trim: true },
      ru: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    content: {
      az: { type: String, required: true },
      ru: { type: String, required: true },
      en: { type: String, required: true },
    },
    image: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for sorting by date
mediaSchema.index({ date: -1 });

module.exports = mongoose.model('Media', mediaSchema);
