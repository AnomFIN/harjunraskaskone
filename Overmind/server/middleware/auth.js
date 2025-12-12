/* ========================================
   Authentication Middleware
   Simple password + IP allowlist protection
   ======================================== */

'use strict';

/**
 * Check if request is authorized based on password header and/or IP allowlist
 */
function authMiddleware(req, res, next) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const allowedIps = process.env.ALLOWED_IPS ? 
    process.env.ALLOWED_IPS.split(',').map(ip => ip.trim()) : 
    [];
  
  // Get client IP (handles proxies)
  const clientIp = req.ip || 
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
    req.connection.remoteAddress;
  
  // Check IP allowlist if configured
  if (allowedIps.length > 0) {
    const isAllowedIp = allowedIps.some(allowedIp => {
      // Handle IPv6 localhost
      if (allowedIp === '::1' && (clientIp === '::1' || clientIp === '127.0.0.1')) {
        return true;
      }
      // Handle IPv4 localhost
      if (allowedIp === '127.0.0.1' && (clientIp === '127.0.0.1' || clientIp === '::1')) {
        return true;
      }
      return clientIp === allowedIp || clientIp.endsWith(allowedIp);
    });
    
    if (!isAllowedIp) {
      console.warn(`Unauthorized IP attempt: ${clientIp}`);
      return res.status(403).json({ 
        error: 'Access denied. IP not in allowlist.' 
      });
    }
  }
  
  // Check password if configured
  if (adminPassword) {
    const providedPassword = req.headers['x-admin-password'] || 
      req.headers['authorization']?.replace('Bearer ', '');
    
    if (providedPassword !== adminPassword) {
      console.warn(`Unauthorized password attempt from ${clientIp}`);
      return res.status(401).json({ 
        error: 'Invalid or missing authentication credentials.' 
      });
    }
  }
  
  // Both checks passed (or not configured)
  next();
}

module.exports = authMiddleware;
