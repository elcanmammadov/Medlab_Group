const path = require('path');
const Gallery = require('../models/Gallery');

// Normalize a gallery document so the `images` array is always populated.
// Some older records only have the legacy `image` field.
function normalizeItem(doc) {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  if (obj.type !== 'video') {
    if (!Array.isArray(obj.images) || !obj.images.length) {
      obj.images = obj.image ? [obj.image] : [];
    }
  }
  return obj;
}

const getGallery = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.type) filter.type = req.query.type;

    const total = await Gallery.countDocuments(filter);
    const items = await Gallery.find(filter).sort({ date: -1 }).skip(skip).limit(limit);
    const data  = items.map(normalizeItem);

    res.status(200).json({ success: true, count: data.length, total, page, pages: Math.ceil(total / limit), data });
  } catch (error) { next(error); }
};

const getGalleryItem = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    res.status(200).json({ success: true, data: normalizeItem(item) });
  } catch (error) { next(error); }
};

const createGalleryItem = async (req, res, next) => {
  try {
    const { title, date, type, videoUrl } = req.body;
    const itemType = type === 'video' ? 'video' : 'image';

    if (itemType === 'video') {
      if (!videoUrl) return res.status(400).json({ success: false, message: 'Video URL is required' });
      const created = await Gallery.create({
        type: 'video', title: title || '', videoUrl, images: [], image: '',
        date: date || Date.now(),
      });
      return res.status(201).json({ success: true, data: created });
    }

    // image type — req.files is array from upload.array('images')
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ success: false, message: 'At least one image is required' });

    const serverRoot = path.join(__dirname, '..');
    const imagePaths = files.map((f) => {
      const rel = f.path.replace(/\\/g, '/').replace(serverRoot.replace(/\\/g, '/'), '');
      return rel.startsWith('/') ? rel : '/' + rel;
    });

    const created = await Gallery.create({
      type: 'image', title: title || '',
      images: imagePaths,
      image:  imagePaths[0], // first image as legacy thumbnail
      videoUrl: '',
      date: date || Date.now(),
    });
    res.status(201).json({ success: true, data: created });
  } catch (error) { next(error); }
};

const updateGalleryItem = async (req, res, next) => {
  try {
    const existing = await Gallery.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Gallery item not found' });

    const { title, date, videoUrl, removeImages } = req.body;
    const updateData = {};

    if (typeof title    === 'string') updateData.title    = title;
    if (date)                         updateData.date     = date;
    if (typeof videoUrl === 'string') updateData.videoUrl = videoUrl;

    if (existing.type === 'image') {
      // Start from current images, remove any flagged ones
      let currentImages = [...(existing.images || [])];
      if (existing.image && !currentImages.includes(existing.image)) {
        currentImages.unshift(existing.image); // migrate legacy single image
      }

      // removeImages: comma-separated paths to remove
      if (removeImages) {
        const toRemove = removeImages.split(',').map((s) => s.trim());
        currentImages = currentImages.filter((img) => !toRemove.includes(img));
      }

      // Append newly uploaded files
      const newFiles = req.files || [];
      const serverRoot2 = path.join(__dirname, '..');
      const newPaths = newFiles.map((f) => {
        const rel = f.path.replace(/\\/g, '/').replace(serverRoot2.replace(/\\/g, '/'), '');
        return rel.startsWith('/') ? rel : '/' + rel;
      });
      currentImages = [...currentImages, ...newPaths];

      updateData.images = currentImages;
      updateData.image  = currentImages[0] || '';
    }

    const updated = await Gallery.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) { next(error); }
};

const deleteGalleryItem = async (req, res, next) => {
  try {
    const existing = await Gallery.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    await Gallery.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (error) { next(error); }
};

module.exports = { getGallery, getGalleryItem, createGalleryItem, updateGalleryItem, deleteGalleryItem };
