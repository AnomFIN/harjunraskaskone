/* ========================================
   AI Chat Module (JugiAI)
   ======================================== */

import { getAuthHeaders } from './auth.js';

const STORAGE_KEY = 'jugiai_messages';
const MAX_STORED_MESSAGES = 20;

let messages = [];

/**
 * Initialize AI Chat tool
 */
export function initChat() {
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const messagesContainer = document.getElementById('chatMessages');

  // Load stored messages
  loadStoredMessages();
  renderMessages();

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Add user message
    addMessage('user', userMessage);
    input.value = '';
    renderMessages();

    // Show typing indicator
    showTypingIndicator();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Remove typing indicator
      hideTypingIndicator();

      // Add assistant message
      addMessage('assistant', data.message.content);
      renderMessages();

      // Store messages
      storeMessages();
    } catch (error) {
      hideTypingIndicator();
      addMessage('assistant', `Error: ${error.message}`);
      renderMessages();
    }
  });
}

/**
 * Add message to history
 */
function addMessage(role, content) {
  messages.push({
    role,
    content,
    timestamp: Date.now(),
  });

  // Keep only last MAX_STORED_MESSAGES
  if (messages.length > MAX_STORED_MESSAGES) {
    messages = messages.slice(-MAX_STORED_MESSAGES);
  }
}

/**
 * Render all messages
 */
function renderMessages() {
  const container = document.getElementById('chatMessages');

  // Clear welcome message if there are messages
  if (messages.length > 0) {
    const welcome = container.querySelector('.chat-welcome');
    if (welcome) {
      welcome.remove();
    }
  }

  // Find existing messages
  const existingMessages = container.querySelectorAll('.chat-message');
  
  // Only render new messages
  const startIndex = existingMessages.length;
  
  messages.slice(startIndex).forEach((message) => {
    const messageEl = createMessageElement(message);
    container.appendChild(messageEl);
  });

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

/**
 * Create message element
 */
function createMessageElement(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${message.role}`;

  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar';
  avatar.textContent = message.role === 'user' ? '👤' : '🤖';

  const content = document.createElement('div');
  content.className = 'chat-content';

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = message.content;

  const timestamp = document.createElement('div');
  timestamp.className = 'chat-timestamp';
  timestamp.textContent = new Date(message.timestamp).toLocaleTimeString('fi-FI', {
    hour: '2-digit',
    minute: '2-digit',
  });

  content.appendChild(bubble);
  content.appendChild(timestamp);

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);

  return messageDiv;
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
  const container = document.getElementById('chatMessages');
  
  const indicator = document.createElement('div');
  indicator.className = 'chat-message assistant typing-indicator-wrapper';
  indicator.id = 'typingIndicator';

  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar';
  avatar.textContent = '🤖';

  const content = document.createElement('div');
  content.className = 'chat-content';

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';

  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

  bubble.appendChild(typingIndicator);
  content.appendChild(bubble);

  indicator.appendChild(avatar);
  indicator.appendChild(content);

  container.appendChild(indicator);
  container.scrollTop = container.scrollHeight;
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.remove();
  }
}

/**
 * Store messages in localStorage
 */
function storeMessages() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to store messages:', error);
  }
}

/**
 * Load stored messages from localStorage
 */
function loadStoredMessages() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      messages = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load stored messages:', error);
    messages = [];
  }
}
