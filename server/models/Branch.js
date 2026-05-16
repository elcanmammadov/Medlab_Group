const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    name: {
      az: { type: String, required: true, trim: true },
      ru: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    address: {
      az: { type: String, required: true },
      ru: { type: String, required: true },
      en: { type: String, required: true },
    },
    phones: [
      {
        number: { type: String, trim: true },
        type: {
          type: String,
          enum: ['mobile', 'city', 'whatsapp', 'online'],
          default: 'mobile',
        },
      },
    ],
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    workingHours: {
      type: String,
      default: '09:00 - 18:00',
    },
    mapLink: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    social: {
      whatsapp:  { type: String, trim: true, default: '' },
      instagram: { type: String, trim: true, default: '' },
      facebook:  { type: String, trim: true, default: '' },
      youtube:   { type: String, trim: true, default: '' },
    },
  },
  { timestamps: true },
);

// Index for filtering by company
branchSchema.index({ company: 1 });

module.exports = mongoose.model('Branch', branchSchema);
