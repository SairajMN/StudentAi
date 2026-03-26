// PlaceAI Agent - OpenAI Service Module
// Handles all AI API calls

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS) || 4096;
const TEMPERATURE = parseFloat(process.env.TEMPERATURE) || 0.7;

/**
 * Call OpenAI API with a prompt and parse JSON response
 * @param {string} systemPrompt - System prompt
 * @param {string} userPrompt - User prompt
 * @param {boolean} expectJson - Whether to parse response as JSON
 * @returns {Promise<string|object>} - Response content
 */
export async function callAI(systemPrompt, userPrompt, expectJson = true) {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: MAX_TOKENS,
      temperature: expectJson ? 0.3 : TEMPERATURE
    });

    const content = response.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('Empty response from AI');
    }

    if (expectJson) {
      return parseJSON(content);
    }
    
    return content;
  } catch (error) {
    console.error('AI API Error:', error.message);
    throw error;
  }
}

/**
 * Parse JSON from AI response, handling markdown code blocks
 * @param {string} content - Raw AI response
 * @returns {object} - Parsed JSON object
 */
function parseJSON(content) {
  try {
    // Remove markdown code blocks if present
    let jsonStr = content;
    
    // Handle ```json ... ``` format
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }
    
    // Try to find JSON object or array in the response
    const jsonMatch = jsonStr.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('JSON Parse Error:', error.message);
    console.error('Raw content:', content);
    throw new Error('Failed to parse AI response as JSON');
  }
}

/**
 * Call AI with retry logic
 * @param {string} systemPrompt - System prompt
 * @param {string} userPrompt - User prompt
 * @param {boolean} expectJson - Whether to parse as JSON
 * @param {number} retries - Number of retries
 * @returns {Promise<string|object>} - Response
 */
export async function callAIWithRetry(systemPrompt, userPrompt, expectJson = true, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await callAI(systemPrompt, userPrompt, expectJson);
    } catch (error) {
      if (i === retries) {
        throw error;
      }
      console.log(`Retry ${i + 1}/${retries}...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export default {
  callAI,
  callAIWithRetry
};