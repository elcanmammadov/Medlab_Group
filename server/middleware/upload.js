const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const uploadDirs = [
  path.join(__dirname, '../uploads/companies'),
  path.join(__dirname, '../uploads/branches'),
  path.join(__dirname, '../uploads/leadership'),
  path.join(__dirname, '../uploads/media'),
  path.join(__dirname, '../uploads/news'),
  path.join(__dirname, '../uploads/gallery'),
  path.join(__dirname, '../uploads/doctors'),
  path.join(__dirname, '../uploads/hero'),
  path.join(__dirname, '../uploads/misc'),
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'uploads/misc/'; // default

    const fieldName = file.fieldname;
    console.log(
      `[Multer] Processing file: ${file.originalname}, Field: ${fieldName}, uploadFor: ${req.body?.uploadFor}`,
    );

    // Doctor photos always go to doctors folder regardless of uploadFor
    if (fieldName.startsWith('doctorPhoto_')) {
      folder = 'uploads/doctors/';
    } else if (req.body?.uploadFor) {
      switch (req.body.uploadFor) {
        case 'company':
          folder = 'uploads/companies/';
          break;
        case 'branch':
          folder = 'uploads/branches/';
          break;
        case 'branchService':
          folder = 'uploads/branches/';
          break;
        case 'leadership':
          folder = 'uploads/leadership/';
          break;
        case 'media':
          folder = 'uploads/media/';
          break;
        case 'news':
          folder = 'uploads/news/';
          break;
        case 'gallery':
          folder = 'uploads/gallery/';
          break;
        case 'hero':
          folder = 'uploads/hero/';
          break;
        case 'doctor':
          folder = 'uploads/doctors/';
          break;
        default:
          folder = 'uploads/misc/';
      }
      console.log(`[Multer] Using uploadFor override: ${folder}`);
    } else if (fieldName === 'logo') {
      folder = 'uploads/companies/';
    } else if (fieldName === 'photo') {
      folder = 'uploads/leadership/';
    } else if (fieldName === 'image') {
      folder = 'uploads/media/';
    } else if (fieldName === 'images') {
      folder = 'uploads/branches/';
    }

    const destinationPath = path.join(__dirname, '../', folder);

    console.log(`[Multer] Saving to: ${destinationPath}`);

    // Create destination folder if it doesn't exist (prevents ENOENT on first upload)
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }

    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

module.exports = upload;
