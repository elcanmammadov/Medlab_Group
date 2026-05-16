const HeroSlide = require('../models/HeroSlide');

const getSlides = async (req, res, next) => {
  try {
    const slides = await HeroSlide.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, data: slides });
  } catch (e) {
    next(e);
  }
};

const getAllSlides = async (req, res, next) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1 });
    res.json({ success: true, data: slides });
  } catch (e) {
    next(e);
  }
};

const createSlide = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Şəkil tələb olunur' });
    const count = await HeroSlide.countDocuments();
    const slide = await HeroSlide.create({
      image: req.file.path.replace(/\\/g, '/').replace(/^.*uploads/, '/uploads'),
      order: count,
      active: true,
    });
    res.status(201).json({ success: true, data: slide });
  } catch (e) {
    next(e);
  }
};

const updateSlide = async (req, res, next) => {
  try {
    const { order, active } = req.body;
    const update = {};
    if (order !== undefined) update.order = Number(order);
    if (active !== undefined) update.active = active === 'true' || active === true;
    if (req.file)
      update.image = req.file.path.replace(/\\/g, '/').replace(/^.*uploads/, '/uploads');

    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!slide) return res.status(404).json({ success: false, message: 'Tapılmadı' });
    res.json({ success: true, data: slide });
  } catch (e) {
    next(e);
  }
};

const deleteSlide = async (req, res, next) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ success: false, message: 'Tapılmadı' });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

module.exports = { getSlides, getAllSlides, createSlide, updateSlide, deleteSlide };
