/* ========================================
   File Upload Module
   Drag & drop + progress tracking
   ======================================== */

import { getAuthHeadersForUpload } from './auth.js';

/**
 * Initialize File Upload tool
 */
export function initUpload() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const browseBtn = document.getElementById('browseBtn');
  const uploadProgress = document.getElementById('uploadProgress');
  const uploadResult = document.getElementById('uploadResult');
  const fileUrlDisplay = document.getElementById('fileUrlDisplay');
  const copyBtn = document.getElementById('copyFileUrl');
  const uploadAnotherBtn = document.getElementById('uploadAnother');

  // Load recent files
  loadFiles();

  // Browse button
  browseBtn.addEventListener('click', () => {
    fileInput.click();
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  });

  // Drag and drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    if (e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  });

  // Copy button
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(fileUrlDisplay.value);

      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  });

  // Upload another button
  uploadAnotherBtn.addEventListener('click', () => {
    uploadResult.classList.add('hidden');
    dropZone.classList.remove('hidden');
    fileInput.value = '';
  });
}

/**
 * Upload file with progress tracking
 */
async function uploadFile(file) {
  const dropZone = document.getElementById('dropZone');
  const uploadProgress = document.getElementById('uploadProgress');
  const uploadResult = document.getElementById('uploadResult');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const fileUrlDisplay = document.getElementById('fileUrlDisplay');

  // Hide drop zone, show progress
  dropZone.classList.add('hidden');
  uploadProgress.classList.remove('hidden');
  uploadResult.classList.add('hidden');

  // Display file info
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  progressFill.style.width = '0%';
  progressText.textContent = 'Uploading...';

  // Create form data
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Create XHR for progress tracking
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        progressFill.style.width = percentComplete + '%';
        progressText.textContent = `Uploading... ${Math.round(percentComplete)}%`;
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);

        // Show result
        fileUrlDisplay.value = data.url;
        uploadProgress.classList.add('hidden');
        uploadResult.classList.remove('hidden');

        // Reload files list
        loadFiles();
      } else {
        const data = JSON.parse(xhr.responseText);
        throw new Error(data.error || 'Upload failed');
      }
    });

    // Handle error
    xhr.addEventListener('error', () => {
      throw new Error('Network error during upload');
    });

    // Send request
    xhr.open('POST', '/api/upload');
    
    // Add auth header
    const authHeaders = getAuthHeadersForUpload();
    Object.entries(authHeaders).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.send(formData);
  } catch (error) {
    alert(`Upload failed: ${error.message}`);
    uploadProgress.classList.add('hidden');
    dropZone.classList.remove('hidden');
  }
}

/**
 * Load and display recent files
 */
async function loadFiles() {
  const tableContainer = document.getElementById('filesTable');

  try {
    const response = await fetch('/api/upload/files', {
      headers: {
        'X-Admin-Password': localStorage.getItem('overmind_auth_token') || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load files');
    }

    if (data.files.length === 0) {
      tableContainer.innerHTML = '<div class="loading">No files yet</div>';
      return;
    }

    // Render files
    tableContainer.innerHTML = data.files
      .map(
        (file) => `
        <div class="link-item">
          <div class="link-code">📄</div>
          <div class="link-details">
            <div class="link-url">${escapeHtml(file.name)}</div>
            <div class="link-meta">
              Uploaded: ${new Date(file.createdAt).toLocaleString('fi-FI')} • 
              Size: ${formatFileSize(file.size)}
            </div>
          </div>
          <div class="link-actions">
            <button class="btn btn-secondary btn-small" onclick="copyToClipboard('${file.url}')">
              Copy
            </button>
            <a href="${file.url}" target="_blank" class="btn btn-secondary btn-small">
              Open
            </a>
            <button class="btn btn-secondary btn-small" onclick="deleteFile('${file.name}')">
              Delete
            </button>
          </div>
        </div>
      `
      )
      .join('');
  } catch (error) {
    tableContainer.innerHTML = `<div class="loading">Error loading files: ${error.message}</div>`;
  }
}

/**
 * Delete a file
 */
window.deleteFile = async (filename) => {
  if (!confirm('Delete this file?')) return;

  try {
    const response = await fetch(`/api/upload/${filename}`, {
      method: 'DELETE',
      headers: {
        'X-Admin-Password': localStorage.getItem('overmind_auth_token') || '',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete file');
    }

    // Reload files
    loadFiles();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
