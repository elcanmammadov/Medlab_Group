const express = require('express');
const router = express.Router();
const {
  getMedia,
  getMediaItem,
  createMedia,
  updateMedia,
  deleteMedia,
} = require('../controllers/mediaController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const parseNested = require('../middleware/parseNested');

// Public routes
router.get('/', getMedia);
router.get('/:id', getMediaItem);

// Protected routes
router.post('/', protect, upload.single('image'), parseNested, createMedia);

router.put('/:id', protect, upload.single('image'), parseNested, updateMedia);

router.delete('/:id', protect, deleteMedia);

module.exports = router;
