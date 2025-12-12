/* ========================================
   HRK Overmind Server
   Backend for internal tools suite
   ======================================== */

'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import route handlers
const shortenerRoutes = require('./routes/shortener');
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');
const authMiddleware = require('./middleware/auth');
const { logRequest } = require('./middleware/logger');

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for tools
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(logRequest);

// Serve static files from uploads (with auth check)
app.use('/files', authMiddleware, express.static(path.join(__dirname, 'uploads')));

// Serve web frontend
app.use(express.static(path.join(__dirname, '../web/dist')));

// API Routes (all protected by auth)
app.use('/api/shorten', authMiddleware, shortenerRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);

// Short URL redirect handler (with preview page)
app.get('/s/:code', (req, res) => {
  const db = require('./db/shortener');
  const { code } = req.params;
  
  const link = db.getLink(code);
  
  if (!link) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="fi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Link Not Found - HRK Overmind</title>
        <style>
          body { font-family: system-ui; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
          h1 { color: #e53e3e; }
          a { color: #3b5998; text-decoration: none; }
        </style>
      </head>
      <body>
        <h1>404 - Link Not Found</h1>
        <p>This short link does not exist or has been removed.</p>
        <a href="/">Return to Home</a>
      </body>
      </html>
    `);
  }
  
  // Show preview page with Continue button
  res.send(`
    <!DOCTYPE html>
    <html lang="fi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Link Preview - HRK Overmind</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', system-ui, sans-serif; 
          background: #f8f9fa; 
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .preview-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          padding: 40px;
          max-width: 600px;
          width: 100%;
        }
        h1 { color: #1a1d23; margin-bottom: 10px; font-size: 24px; }
        .info { color: #718096; margin-bottom: 30px; font-size: 14px; }
        .link-box {
          background: #f8f9fa;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          word-break: break-all;
          font-family: monospace;
          font-size: 14px;
          color: #3b5998;
        }
        .warning {
          background: #fff5e6;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin-bottom: 30px;
          font-size: 14px;
          color: #92400e;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #3b5998, #5a7bb5);
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s;
          box-shadow: 0 0 20px rgba(59,89,152,0.15);
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(59,89,152,0.25);
        }
        .meta {
          margin-top: 20px;
          font-size: 12px;
          color: #a0aec0;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="preview-card">
        <h1>🔗 Short Link Preview</h1>
        <p class="info">You're about to visit an external link shortened by HRK Overmind.</p>
        
        <div class="warning">
          ⚠️ Always verify the destination before continuing. This tool is for internal use.
        </div>
        
        <div class="link-box">${link.longUrl}</div>
        
        <a href="${link.longUrl}" class="btn">Continue to Destination →</a>
        
        <p class="meta">Created: ${new Date(link.createdAt).toLocaleString('fi-FI')}</p>
      </div>
    </body>
    </html>
  `);
});

// Resolve API (admin only - returns target without preview)
app.get('/api/resolve/:code', authMiddleware, (req, res) => {
  const db = require('./db/shortener');
  const { code } = req.params;
  
  const link = db.getLink(code);
  
  if (!link) {
    return res.status(404).json({ error: 'Link not found' });
  }
  
  res.json({ 
    code: link.code,
    longUrl: link.longUrl,
    createdAt: link.createdAt
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Initialize database and start server
const initDatabase = require('./db/init');
initDatabase();

app.listen(PORT, () => {
  console.log(`\n🚀 HRK Overmind Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Authentication: ${process.env.ADMIN_PASSWORD ? 'Enabled' : 'Disabled (WARNING!)'}`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);
});

module.exports = app;
