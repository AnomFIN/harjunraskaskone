/* ========================================
   Database Initialization
   Sets up SQLite databases for tools
   ======================================== */

'use strict';

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

/**
 * Initialize shortener database
 */
function initShortenerDB() {
  const dbPath = path.join(DB_DIR, 'shortener.db');
  const db = new Database(dbPath);
  
  // Create links table
  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      longUrl TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      clicks INTEGER DEFAULT 0
    );
    
    CREATE INDEX IF NOT EXISTS idx_code ON links(code);
  `);
  
  console.log('✅ Shortener database initialized');
  db.close();
}

/**
 * Initialize all databases
 */
function initDatabase() {
  try {
    initShortenerDB();
    console.log('✅ All databases initialized successfully\n');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

module.exports = initDatabase;
