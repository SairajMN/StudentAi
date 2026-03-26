// PlaceAI Agent - Resume Optimization Module
// Optimizes resume for specific job applications

import { callAIWithRetry } from '../services/openai.js';
import { PROMPTS, formatPrompt } from '../utils/prompts.js';

/**
 * Optimize resume for a specific job
 * @param {string} resume - Original resume text
 * @param {object} job - Job posting object
 * @param {object} jobAnalysis - Analyzed job data
 * @returns {Promise<string>} - Optimized resume text
 */
export async function optimizeResume(resume, job, jobAnalysis) {
  const prompt = formatPrompt(PROMPTS.RESUME_OPTIMIZATION, {
    resume,
    company: job.company || 'Unknown',
    role: job.role || 'Unknown',
    required_skills: jobAnalysis.required_skills.join(', '),
    expectations: jobAnalysis.core_expectations.join(', ')
  });

  const optimizedResume = await callAIWithRetry(
    'You are an ATS optimization expert. Provide the optimized resume as plain text.',
    prompt,
    false
  );

  return optimizedResume;
}

/**
 * Apply ATS-friendly formatting to resume
 * @param {string} resume - Resume text
 * @returns {string} - ATS-optimized resume
 */
export function applyATSFormatting(resume) {
  let formatted = resume;

  // Remove special characters that might confuse ATS
  formatted = formatted.replace(/[•●○◦▪▸►]/g, '-');
  
  // Ensure consistent date formats
  formatted = formatted.replace(/(\d{1,2})\/(\d{4})/g, '$1/$2');
  formatted = formatted.replace(/(\w+ \d{4})\s*[-–]\s*(\w+ \d{4})/g, '$1 - $2');
  
  // Normalize section headers
  const sectionHeaders = [
    'EXPERIENCE', 'EDUCATION', 'SKILLS', 'PROJECTS',
    'CERTIFICATIONS', 'ACHIEVEMENTS', 'SUMMARY'
  ];
  
  for (const header of sectionHeaders) {
    const regex = new RegExp(`^\\s*${header}\\s*$`, 'gmi');
    formatted = formatted.replace(regex, header);
  }
  
  // Remove excessive whitespace
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  formatted = formatted.replace(/[ \t]+/g, ' ');
  
  return formatted.trim();
}

/**
 * Extract keywords from job for resume optimization
 * @param {object} jobAnalysis - Analyzed job data
 * @returns {string[]} - Keywords to include in resume
 */
export function extractOptimizationKeywords(jobAnalysis) {
  const keywords = new Set();
  
  // Add required skills
  jobAnalysis.required_skills.forEach(skill => keywords.add(skill.toLowerCase()));
  
  // Add preferred skills
  jobAnalysis.preferred_skills.forEach(skill => keywords.add(skill.toLowerCase()));
  
  // Extract keywords from expectations
  const expectationKeywords = extractKeywordsFromText(
    jobAnalysis.core_expectations.join(' ')
  );
  expectationKeywords.forEach(kw => keywords.add(kw));
  
  return Array.from(keywords);
}

/**
 * Extract keywords from text using common patterns
 * @param {string} text - Text to extract keywords from
 * @returns {string[]} - Extracted keywords
 */
function extractKeywordsFromText(text) {
  const keywords = [];
  const lowerText = text.toLowerCase();
  
  // Common action verbs in job descriptions
  const actionVerbs = [
    'develop', 'design', 'implement', 'build', 'create', 'manage',
    'lead', 'analyze', 'optimize', 'collaborate', 'communicate'
  ];
  
  // Technical terms patterns
  const techPatterns = [
    /\b(api|rest|graphql|microservices|cloud|agile|scrum|devops)\b/gi,
    /\b(frontend|backend|fullstack|full-stack|database|server)\b/gi,
    /\b(testing|qa|ci\/cd|deployment|automation)\b/gi
  ];
  
  // Extract action verbs
  for (const verb of actionVerbs) {
    if (lowerText.includes(verb)) {
      keywords.push(verb);
    }
  }
  
  // Extract technical terms
  for (const pattern of techPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => keywords.push(match.toLowerCase()));
    }
  }
  
  return keywords;
}

/**
 * Generate resume improvement suggestions
 * @param {string} resume - Original resume
 * @param {object} matchDetails - Match scoring details
 * @returns {string[]} - Improvement suggestions
 */
export function generateImprovementSuggestions(resume, matchDetails) {
  const suggestions = [];
  
  // Check for missing critical skills
  if (matchDetails.missing_critical_skills?.length > 0) {
    suggestions.push(
      `Consider adding experience with: ${matchDetails.missing_critical_skills.slice(0, 3).join(', ')}`
    );
  }
  
  // Check for quantifiable achievements
  const hasNumbers = /\d+%|\$\d+|\d+ users|\d+ customers/i.test(resume);
  if (!hasNumbers) {
    suggestions.push('Add quantifiable achievements (e.g., "Increased efficiency by 30%")');
  }
  
  // Check for action verbs
  const actionVerbs = ['led', 'developed', 'implemented', 'designed', 'managed', 'created'];
  const hasActionVerbs = actionVerbs.some(verb => resume.toLowerCase().includes(verb));
  if (!hasActionVerbs) {
    suggestions.push('Start bullet points with strong action verbs (Led, Developed, Implemented)');
  }
  
  // Check resume length
  const wordCount = resume.split(/\s+/).length;
  if (wordCount < 200) {
    suggestions.push('Resume seems too short - add more details about your experience');
  } else if (wordCount > 1000) {
    suggestions.push('Resume is lengthy - consider condensing to 1-2 pages');
  }
  
  return suggestions;
}

export default {
  optimizeResume,
  applyATSFormatting,
  extractOptimizationKeywords,
  generateImprovementSuggestions
};