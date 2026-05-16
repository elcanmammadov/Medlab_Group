const express = require('express');
const router  = express.Router();

const { protect }  = require('../middleware/auth');
const upload       = require('../middleware/upload');
const {
  getGallery, getGalleryItem,
  createGalleryItem, updateGalleryItem, deleteGalleryItem,
} = require('../controllers/galleryController');

router.get('/',    getGallery);
router.get('/:id', getGalleryItem);

router.post('/',    protect, upload.array('images', 20), createGalleryItem);
router.put('/:id',  protect, upload.array('images', 20), updateGalleryItem);
router.delete('/:id', protect, deleteGalleryItem);

module.exports = router;
