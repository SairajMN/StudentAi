// PlaceAI Agent - Match Scoring Module
// Scores candidate-job match and makes apply decisions

import { callAIWithRetry } from '../services/openai.js';
import { PROMPTS, formatPrompt } from '../utils/prompts.js';

const MINIMUM_SCORE_TO_APPLY = parseInt(process.env.MINIMUM_SCORE_TO_APPLY) || 6;

/**
 * Score the match between candidate and job
 * @param {object} resumeAnalysis - Analyzed resume data
 * @param {object} jobAnalysis - Analyzed job data
 * @returns {Promise<object>} - Match score and details
 */
export async function scoreMatch(resumeAnalysis, jobAnalysis) {
  const prompt = formatPrompt(PROMPTS.MATCH_SCORING, {
    skills: resumeAnalysis.skills.join(', '),
    experience_level: resumeAnalysis.experience_level,
    strengths: resumeAnalysis.strengths.join(', '),
    experience_summary: formatExperienceSummary(resumeAnalysis),
    required_skills: jobAnalysis.required_skills.join(', '),
    preferred_skills: jobAnalysis.preferred_skills.join(', '),
    expectations: jobAnalysis.core_expectations.join(', '),
    seniority_level: jobAnalysis.seniority_level
  });

  const scoring = await callAIWithRetry(
    'You are a strict recruitment screener. Respond only with valid JSON.',
    prompt,
    true
  );

  // Validate and normalize the response
  const score = Math.min(10, Math.max(1, parseInt(scoring.score) || 5));
  
  return {
    score,
    skill_overlap_percentage: Math.min(100, Math.max(0, parseInt(scoring.skill_overlap_percentage) || 0)),
    matching_skills: Array.isArray(scoring.matching_skills) ? scoring.matching_skills : [],
    missing_critical_skills: Array.isArray(scoring.missing_critical_skills) ? scoring.missing_critical_skills : [],
    assessment: scoring.assessment || 'Unable to assess match'
  };
}

/**
 * Make apply decision based on score
 * @param {number} score - Match score (1-10)
 * @param {object} matchDetails - Detailed match information
 * @returns {object} - Apply decision with reason
 */
export function makeApplyDecision(score, matchDetails) {
  const shouldApply = score >= MINIMUM_SCORE_TO_APPLY;
  
  let reason;
  if (score >= 9) {
    reason = 'Exceptional match - candidate exceeds job requirements. High probability of interview.';
  } else if (score >= 7) {
    reason = 'Strong match - candidate meets most requirements. Good chance of shortlisting.';
  } else if (score >= 6) {
    reason = 'Moderate match - meets minimum requirements but has some gaps. Worth applying with tailored resume.';
  } else if (score >= 4) {
    reason = 'Weak match - significant skill gaps. Not recommended unless candidate is actively learning missing skills.';
  } else {
    reason = 'Poor match - major misalignment with requirements. Do not apply.';
  }

  // Add specific details about gaps
  if (matchDetails.missing_critical_skills?.length > 0) {
    reason += ` Missing: ${matchDetails.missing_critical_skills.slice(0, 3).join(', ')}.`;
  }

  return {
    apply: shouldApply ? 'YES' : 'NO',
    reason,
    confidence: score >= 7 ? 'HIGH' : score >= 5 ? 'MEDIUM' : 'LOW'
  };
}

/**
 * Format experience summary for scoring
 * @param {object} resumeAnalysis - Resume analysis data
 * @returns {string} - Formatted experience summary
 */
function formatExperienceSummary(resumeAnalysis) {
  const parts = [];
  
  if (resumeAnalysis.years_of_experience) {
    parts.push(`${resumeAnalysis.years_of_experience} years of experience`);
  }
  
  if (resumeAnalysis.education && resumeAnalysis.education !== 'Not specified') {
    parts.push(`Education: ${resumeAnalysis.education}`);
  }
  
  if (resumeAnalysis.key_achievements?.length > 0) {
    parts.push(`Key achievements: ${resumeAnalysis.key_achievements.slice(0, 3).join('; ')}`);
  }
  
  return parts.join('. ') || 'Experience details not available';
}

/**
 * Calculate skill overlap percentage (fallback method)
 * @param {string[]} candidateSkills - Candidate's skills
 * @param {string[]} requiredSkills - Job required skills
 * @returns {number} - Overlap percentage
 */
export function calculateSkillOverlap(candidateSkills, requiredSkills) {
  if (!requiredSkills.length) return 100;
  
  const normalizedCandidate = candidateSkills.map(s => s.toLowerCase().trim());
  const normalizedRequired = requiredSkills.map(s => s.toLowerCase().trim());
  
  let matches = 0;
  for (const required of normalizedRequired) {
    if (normalizedCandidate.some(candidate => 
      candidate.includes(required) || required.includes(candidate)
    )) {
      matches++;
    }
  }
  
  return Math.round((matches / normalizedRequired.length) * 100);
}

/**
 * Get missing skills (fallback method)
 * @param {string[]} candidateSkills - Candidate's skills
 * @param {string[]} requiredSkills - Job required skills
 * @returns {string[]} - Missing skills
 */
export function getMissingSkills(candidateSkills, requiredSkills) {
  const normalizedCandidate = candidateSkills.map(s => s.toLowerCase().trim());
  
  return requiredSkills.filter(required => {
    const normalizedRequired = required.toLowerCase().trim();
    return !normalizedCandidate.some(candidate => 
      candidate.includes(normalizedRequired) || normalizedRequired.includes(candidate)
    );
  });
}

export default {
  scoreMatch,
  makeApplyDecision,
  calculateSkillOverlap,
  getMissingSkills
};