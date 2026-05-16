const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      default: Date.now,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

newsSchema.index({ date: -1 });

module.exports = mongoose.model('News', newsSchema);

