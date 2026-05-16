const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getSlides, getAllSlides, createSlide, updateSlide, deleteSlide,
} = require('../controllers/heroSlideController');

router.get('/',      getSlides);
router.get('/all',   protect, getAllSlides);
router.post('/',     protect, upload.single('image'), createSlide);
router.put('/:id',   protect, upload.single('image'), updateSlide);
router.delete('/:id', protect, deleteSlide);

module.exports = router;
