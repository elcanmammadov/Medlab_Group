const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      az: { type: String, required: true, trim: true },
      ru: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    description: {
      az: { type: String, required: true },
      ru: { type: String, required: true },
      en: { type: String, required: true },
    },
    logo: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
