// PlaceAI Agent - Email Generation Module
// Generates high-conversion job application emails

import { callAIWithRetry } from '../services/openai.js';
import { PROMPTS, formatPrompt } from '../utils/prompts.js';

const MAX_EMAIL_WORDS = parseInt(process.env.MAX_EMAIL_WORDS) || 180;
const MIN_EMAIL_WORDS = parseInt(process.env.MIN_EMAIL_WORDS) || 120;

/**
 * Generate job application email
 * @param {string} candidateName - Candidate's name
 * @param {object} job - Job posting object
 * @param {object} resumeAnalysis - Analyzed resume data
 * @param {object} matchDetails - Match scoring details
 * @returns {Promise<object>} - Email subject and body
 */
export async function generateEmail(candidateName, job, resumeAnalysis, matchDetails) {
  const prompt = formatPrompt(PROMPTS.EMAIL_GENERATION, {
    candidate_name: candidateName,
    role: job.role || 'Unknown',
    company: job.company || 'Unknown',
    strengths: resumeAnalysis.strengths.join(', '),
    matching_skills: matchDetails.matching_skills.join(', ')
  });

  const email = await callAIWithRetry(
    'You are a professional career communication specialist. Respond only with valid JSON.',
    prompt,
    true
  );

  // Validate and optimize the email
  let body = email.body || '';
  let subject = email.subject || '';

  // Ensure word count is within range
  const wordCount = body.split(/\s+/).length;
  if (wordCount > MAX_EMAIL_WORDS) {
    body = truncateToWordCount(body, MAX_EMAIL_WORDS);
  }

  // Clean up the email
  body = cleanEmailBody(body);
  subject = cleanSubjectLine(subject);

  return {
    subject,
    body,
    word_count: body.split(/\s+/).length
  };
}

/**
 * Clean and format email body
 * @param {string} body - Raw email body
 * @returns {string} - Cleaned email body
 */
function cleanEmailBody(body) {
  let cleaned = body;

  // Remove any markdown formatting
  cleaned = cleaned.replace(/\*\*/g, '');
  cleaned = cleaned.replace(/\*/g, '');
  
  // Remove placeholder text
  cleaned = cleaned.replace(/\[.*?\]/g, '');
  cleaned = cleaned.replace(/\{.*?\}/g, '');
  
  // Fix common issues
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Ensure proper greeting
  if (!cleaned.match(/^(Dear|Hello|Hi)\s/i)) {
    cleaned = `Dear Hiring Manager,\n\n${cleaned}`;
  }
  
  // Ensure proper closing
  if (!cleaned.match(/(regards|sincerely|best|thank)/i)) {
    cleaned = `${cleaned}\n\nBest regards`;
  }
  
  return cleaned.trim();
}

/**
 * Clean and format email subject line
 * @param {string} subject - Raw subject line
 * @returns {string} - Cleaned subject line
 */
function cleanSubjectLine(subject) {
  let cleaned = subject;
  
  // Remove quotes if present
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  
  // Remove "Subject:" prefix if present
  cleaned = cleaned.replace(/^subject:\s*/i, '');
  
  // Trim and limit length
  cleaned = cleaned.trim();
  if (cleaned.length > 100) {
    cleaned = cleaned.substring(0, 97) + '...';
  }
  
  return cleaned;
}

/**
 * Truncate text to specific word count
 * @param {string} text - Text to truncate
 * @param {number} maxWords - Maximum word count
 * @returns {string} - Truncated text
 */
function truncateToWordCount(text, maxWords) {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  
  const truncated = words.slice(0, maxWords).join(' ');
  
  // Try to end at a sentence
  const lastPeriod = truncated.lastIndexOf('.');
  if (lastPeriod > truncated.length * 0.7) {
    return truncated.substring(0, lastPeriod + 1);
  }
  
  return truncated + '...';
}

/**
 * Generate fallback email when AI generation fails
 * @param {string} candidateName - Candidate's name
 * @param {object} job - Job posting object
 * @param {string[]} matchingSkills - Matching skills
 * @returns {object} - Basic email template
 */
export function generateFallbackEmail(candidateName, job, matchingSkills) {
  const role = job.role || 'the position';
  const company = job.company || 'your company';
  const skills = matchingSkills.slice(0, 3).join(', ') || 'relevant technical skills';

  return {
    subject: `Application for ${role} - ${candidateName}`,
    body: `Dear Hiring Manager,

I am excited to apply for the ${role} position at ${company}. With strong experience in ${skills}, I am confident I can contribute effectively to your team.

My background aligns well with your requirements, and I am particularly drawn to this opportunity because of the chance to work on impactful projects.

I would welcome the opportunity to discuss how my skills and enthusiasm can benefit your team. Thank you for considering my application.

Best regards,
${candidateName}`,
    word_count: 85
  };
}

/**
 * Validate email quality
 * @param {object} email - Generated email object
 * @returns {object} - Validation result
 */
export function validateEmailQuality(email) {
  const issues = [];
  const body = email.body || '';
  const subject = email.subject || '';

  // Check word count
  const wordCount = body.split(/\s+/).length;
  if (wordCount < MIN_EMAIL_WORDS) {
    issues.push(`Email too short (${wordCount} words, minimum ${MIN_EMAIL_WORDS})`);
  }
  if (wordCount > MAX_EMAIL_WORDS) {
    issues.push(`Email too long (${wordCount} words, maximum ${MAX_EMAIL_WORDS})`);
  }

  // Check for generic phrases
  const genericPhrases = [
    'i am writing to apply',
    'please find my resume',
    'i would like to express my interest',
    'to whom it may concern'
  ];
  
  for (const phrase of genericPhrases) {
    if (body.toLowerCase().includes(phrase)) {
      issues.push(`Contains generic phrase: "${phrase}"`);
    }
  }

  // Check for placeholders
  if (body.includes('[') || body.includes('{')) {
    issues.push('Contains unfilled placeholders');
  }

  // Check subject line
  if (!subject || subject.length < 10) {
    issues.push('Subject line too short or missing');
  }

  return {
    is_valid: issues.length === 0,
    issues,
    word_count: wordCount
  };
}

export default {
  generateEmail,
  generateFallbackEmail,
  validateEmailQuality
};