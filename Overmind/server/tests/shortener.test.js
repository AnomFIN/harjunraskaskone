/* ========================================
   URL Shortener Tests
   Tests collision handling and URL validation
   ======================================== */

'use strict';

const db = require('../db/shortener');
const fs = require('fs');
const path = require('path');

// Test database path
const TEST_DB_PATH = path.join(__dirname, '../data/shortener.db');

/**
 * Test: Create link with auto-generated code
 */
function testCreateLinkAutoCode() {
  console.log('Testing: Create link with auto-generated code');
  
  const longUrl = 'https://example.com/test/path?param=value';
  const link = db.createLink(longUrl);
  
  if (!link.code || link.code.length !== 4) {
    throw new Error('Code should be 4 characters');
  }
  
  if (!/^[A-Za-z0-9]{4}$/.test(link.code)) {
    throw new Error('Code should contain only alphanumeric characters');
  }
  
  if (link.longUrl !== longUrl) {
    throw new Error('Long URL mismatch');
  }
  
  console.log('✅ PASS: Auto-generated code works');
  return link;
}

/**
 * Test: Create link with custom code
 */
function testCreateLinkCustomCode() {
  console.log('Testing: Create link with custom code');
  
  const longUrl = 'https://example.com/custom';
  const customCode = 'ABCD';
  const link = db.createLink(longUrl, customCode);
  
  if (link.code !== customCode) {
    throw new Error(`Expected code ${customCode}, got ${link.code}`);
  }
  
  console.log('✅ PASS: Custom code works');
  return link;
}

/**
 * Test: Reject duplicate custom code
 */
function testRejectDuplicateCode() {
  console.log('Testing: Reject duplicate custom code');
  
  const longUrl1 = 'https://example.com/first';
  const longUrl2 = 'https://example.com/second';
  const customCode = 'TEST';
  
  // Create first link
  db.createLink(longUrl1, customCode);
  
  // Try to create second link with same code
  try {
    db.createLink(longUrl2, customCode);
    throw new Error('Should have rejected duplicate code');
  } catch (error) {
    if (error.message.includes('already in use')) {
      console.log('✅ PASS: Duplicate code rejected');
    } else {
      throw error;
    }
  }
}

/**
 * Test: Invalid custom code format
 */
function testInvalidCustomCode() {
  console.log('Testing: Invalid custom code format');
  
  const longUrl = 'https://example.com/invalid';
  
  // Test various invalid codes
  const invalidCodes = [
    'AB',       // Too short
    'ABCDE',    // Too long
    'AB@D',     // Special character
    'AB D',     // Space
    'ÅÄÖ1',     // Non-ASCII
  ];
  
  for (const code of invalidCodes) {
    try {
      db.createLink(longUrl, code);
      throw new Error(`Should have rejected invalid code: ${code}`);
    } catch (error) {
      if (error.message.includes('must be 4 alphanumeric characters')) {
        // Expected
      } else {
        throw error;
      }
    }
  }
  
  console.log('✅ PASS: Invalid codes rejected');
}

/**
 * Test: Collision handling (simulate)
 */
function testCollisionHandling() {
  console.log('Testing: Collision handling');
  
  // Create many links to potentially trigger collisions
  const links = [];
  const numLinks = 100;
  
  for (let i = 0; i < numLinks; i++) {
    const link = db.createLink(`https://example.com/collision-test-${i}`);
    links.push(link);
  }
  
  // Verify all links have unique codes
  const codes = links.map(l => l.code);
  const uniqueCodes = new Set(codes);
  
  if (codes.length !== uniqueCodes.size) {
    throw new Error('Collision detected: duplicate codes created');
  }
  
  console.log(`✅ PASS: Created ${numLinks} unique links without collisions`);
}

/**
 * Test: Get link by code
 */
function testGetLink() {
  console.log('Testing: Get link by code');
  
  const longUrl = 'https://example.com/get-test';
  const customCode = 'GET1';
  const created = db.createLink(longUrl, customCode);
  
  const retrieved = db.getLink(customCode);
  
  if (!retrieved) {
    throw new Error('Link not found');
  }
  
  if (retrieved.code !== customCode) {
    throw new Error('Code mismatch');
  }
  
  if (retrieved.longUrl !== longUrl) {
    throw new Error('URL mismatch');
  }
  
  console.log('✅ PASS: Get link works');
}

/**
 * Test: Get non-existent link
 */
function testGetNonExistentLink() {
  console.log('Testing: Get non-existent link');
  
  const link = db.getLink('XXXX');
  
  if (link !== null) {
    throw new Error('Should return null for non-existent link');
  }
  
  console.log('✅ PASS: Non-existent link returns null');
}

/**
 * Test: Click counter
 */
function testClickCounter() {
  console.log('Testing: Click counter');
  
  const longUrl = 'https://example.com/click-test';
  const customCode = 'CLK1';
  db.createLink(longUrl, customCode);
  
  // Get link multiple times
  for (let i = 0; i < 5; i++) {
    db.getLink(customCode);
  }
  
  // Check click count
  const link = db.getLink(customCode);
  if (link.clicks < 5) {
    throw new Error(`Expected at least 5 clicks, got ${link.clicks}`);
  }
  
  console.log('✅ PASS: Click counter works');
}

/**
 * Test: Get all links
 */
function testGetAllLinks() {
  console.log('Testing: Get all links');
  
  const links = db.getAllLinks(10);
  
  if (!Array.isArray(links)) {
    throw new Error('Should return array');
  }
  
  if (links.length === 0) {
    throw new Error('Should have at least some links from previous tests');
  }
  
  console.log(`✅ PASS: Got ${links.length} links`);
}

/**
 * Test: Delete link
 */
function testDeleteLink() {
  console.log('Testing: Delete link');
  
  const longUrl = 'https://example.com/delete-test';
  const customCode = 'DEL1';
  db.createLink(longUrl, customCode);
  
  // Verify it exists
  const before = db.getLink(customCode);
  if (!before) {
    throw new Error('Link should exist before deletion');
  }
  
  // Delete
  const deleted = db.deleteLink(customCode);
  if (!deleted) {
    throw new Error('Delete should return true');
  }
  
  // Verify it's gone
  const after = db.getLink(customCode);
  if (after !== null) {
    throw new Error('Link should not exist after deletion');
  }
  
  console.log('✅ PASS: Delete link works');
}

/**
 * Run all tests
 */
function runTests() {
  console.log('========================================');
  console.log('URL Shortener Tests');
  console.log('========================================\n');
  
  try {
    // Initialize database
    require('../db/init.js')();
    
    // Run tests
    testCreateLinkAutoCode();
    testCreateLinkCustomCode();
    testRejectDuplicateCode();
    testInvalidCustomCode();
    testCollisionHandling();
    testGetLink();
    testGetNonExistentLink();
    testClickCounter();
    testGetAllLinks();
    testDeleteLink();
    
    console.log('\n========================================');
    console.log('✨ All tests passed!');
    console.log('========================================\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
