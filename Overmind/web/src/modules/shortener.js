/* ========================================
   URL Shortener Module
   ======================================== */

import { getAuthHeaders } from './auth.js';

/**
 * Initialize URL Shortener tool
 */
export function initShortener() {
  const form = document.getElementById('shortenForm');
  const resultCard = document.getElementById('shortenResult');
  const shortUrlDisplay = document.getElementById('shortUrlDisplay');
  const copyBtn = document.getElementById('copyShortUrl');

  // Load recent links
  loadLinks();

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const longUrl = document.getElementById('longUrl').value.trim();
    const customCode = document.getElementById('customCode').value.trim();

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          longUrl,
          code: customCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create short link');
      }

      // Show result
      shortUrlDisplay.value = data.shortUrl;
      resultCard.classList.remove('hidden');

      // Reset form
      form.reset();

      // Reload links
      loadLinks();

      // Scroll to result
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });

  // Handle copy button
  copyBtn.addEventListener('click', () => {
    shortUrlDisplay.select();
    document.execCommand('copy');
    
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  });
}

/**
 * Load and display recent links
 */
async function loadLinks() {
  const tableContainer = document.getElementById('linksTable');

  try {
    const response = await fetch('/api/shorten/links', {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load links');
    }

    if (data.links.length === 0) {
      tableContainer.innerHTML = '<div class="loading">No links yet</div>';
      return;
    }

    // Render links
    tableContainer.innerHTML = data.links
      .map(
        (link) => `
        <div class="link-item">
          <div class="link-code">${link.code}</div>
          <div class="link-details">
            <div class="link-url">${escapeHtml(link.longUrl)}</div>
            <div class="link-meta">
              Created: ${new Date(link.createdAt).toLocaleString('fi-FI')} • 
              Clicks: ${link.clicks || 0}
            </div>
          </div>
          <div class="link-actions">
            <button class="btn btn-secondary btn-small" onclick="copyToClipboard('${link.shortUrl}')">
              Copy
            </button>
            <button class="btn btn-secondary btn-small" onclick="deleteLink('${link.code}')">
              Delete
            </button>
          </div>
        </div>
      `
      )
      .join('');
  } catch (error) {
    tableContainer.innerHTML = `<div class="loading">Error loading links: ${error.message}</div>`;
  }
}

/**
 * Copy text to clipboard
 */
window.copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    // Could add a toast notification here
    console.log('Copied to clipboard:', text);
  });
};

/**
 * Delete a link
 */
window.deleteLink = async (code) => {
  if (!confirm('Delete this link?')) return;

  try {
    const response = await fetch(`/api/shorten/${code}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete link');
    }

    // Reload links
    loadLinks();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
