/* ========================================
   File Upload Routes
   POST /api/upload - Upload single file
   ======================================== */

'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random hash
    const timestamp = Date.now();
    const hash = crypto.randomBytes(4).toString('hex');
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);
    
    const filename = `${timestamp}-${hash}-${basename}${ext}`;
    cb(null, filename);
  },
});

// File filter for safety
const fileFilter = (req, file, cb) => {
  // Block executable files
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.app', '.dmg', '.pkg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (dangerousExtensions.includes(ext)) {
    return cb(new Error('File type not allowed for security reasons'), false);
  }
  
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

/**
 * POST /api/upload
 * Upload a single file
 */
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  const fileUrl = `${siteUrl}/files/${req.file.filename}`;
  
  // Log upload action
  console.log(`📤 File uploaded: ${req.file.filename} (${req.file.size} bytes)`);
  
  res.json({
    success: true,
    url: fileUrl,
    name: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    uploadedAt: Date.now(),
  });
});

/**
 * GET /api/upload/files
 * List all uploaded files (admin)
 */
router.get('/files', (req, res) => {
  try {
    const files = fs.readdirSync(UPLOAD_DIR).map(filename => {
      const filepath = path.join(UPLOAD_DIR, filename);
      const stats = fs.statSync(filepath);
      const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
      
      return {
        name: filename,
        url: `${siteUrl}/files/${filename}`,
        size: stats.size,
        createdAt: stats.birthtimeMs,
      };
    });
    
    // Sort by creation date, newest first
    files.sort((a, b) => b.createdAt - a.createdAt);
    
    res.json({ files: files.slice(0, 50) }); // Limit to 50 most recent
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/upload/:filename
 * Delete an uploaded file (admin)
 */
router.delete('/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Security: prevent directory traversal
    if (!filepath.startsWith(UPLOAD_DIR)) {
      return res.status(403).json({ error: 'Invalid filename' });
    }
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    fs.unlinkSync(filepath);
    console.log(`🗑️  File deleted: ${filename}`);
    
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  next();
});

module.exports = router;
