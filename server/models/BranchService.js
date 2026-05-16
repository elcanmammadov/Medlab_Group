const mongoose = require('mongoose');

const branchServiceSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    name: {
      az: { type: String, required: true, trim: true },
      ru: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    image: { type: String, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('BranchService', branchServiceSchema);
