/* ========================================
   Shortener Database Operations
   CRUD operations for URL shortener
   ======================================== */

'use strict';

const Database = require('better-sqlite3');
const path = require('path');
const { customAlphabet } = require('nanoid');

const DB_PATH = path.join(__dirname, '../data/shortener.db');

// Generate short codes (4 chars, alphanumeric)
const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 4);

/**
 * Get database connection
 */
function getDB() {
  return new Database(DB_PATH);
}

/**
 * Create a new short link
 * @param {string} longUrl - The long URL to shorten
 * @param {string} customCode - Optional custom code (4 chars)
 * @returns {object} The created link
 */
function createLink(longUrl, customCode = null) {
  const db = getDB();
  
  // Validate custom code if provided
  if (customCode) {
    if (!/^[A-Za-z0-9]{4}$/.test(customCode)) {
      db.close();
      throw new Error('Custom code must be 4 alphanumeric characters');
    }
    
    // Check if code already exists
    const existing = db.prepare('SELECT code FROM links WHERE code = ?').get(customCode);
    if (existing) {
      db.close();
      throw new Error('Code already in use');
    }
  }
  
  // Generate code if not provided
  const code = customCode || generateCode();
  
  // Insert with collision retry (max 10 attempts)
  let attempts = 0;
  let inserted = false;
  let finalCode = code;
  
  while (!inserted && attempts < 10) {
    try {
      const stmt = db.prepare('INSERT INTO links (code, longUrl, createdAt) VALUES (?, ?, ?)');
      stmt.run(finalCode, longUrl, Date.now());
      inserted = true;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        // Collision, generate new code
        finalCode = generateCode();
        attempts++;
      } else {
        db.close();
        throw error;
      }
    }
  }
  
  if (!inserted) {
    db.close();
    throw new Error('Failed to generate unique code after 10 attempts');
  }
  
  const link = db.prepare('SELECT * FROM links WHERE code = ?').get(finalCode);
  db.close();
  
  return link;
}

/**
 * Get a link by code
 * @param {string} code - The short code
 * @returns {object|null} The link or null if not found
 */
function getLink(code) {
  const db = getDB();
  const link = db.prepare('SELECT * FROM links WHERE code = ?').get(code);
  
  // Increment click counter
  if (link) {
    db.prepare('UPDATE links SET clicks = clicks + 1 WHERE code = ?').run(code);
  }
  
  db.close();
  return link || null;
}

/**
 * Get all links (for admin view)
 * @param {number} limit - Number of links to return
 * @returns {array} Array of links
 */
function getAllLinks(limit = 50) {
  const db = getDB();
  const links = db.prepare('SELECT * FROM links ORDER BY createdAt DESC LIMIT ?').all(limit);
  db.close();
  return links;
}

/**
 * Delete a link by code
 * @param {string} code - The short code
 * @returns {boolean} True if deleted
 */
function deleteLink(code) {
  const db = getDB();
  const result = db.prepare('DELETE FROM links WHERE code = ?').run(code);
  db.close();
  return result.changes > 0;
}

module.exports = {
  createLink,
  getLink,
  getAllLinks,
  deleteLink,
};
