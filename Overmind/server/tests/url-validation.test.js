/* ========================================
   URL Validation Tests
   Tests dangerous URL blocking
   ======================================== */

'use strict';

/**
 * Import validation function from routes
 * We need to extract it or recreate it for testing
 */

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
 * Test: Valid URLs
 */
function testValidUrls() {
  console.log('Testing: Valid URLs');
  
  const validUrls = [
    'https://example.com',
    'http://example.com',
    'https://example.com/path',
    'https://example.com/path?query=value',
    'https://subdomain.example.com',
    'https://example.com:8080/path',
    'https://harjunraskaskone.fi',
  ];
  
  for (const url of validUrls) {
    if (!isUrlSafe(url)) {
      throw new Error(`Valid URL rejected: ${url}`);
    }
  }
  
  console.log('✅ PASS: All valid URLs accepted');
}

/**
 * Test: Dangerous localhost URLs
 */
function testLocalhostBlocking() {
  console.log('Testing: Localhost URL blocking');
  
  const localhostUrls = [
    'http://localhost',
    'http://localhost:3000',
    'https://localhost/admin',
    'http://127.0.0.1',
    'http://127.0.0.1:8080',
    'http://0.0.0.0',
  ];
  
  for (const url of localhostUrls) {
    if (isUrlSafe(url)) {
      throw new Error(`Dangerous URL not blocked: ${url}`);
    }
  }
  
  console.log('✅ PASS: All localhost URLs blocked');
}

/**
 * Test: Private network URLs
 */
function testPrivateNetworkBlocking() {
  console.log('Testing: Private network URL blocking');
  
  const privateUrls = [
    'http://192.168.1.1',
    'http://192.168.0.100',
    'http://10.0.0.1',
    'http://10.10.10.10',
    'http://172.16.0.1',
    'http://172.31.255.255',
  ];
  
  for (const url of privateUrls) {
    if (isUrlSafe(url)) {
      throw new Error(`Private network URL not blocked: ${url}`);
    }
  }
  
  console.log('✅ PASS: All private network URLs blocked');
}

/**
 * Test: IPv6 localhost
 */
function testIPv6LocalhostBlocking() {
  console.log('Testing: IPv6 localhost blocking');
  
  const ipv6Urls = [
    'http://[::1]',
    'http://[::1]:8080',
    'https://[::1]/path',
  ];
  
  for (const url of ipv6Urls) {
    if (isUrlSafe(url)) {
      throw new Error(`IPv6 localhost not blocked: ${url}`);
    }
  }
  
  console.log('✅ PASS: IPv6 localhost URLs blocked');
}

/**
 * Test: Dangerous protocols
 */
function testDangerousProtocols() {
  console.log('Testing: Dangerous protocol blocking');
  
  const dangerousUrls = [
    'file:///etc/passwd',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'ftp://example.com',
  ];
  
  for (const url of dangerousUrls) {
    if (isUrlSafe(url)) {
      throw new Error(`Dangerous protocol not blocked: ${url}`);
    }
  }
  
  console.log('✅ PASS: All dangerous protocols blocked');
}

/**
 * Test: Invalid URLs
 */
function testInvalidUrls() {
  console.log('Testing: Invalid URL formats');
  
  const invalidUrls = [
    'not-a-url',
    'htp://missing-t',
    '//example.com',
    'example.com',
    '',
  ];
  
  for (const url of invalidUrls) {
    if (isUrlSafe(url)) {
      throw new Error(`Invalid URL not rejected: ${url}`);
    }
  }
  
  console.log('✅ PASS: All invalid URLs rejected');
}

/**
 * Run all tests
 */
function runTests() {
  console.log('========================================');
  console.log('URL Validation Tests');
  console.log('========================================\n');
  
  try {
    testValidUrls();
    testLocalhostBlocking();
    testPrivateNetworkBlocking();
    testIPv6LocalhostBlocking();
    testDangerousProtocols();
    testInvalidUrls();
    
    console.log('\n========================================');
    console.log('✨ All URL validation tests passed!');
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

module.exports = { runTests, isUrlSafe };
