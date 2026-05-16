const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema(
  {
    image:  { type: String, required: true },
    order:  { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

heroSlideSchema.index({ order: 1 });

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
