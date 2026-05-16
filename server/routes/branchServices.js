const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const parseNested = require('../middleware/parseNested');
const {
  getServicesByBranch,
  getAllServices,
  getService,
  createService,
  updateService,
  deleteService,
} = require('../controllers/branchServiceController');

// Public - specific routes first
router.get('/branch/:branchId', getServicesByBranch);
router.get('/', getAllServices);
router.get('/:id', getService);

// Protected
router.post('/', protect, upload.single('image'), parseNested, createService);
router.put('/:id', protect, upload.single('image'), parseNested, updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;
