/* ========================================
   Overmind Tools Suite - Main Application
   ======================================== */

import { initShortener } from './modules/shortener.js';
import { initUpload } from './modules/upload.js';
import { initChat } from './modules/chat.js';
import { getAuthHeaders } from './modules/auth.js';

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  // Set current year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Initialize navigation
  initNavigation();

  // Initialize tools
  initShortener();
  initUpload();
  initChat();

  // Show first tool by default
  showTool('shortener');
});

/**
 * Initialize navigation between tools
 */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tool = link.dataset.tool;
      if (tool) {
        showTool(tool);
        
        // Update URL hash
        window.location.hash = tool;
        
        // Update active state
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });

  // Handle hash on page load
  const hash = window.location.hash.substring(1);
  if (hash) {
    showTool(hash);
    const activeLink = document.querySelector(`.nav-link[data-tool="${hash}"]`);
    if (activeLink) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      activeLink.classList.add('active');
    }
  } else {
    // Activate first link by default
    navLinks[0]?.classList.add('active');
  }
}

/**
 * Show specific tool section
 */
function showTool(toolName) {
  const sections = document.querySelectorAll('.tool-section');
  sections.forEach(section => {
    section.classList.remove('active');
  });
  
  const targetSection = document.getElementById(toolName);
  if (targetSection) {
    targetSection.classList.add('active');
  }
}

// Export utilities
export { getAuthHeaders };
