const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const compression = require('compression');

// Load environment variables
dotenv.config();

// Database connection
const dbConnect = require('./config/db');

// Error handler
const { errorHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Connect to MongoDB (non-blocking)
dbConnect().catch((err) => console.error('MongoDB connection failed:', err.message));

// Gzip compression for all responses
app.use(compression());

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files with long-term cache headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
}));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/branches', require('./routes/branches'));
app.use('/api/branch-services', require('./routes/branchServices'));
app.use('/api/leadership', require('./routes/leadership'));
app.use('/api/media', require('./routes/media'));
app.use('/api/news', require('./routes/news'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/contact',     require('./routes/contact'));
app.use('/api/hero-slides', require('./routes/heroSlides'));
app.use('/api/doctors',    require('./routes/doctors'));

// SEO: robots.txt
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.sendFile(path.join(__dirname, '..', 'robots.txt'));
});

// SEO: sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.sendFile(path.join(__dirname, '..', 'sitemap.xml'));
});

// Website static files with cache headers for assets
app.use(express.static(path.join(__dirname, '..'), {
  etag: true,
  lastModified: true,
  setHeaders(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (['.css', '.js'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
    } else if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.ico'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
    } else if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

// Admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Website entry
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Suppress favicon 404
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Medlab Medical Group API is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
