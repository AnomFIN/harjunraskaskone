/* ========================================
   AI Chat Routes (JugiAI)
   POST /api/chat - Send message to OpenAI
   ======================================== */

'use strict';

const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI client
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// System prompt for JugiAI
const SYSTEM_PROMPT = `You are JugiAI, an intelligent business and operations assistant for Harjun Raskaskone Oy and the Overmind tools suite.

About Harjun Raskaskone Oy:
- Finnish heavy vehicle maintenance and repair company
- Founded in 2019, based in Helsinki
- Specializes in heavy equipment maintenance, engine & drivetrain work
- Revenue: 911,000€ (2024), +59% growth
- Equity ratio: 40%
- Business ID: 2578643-3
- Location: c/o Teboil Ruskeasuo, Koroistentie 10, 00280 Helsinki

Overmind Tools:
1. URL Shortener - Create short links with custom codes
2. File Upload - Single file upload with drag & drop
3. JugiAI Chat (you) - AI assistant for business and tools help

Your role:
- Answer questions about HRK company, services, and operations
- Help users use the Overmind tools effectively
- Provide business insights and operational guidance
- Be professional, concise, and helpful
- Respond in Finnish when appropriate, English otherwise

Always be truthful and admit when you don't know something.`;

/**
 * POST /api/chat
 * Send message to AI assistant
 */
router.post('/', async (req, res) => {
  if (!openai) {
    return res.status(503).json({ 
      error: 'AI chat is not configured. Please set OPENAI_API_KEY in environment.' 
    });
  }
  
  const { messages } = req.body;
  
  // Validate input
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }
  
  // Limit message history to prevent token overflow
  const limitedMessages = messages.slice(-20);
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...limitedMessages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const assistantMessage = completion.choices[0].message;
    
    res.json({
      success: true,
      message: assistantMessage,
      usage: {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      },
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    
    if (error.status === 401) {
      return res.status(500).json({ error: 'AI service authentication failed.' });
    }
    
    res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
  }
});

/**
 * GET /api/chat/status
 * Check if chat service is available
 */
router.get('/status', (req, res) => {
  res.json({
    available: !!openai,
    configured: !!process.env.OPENAI_API_KEY,
  });
});

module.exports = router;
