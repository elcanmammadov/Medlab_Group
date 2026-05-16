const express = require('express');
const router = express.Router();
const {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
} = require('../controllers/branchController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const parseNested = require('../middleware/parseNested');

// Public routes
router.get('/', getBranches);
router.get('/:id', getBranch);

// Protected routes
router.post('/', protect, upload.any(), parseNested, createBranch);

router.put('/:id', protect, upload.any(), parseNested, updateBranch);

router.delete('/:id', protect, deleteBranch);

module.exports = router;
