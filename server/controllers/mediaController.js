const Media = require('../models/Media');

// @desc    Get all media items
// @route   GET /api/media
// @access  Public
const getMedia = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search } = req.query;
    const filter = {};

    // Search functionality
    if (search) {
      filter.$or = [
        { 'title.az': { $regex: search, $options: 'i' } },
        { 'title.ru': { $regex: search, $options: 'i' } },
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'content.az': { $regex: search, $options: 'i' } },
        { 'content.ru': { $regex: search, $options: 'i' } },
        { 'content.en': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Media.countDocuments(filter);
    const mediaItems = await Media.find(filter).sort({ date: -1 }).skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      count: mediaItems.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: mediaItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single media item
// @route   GET /api/media/:id
// @access  Public
const getMediaItem = async (req, res, next) => {
  try {
    const mediaItem = await Media.findById(req.params.id);

    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        message: 'Media item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: mediaItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create media item
// @route   POST /api/media
// @access  Private
const createMedia = async (req, res, next) => {
  try {
    const { title, content, date } = req.body;

    if (!title || !title.az || !title.ru || !title.en) {
      return res.status(400).json({
        success: false,
        message: 'Media title in all languages (az, ru, en) is required',
      });
    }

    if (!content || !content.az || !content.ru || !content.en) {
      return res.status(400).json({
        success: false,
        message: 'Media content in all languages (az, ru, en) is required',
      });
    }

    const mediaData = {
      title,
      content,
      date: date || Date.now(),
    };

    // Save uploaded file path to database
    if (req.file) {
      mediaData.image = `/uploads/media/${req.file.filename}`;
      console.log(`[Media Create] Image uploaded: ${mediaData.image}`);
    }

    console.log('[Media Create] Creating media item with data:', mediaData);
    const mediaItem = await Media.create(mediaData);
    console.log('[Media Create] Media item created successfully with ID:', mediaItem._id);

    res.status(201).json({
      success: true,
      data: mediaItem,
    });
  } catch (error) {
    console.error('[Media Create] Error:', error);
    next(error);
  }
};

// @desc    Update media item
// @route   PUT /api/media/:id
// @access  Private
const updateMedia = async (req, res, next) => {
  try {
    let mediaItem = await Media.findById(req.params.id);

    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        message: 'Media item not found',
      });
    }

    const { title, content, date } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (date) updateData.date = date;

    // Save uploaded file path to database
    if (req.file) {
      updateData.image = `/uploads/media/${req.file.filename}`;
      console.log(`[Media Update] Image uploaded: ${updateData.image}`);
    }

    console.log('[Media Update] Updating media ID:', req.params.id, 'with data:', updateData);
    mediaItem = await Media.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    console.log('[Media Update] Media item updated successfully');

    res.status(200).json({
      success: true,
      data: mediaItem,
    });
  } catch (error) {
    console.error('[Media Update] Error:', error);
    next(error);
  }
};

// @desc    Delete media item
// @route   DELETE /api/media/:id
// @access  Private
const deleteMedia = async (req, res, next) => {
  try {
    const mediaItem = await Media.findById(req.params.id);

    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        message: 'Media item not found',
      });
    }

    await Media.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Media item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedia,
  getMediaItem,
  createMedia,
  updateMedia,
  deleteMedia,
};
