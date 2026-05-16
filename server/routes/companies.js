const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} = require('../controllers/companyController');
const {
  getLeadership,
  getLeader,
  createLeader,
  updateLeader,
  deleteLeader,
} = require('../controllers/leadershipController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const parseNested = require('../middleware/parseNested');

// Public routes
router.get('/', getCompanies);

// Company-specific leadership routes (must be defined before :id route)
router.get('/:companyId/leadership', getLeadership);
router.post('/:companyId/leadership', protect, upload.single('photo'), parseNested, createLeader);
router.get('/:companyId/leadership/:id', getLeader);
router.put('/:companyId/leadership/:id', protect, upload.single('photo'), parseNested, updateLeader);
router.delete('/:companyId/leadership/:id', protect, deleteLeader);

// Single company routes
router.get('/:id', getCompany);

// Protected routes
router.post('/', protect, upload.single('logo'), parseNested, createCompany);

router.put('/:id', protect, upload.single('logo'), parseNested, updateCompany);

router.delete('/:id', protect, deleteCompany);

module.exports = router;
