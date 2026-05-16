const mongoose = require('mongoose');

const leadershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    surname: {
      type: String,
      trim: true,
      default: '',
    },
    position: {
      az: { type: String, trim: true },
      ru: { type: String, trim: true },
      en: { type: String, trim: true },
    },
    bio: {
      az: { type: String },
      ru: { type: String },
      en: { type: String },
    },
    photo: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['global', 'company'],
      required: true,
      default: 'global',
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Leadership', leadershipSchema);
