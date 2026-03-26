// PlaceAI Agent - Job Analysis Module
// Analyzes job postings and extracts requirements

import { callAIWithRetry } from '../services/openai.js';
import { PROMPTS, formatPrompt } from '../utils/prompts.js';

/**
 * Analyze job posting and extract structured requirements
 * @param {object} job - Job posting object
 * @returns {Promise<object>} - Structured job analysis
 */
export async function analyzeJob(job) {
  const prompt = formatPrompt(PROMPTS.JOB_ANALYSIS, {
    company: job.company || 'Unknown',
    role: job.role || 'Unknown',
    description: job.description || '',
    requirements: job.requirements || ''
  });

  const analysis = await callAIWithRetry(
    'You are an expert job requirements analyst. Respond only with valid JSON.',
    prompt,
    true
  );

  // Validate and normalize the response
  return {
    required_skills: Array.isArray(analysis.required_skills) ? analysis.required_skills : [],
    preferred_skills: Array.isArray(analysis.preferred_skills) ? analysis.preferred_skills : [],
    core_expectations: Array.isArray(analysis.core_expectations) ? analysis.core_expectations : [],
    hidden_expectations: Array.isArray(analysis.hidden_expectations) ? analysis.hidden_expectations : [],
    seniority_level: normalizeSeniorityLevel(analysis.seniority_level),
    domain: analysis.domain || 'General',
    culture_signals: Array.isArray(analysis.culture_signals) ? analysis.culture_signals : []
  };
}

/**
 * Normalize seniority level to standard values
 * @param {string} level - Raw seniority level
 * @returns {string} - Normalized level
 */
function normalizeSeniorityLevel(level) {
  if (!level) return 'junior';
  
  const normalized = level.toLowerCase().trim();
  
  if (['fresher', 'entry', 'entry-level', 'graduate', 'intern', 'internship'].includes(normalized)) {
    return 'fresher';
  }
  if (['junior', 'jr', 'associate', 'early-career'].includes(normalized)) {
    return 'junior';
  }
  if (['mid', 'middle', 'intermediate', 'regular'].includes(normalized)) {
    return 'mid';
  }
  if (['senior', 'sr', 'lead', 'principal', 'staff', 'experienced'].includes(normalized)) {
    return 'senior';
  }
  
  return 'junior';
}

/**
 * Extract keywords from job description (fallback method)
 * @param {string} description - Job description text
 * @param {string} requirements - Job requirements text
 * @returns {object} - Extracted keywords
 */
export function extractJobKeywords(description, requirements) {
  const text = `${description} ${requirements}`.toLowerCase();
  
  // Common technical skills to look for
  const techSkills = [
    'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
    'node.js', 'express', 'django', 'flask', 'sql', 'mongodb', 'postgresql',
    'aws', 'azure', 'docker', 'kubernetes', 'git', 'agile', 'scrum'
  ];
  
  // Common soft skills
  const softSkills = [
    'communication', 'leadership', 'teamwork', 'problem-solving',
    'analytical', 'collaboration', 'self-motivated', 'detail-oriented'
  ];
  
  const foundTech = techSkills.filter(skill => text.includes(skill));
  const foundSoft = softSkills.filter(skill => text.includes(skill));
  
  return {
    technical: foundTech,
    soft: foundSoft,
    all: [...foundTech, ...foundSoft]
  };
}

/**
 * Determine if job is suitable for freshers
 * @param {object} jobAnalysis - Analyzed job data
 * @returns {boolean} - Whether job is fresher-friendly
 */
export function isFresherFriendly(jobAnalysis) {
  const fresherIndicators = [
    'fresher', 'entry-level', 'graduate', 'trainee', 'intern',
    '0-1 years', '0-2 years', 'no experience required',
    'will train', 'on-the-job training'
  ];
  
  const allText = [
    ...jobAnalysis.core_expectations,
    ...jobAnalysis.hidden_expectations
  ].join(' ').toLowerCase();
  
  return fresherIndicators.some(indicator => allText.includes(indicator)) ||
         jobAnalysis.seniority_level === 'fresher';
}

export default {
  analyzeJob,
  extractJobKeywords,
  isFresherFriendly
};