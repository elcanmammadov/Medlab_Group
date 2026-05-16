const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    surname: { type: String, trim: true, default: '' },
    position: {
      az: { type: String, trim: true, default: '' },
      ru: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
    },
    bio: {
      az: { type: String, default: '' },
      ru: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    image: { type: String, default: '' },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
  },
  { timestamps: true },
);

doctorSchema.index({ branchId: 1 });
doctorSchema.index({ companyId: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
