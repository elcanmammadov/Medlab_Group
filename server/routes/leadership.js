const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getLeadership,
  getGlobalLeaders,
  getCompanyLeaders,
  getLeader,
  createLeader,
  updateLeader,
  deleteLeader,
} = require('../controllers/leadershipController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const parseNested = require('../middleware/parseNested');

// Public routes — specific paths must come before /:id
router.get('/global', getGlobalLeaders);
router.get('/company/:companyId', getCompanyLeaders);
router.get('/', getLeadership);
router.get('/:id', getLeader);

// Protected routes
router.post('/', protect, upload.single('photo'), parseNested, createLeader);
router.put('/:id', protect, upload.single('photo'), parseNested, updateLeader);
router.delete('/:id', protect, deleteLeader);

module.exports = router;
