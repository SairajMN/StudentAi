// PlaceAI Agent - Main Entry Point
// Autonomous AI Placement Agent for job application automation

import { executePipeline, processBatch } from './agents/placeAI.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Main function to run PlaceAI Agent
 * Accepts input via stdin (JSON) or command line arguments
 */
async function main() {
  try {
    // Read input from stdin
    const input = await readStdin();
    
    if (!input) {
      console.error('Error: No input provided');
      console.log(usage());
      process.exit(1);
    }

    // Check if input is batch (multiple jobs)
    if (input.jobs && Array.isArray(input.jobs)) {
      console.log(`Processing ${input.jobs.length} jobs in batch mode...`);
      const results = await processBatch(input, input.jobs);
      outputJSON(results);
    } else {
      // Single job processing
      const result = await executePipeline(input);
      outputJSON(result);
    }

  } catch (error) {
    console.error('Fatal Error:', error.message);
    outputJSON({ error: error.message, stack: error.stack });
    process.exit(1);
  }
}

/**
 * Read JSON input from stdin
 * @returns {Promise<object>} - Parsed JSON input
 */
async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    
    // Check if data is being piped
    if (process.stdin.isTTY) {
      resolve(null);
      return;
    }

    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    
    process.stdin.on('end', () => {
      try {
        if (data.trim()) {
          resolve(JSON.parse(data));
        } else {
          resolve(null);
        }
      } catch (error) {
        reject(new Error('Invalid JSON input'));
      }
    });
    
    process.stdin.on('error', reject);
  });
}

/**
 * Output JSON to stdout
 * @param {object} data - Data to output
 */
function outputJSON(data) {
  console.log('\n===PLACEAI_OUTPUT_START===');
  console.log(JSON.stringify(data, null, 2));
  console.log('===PLACEAI_OUTPUT_END===');
}

/**
 * Print usage information
 * @returns {string} - Usage text
 */
function usage() {
  return `
PlaceAI Agent - Autonomous AI Placement Agent

Usage:
  echo '<json_input>' | node src/index.js
  cat input.json | node src/index.js

Input Format (Single Job):
{
  "resume": "Full resume text...",
  "candidate_name": "John Doe",
  "target_role": "Software Engineer",
  "location": "San Francisco, CA",
  "job": {
    "company": "Tech Corp",
    "role": "Senior Software Engineer",
    "description": "Job description...",
    "requirements": "Job requirements...",
    "hr_email": "hr@techcorp.com"
  }
}

Input Format (Batch Processing):
{
  "resume": "Full resume text...",
  "candidate_name": "John Doe",
  "target_role": "Software Engineer",
  "location": "San Francisco, CA",
  "jobs": [
    { "company": "Company A", "role": "Role A", ... },
    { "company": "Company B", "role": "Role B", ... }
  ]
}

Environment Variables:
  OPENAI_API_KEY     - Your OpenAI API key (required)
  OPENAI_MODEL       - Model to use (default: gpt-4o)
  MINIMUM_SCORE_TO_APPLY - Minimum score to apply (default: 6)
`;
}

// Run main function
main();

export { executePipeline, processBatch };