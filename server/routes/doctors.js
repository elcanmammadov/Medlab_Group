const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const parseNested = require('../middleware/parseNested');

router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.post('/', protect, upload.single('image'), parseNested, createDoctor);
router.put('/:id', protect, upload.single('image'), parseNested, updateDoctor);
router.delete('/:id', protect, deleteDoctor);

module.exports = router;
