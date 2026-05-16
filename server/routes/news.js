const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const parseNested = require('../middleware/parseNested');
const {
  getNews,
  getNewsItem,
  createNews,
  updateNews,
  deleteNews,
} = require('../controllers/newsController');

// Public routes
router.get('/', getNews);
router.get('/:id', getNewsItem);

// Protected routes
router.post('/', protect, upload.array('images', 10), parseNested, createNews);
router.put('/:id', protect, upload.array('images', 10), parseNested, updateNews);
router.delete('/:id', protect, deleteNews);

module.exports = router;

