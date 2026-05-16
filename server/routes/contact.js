const express = require('express');
const router = express.Router();
const {
  getContacts,
  getContact,
  submitContact,
  updateContactStatus,
  deleteContact,
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

// Public route
router.post('/', submitContact);

// Protected routes
router.get('/', protect, getContacts);
router.get('/:id', protect, getContact);
router.put('/:id/status', protect, updateContactStatus);
router.delete('/:id', protect, deleteContact);

module.exports = router;
