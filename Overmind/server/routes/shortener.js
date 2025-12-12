/* ========================================
   URL Shortener Routes
   POST /api/shorten - Create short link
   GET /api/links - List all links
   ======================================== */

'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db/shortener');

// Dangerous URL patterns to block
const DANGEROUS_PATTERNS = [
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/i,
  /^https?:\/\/\[?::/i, // IPv6 localhost
  /^file:\/\//i,
  /^javascript:/i,
  /^data:/i,
];

/**
 * Validate URL safety
 */
function isUrlSafe(url) {
  try {
    const urlObj = new URL(url);
    
    // Must be http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check against dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(url)) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * POST /api/shorten
 * Create a new short link
 */
router.post('/', (req, res) => {
  const { longUrl, code } = req.body;
  
  // Validate input
  if (!longUrl) {
    return res.status(400).json({ error: 'longUrl is required' });
  }
  
  if (!isUrlSafe(longUrl)) {
    return res.status(400).json({ 
      error: 'Invalid or unsafe URL. Only http/https URLs to public domains are allowed.' 
    });
  }
  
  try {
    const link = db.createLink(longUrl, code || null);
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
    
    res.json({
      success: true,
      code: link.code,
      shortUrl: `${siteUrl}/s/${link.code}`,
      longUrl: link.longUrl,
      createdAt: link.createdAt,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/shorten/links
 * Get all links (admin)
 */
router.get('/links', (req, res) => {
  try {
    const links = db.getAllLinks(50);
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
    
    const linksWithUrls = links.map(link => ({
      ...link,
      shortUrl: `${siteUrl}/s/${link.code}`,
    }));
    
    res.json({ links: linksWithUrls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/shorten/:code
 * Delete a short link (admin)
 */
router.delete('/:code', (req, res) => {
  try {
    const { code } = req.params;
    const deleted = db.deleteLink(code);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.json({ success: true, message: 'Link deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
