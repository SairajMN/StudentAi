// PlaceAI Agent - Interview Preparation Module
// Generates technical and HR interview questions with answers

import { callAIWithRetry } from '../services/openai.js';
import { PROMPTS, formatPrompt } from '../utils/prompts.js';

/**
 * Generate technical interview questions
 * @param {object} job - Job posting object
 * @param {object} jobAnalysis - Analyzed job data
 * @param {string[]} candidateSkills - Candidate's skills
 * @returns {Promise<object[]>} - Array of technical questions
 */
export async function generateTechnicalQuestions(job, jobAnalysis, candidateSkills) {
  const prompt = formatPrompt(PROMPTS.INTERVIEW_TECHNICAL, {
    role: job.role || 'Unknown',
    required_skills: jobAnalysis.required_skills.join(', '),
    candidate_skills: candidateSkills.join(', ')
  });

  const questions = await callAIWithRetry(
    'You are a technical interviewer. Respond only with valid JSON array.',
    prompt,
    true
  );

  // Validate and normalize questions
  return normalizeQuestions(questions, 'technical');
}

/**
 * Generate HR interview questions
 * @param {object} job - Job posting object
 * @param {string[]} candidateStrengths - Candidate's strengths
 * @returns {Promise<object[]>} - Array of HR questions
 */
export async function generateHRQuestions(job, candidateStrengths) {
  const prompt = formatPrompt(PROMPTS.INTERVIEW_HR, {
    role: job.role || 'Unknown',
    company: job.company || 'Unknown',
    strengths: candidateStrengths.join(', ')
  });

  const questions = await callAIWithRetry(
    'You are an HR interviewer. Respond only with valid JSON array.',
    prompt,
    true
  );

  // Validate and normalize questions
  return normalizeQuestions(questions, 'hr');
}

/**
 * Normalize and validate questions
 * @param {object[]} questions - Raw questions from AI
 * @param {string} type - Question type (technical/hr)
 * @returns {object[]} - Normalized questions
 */
function normalizeQuestions(questions, type) {
  if (!Array.isArray(questions)) {
    return generateFallbackQuestions(type);
  }

  return questions.map((q, index) => {
    if (type === 'technical') {
      return {
        question: q.question || `Technical Question ${index + 1}`,
        answer: q.answer || 'Answer not provided',
        difficulty: normalizeDifficulty(q.difficulty),
        skill_tested: q.skill_tested || 'General'
      };
    } else {
      return {
        question: q.question || `HR Question ${index + 1}`,
        answer: q.answer || 'Answer not provided',
        what_it_tests: q.what_it_tests || 'General fit'
      };
    }
  }).filter(q => q.question && q.answer);
}

/**
 * Normalize difficulty level
 * @param {string} difficulty - Raw difficulty
 * @returns {string} - Normalized difficulty
 */
function normalizeDifficulty(difficulty) {
  if (!difficulty) return 'Medium';
  
  const normalized = difficulty.toLowerCase().trim();
  
  if (['easy', 'basic', 'beginner', 'simple'].includes(normalized)) {
    return 'Easy';
  }
  if (['hard', 'difficult', 'advanced', 'complex', 'challenging'].includes(normalized)) {
    return 'Hard';
  }
  
  return 'Medium';
}

/**
 * Generate fallback questions when AI fails
 * @param {string} type - Question type
 * @returns {object[]} - Fallback questions
 */
function generateFallbackQuestions(type) {
  if (type === 'technical') {
    return [
      {
        question: 'Describe a challenging technical problem you solved recently.',
        answer: 'Use the STAR method: Situation, Task, Action, Result. Focus on the technical approach and impact.',
        difficulty: 'Medium',
        skill_tested: 'Problem-solving'
      },
      {
        question: 'How do you ensure code quality in your projects?',
        answer: 'Discuss testing strategies, code reviews, linting, CI/CD practices, and documentation.',
        difficulty: 'Easy',
        skill_tested: 'Best practices'
      },
      {
        question: 'Explain your experience with version control systems.',
        answer: 'Cover Git workflows, branching strategies, merge conflicts resolution, and collaboration.',
        difficulty: 'Easy',
        skill_tested: 'Tools'
      }
    ];
  } else {
    return [
      {
        question: 'Tell me about yourself and your career goals.',
        answer: 'Provide a concise professional summary, highlight relevant experience, and align goals with the role.',
        what_it_tests: 'Self-awareness and fit'
      },
      {
        question: 'Why do you want to work at this company?',
        answer: 'Research the company, mention specific values/products that appeal to you, and connect to your career goals.',
        what_it_tests: 'Motivation and research'
      },
      {
        question: 'Describe a time you worked effectively in a team.',
        answer: 'Use STAR method: highlight your role, communication skills, and positive outcome.',
        what_it_tests: 'Teamwork and collaboration'
      }
    ];
  }
}

/**
 * Generate complete interview prep package
 * @param {object} job - Job posting
 * @param {object} jobAnalysis - Analyzed job data
 * @param {object} resumeAnalysis - Analyzed resume data
 * @returns {Promise<object>} - Complete interview prep
 */
export async function generateInterviewPrep(job, jobAnalysis, resumeAnalysis) {
  const [technical, hr] = await Promise.all([
    generateTechnicalQuestions(job, jobAnalysis, resumeAnalysis.skills),
    generateHRQuestions(job, resumeAnalysis.strengths)
  ]);

  return {
    technical: technical.slice(0, 5), // Ensure max 5 technical questions
    hr: hr.slice(0, 3), // Ensure max 3 HR questions
    tips: generateInterviewTips(jobAnalysis)
  };
}

/**
 * Generate general interview tips
 * @param {object} jobAnalysis - Analyzed job data
 * @returns {string[]} - Interview tips
 */
function generateInterviewTips(jobAnalysis) {
  const tips = [
    'Research the company thoroughly before the interview',
    'Prepare specific examples using the STAR method',
    'Have questions ready to ask the interviewer'
  ];

  // Add role-specific tips
  if (jobAnalysis.required_skills.some(s => s.toLowerCase().includes('technical'))) {
    tips.push('Be ready for live coding or whiteboard exercises');
  }

  if (jobAnalysis.seniority_level === 'senior') {
    tips.push('Prepare to discuss leadership experiences and architectural decisions');
  }

  if (jobAnalysis.culture_signals.some(s => s.toLowerCase().includes('fast-paced'))) {
    tips.push('Emphasize your ability to work in fast-paced environments');
  }

  return tips;
}

export default {
  generateTechnicalQuestions,
  generateHRQuestions,
  generateInterviewPrep
};