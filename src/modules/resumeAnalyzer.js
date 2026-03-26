// PlaceAI Agent - Resume Analysis Module
// Analyzes resume and extracts structured information

import { callAIWithRetry } from '../services/openai.js';
import { PROMPTS, formatPrompt } from '../utils/prompts.js';

/**
 * Analyze resume and extract key information
 * @param {string} resume - Full resume text
 * @param {string} targetRole - Target job role
 * @returns {Promise<object>} - Structured resume analysis
 */
export async function analyzeResume(resume, targetRole) {
  const prompt = formatPrompt(PROMPTS.RESUME_ANALYSIS, {
    resume,
    target_role: targetRole
  });

  const analysis = await callAIWithRetry(
    'You are an expert resume analyzer. Respond only with valid JSON.',
    prompt,
    true
  );

  // Validate and normalize the response
  return {
    skills: Array.isArray(analysis.skills) ? analysis.skills : [],
    experience_level: normalizeExperienceLevel(analysis.experience_level),
    strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
    weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
    years_of_experience: typeof analysis.years_of_experience === 'number' 
      ? analysis.years_of_experience 
      : estimateYears(analysis.experience_level),
    education: analysis.education || 'Not specified',
    key_achievements: Array.isArray(analysis.key_achievements) ? analysis.key_achievements : []
  };
}

/**
 * Normalize experience level to standard values
 * @param {string} level - Raw experience level
 * @returns {string} - Normalized level
 */
function normalizeExperienceLevel(level) {
  if (!level) return 'junior';
  
  const normalized = level.toLowerCase().trim();
  
  if (['fresher', 'entry', 'entry-level', 'graduate', '0'].includes(normalized)) {
    return 'fresher';
  }
  if (['junior', 'jr', '1-2', 'early'].includes(normalized)) {
    return 'junior';
  }
  if (['mid', 'middle', 'intermediate', '3-5'].includes(normalized)) {
    return 'mid';
  }
  if (['senior', 'sr', 'lead', '5+', 'experienced'].includes(normalized)) {
    return 'senior';
  }
  
  return 'junior';
}

/**
 * Estimate years from experience level
 * @param {string} level - Experience level
 * @returns {number} - Estimated years
 */
function estimateYears(level) {
  const estimates = {
    'fresher': 0,
    'junior': 1,
    'mid': 4,
    'senior': 7
  };
  return estimates[level] || 2;
}

/**
 * Extract skills from resume text using pattern matching (fallback)
 * @param {string} resume - Resume text
 * @returns {string[]} - Extracted skills
 */
export function extractSkillsFallback(resume) {
  const skillPatterns = [
    // Programming Languages
    /javascript|typescript|python|java|c\+\+|c#|ruby|go|rust|swift|kotlin|php|scala|r\b/gi,
    // Frameworks
    /react|angular|vue|node\.?js|express|django|flask|spring|rails|next\.?js|nest\.?js/gi,
    // Databases
    /sql|mysql|postgresql|mongodb|redis|elasticsearch|dynamodb|cassandra|firebase/gi,
    // Cloud/DevOps
    /aws|azure|gcp|docker|kubernetes|jenkins|ci\/cd|terraform|ansible|linux/gi,
    // Tools
    /git|github|gitlab|jira|agile|scrum|figma|photoshop|excel|tableau/gi,
    // Soft Skills
    /leadership|communication|problem.solving|teamwork|analytical|project.management/gi
  ];

  const skills = new Set();
  const text = resume.toLowerCase();

  for (const pattern of skillPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(skill => skills.add(skill.trim()));
    }
  }

  return Array.from(skills);
}

export default {
  analyzeResume,
  extractSkillsFallback
};