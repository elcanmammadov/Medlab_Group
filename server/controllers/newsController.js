const News = require('../models/News');

// @desc    Get all news
// @route   GET /api/news
// @access  Public
const getNews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const total = await News.countDocuments({});
    const items = await News.find({}).sort({ date: -1 }).skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single news item
// @route   GET /api/news/:id
// @access  Public
const getNewsItem = async (req, res, next) => {
  try {
    const item = await News.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'News item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Create news (multiple images)
// @route   POST /api/news
// @access  Private
const createNews = async (req, res, next) => {
  try {
    const { title, content, date } = req.body;

    if (!title || !title.az || !title.ru || !title.en) {
      return res.status(400).json({
        success: false,
        message: 'News title in all languages (az, ru, en) is required',
      });
    }
    if (!content || !content.az || !content.ru || !content.en) {
      return res.status(400).json({
        success: false,
        message: 'News content in all languages (az, ru, en) is required',
      });
    }

    const images = (req.files || []).map((f) => `/uploads/news/${f.filename}`);

    const created = await News.create({
      title,
      content,
      date: date || Date.now(),
      images,
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

// @desc    Update news (optionally replace images)
// @route   PUT /api/news/:id
// @access  Private
const updateNews = async (req, res, next) => {
  try {
    const existing = await News.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'News item not found' });
    }

    const { title, content, date } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (date) updateData.date = date;

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((f) => `/uploads/news/${f.filename}`);
    }

    const updated = await News.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private
const deleteNews = async (req, res, next) => {
  try {
    const existing = await News.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'News item not found' });
    }

    await News.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'News item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNews, getNewsItem, createNews, updateNews, deleteNews };

