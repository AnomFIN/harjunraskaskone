/* ========================================
   Authentication Module
   Simple password-based auth for tools
   ======================================== */

const AUTH_KEY = 'overmind_auth_token';

/**
 * Get stored authentication token
 */
export function getAuthToken() {
  return localStorage.getItem(AUTH_KEY) || prompt('Enter admin password:');
}

/**
 * Set authentication token
 */
export function setAuthToken(token) {
  localStorage.setItem(AUTH_KEY, token);
}

/**
 * Get headers with authentication
 */
export function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'X-Admin-Password': token,
  };
}

/**
 * Get headers for file upload
 */
export function getAuthHeadersForUpload() {
  const token = getAuthToken();
  return {
    'X-Admin-Password': token,
  };
}
