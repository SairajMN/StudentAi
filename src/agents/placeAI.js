// PlaceAI Agent - Main Orchestration Pipeline
// Coordinates all modules to execute the complete job application workflow

import { analyzeResume } from '../modules/resumeAnalyzer.js';
import { analyzeJob } from '../modules/jobAnalyzer.js';
import { scoreMatch, makeApplyDecision } from '../modules/matchScorer.js';
import { optimizeResume } from '../modules/resumeOptimizer.js';
import { generateEmail, generateFallbackEmail, validateEmailQuality } from '../modules/emailGenerator.js';
import { generateInterviewPrep } from '../modules/interviewPrep.js';

/**
 * Execute the complete PlaceAI pipeline
 * @param {object} input - Input data containing resume and job details
 * @returns {Promise<object>} - Complete analysis and recommendations
 */
export async function executePipeline(input) {
  const {
    resume,
    candidate_name,
    target_role,
    location,
    job
  } = input;

  // Validate input
  validateInput(input);

  console.log('🚀 PlaceAI Agent Starting Pipeline...');
  console.log(`📋 Analyzing: ${candidate_name} for ${job.role} at ${job.company}`);

  try {
    // Step 1: Resume Analysis
    console.log('📄 Step 1: Analyzing resume...');
    const resumeAnalysis = await analyzeResume(resume, target_role);
    console.log(`✅ Found ${resumeAnalysis.skills.length} skills, Experience: ${resumeAnalysis.experience_level}`);

    // Step 2: Job Analysis
    console.log('💼 Step 2: Analyzing job requirements...');
    const jobAnalysis = await analyzeJob(job);
    console.log(`✅ Required skills: ${jobAnalysis.required_skills.length}, Seniority: ${jobAnalysis.seniority_level}`);

    // Step 3: Match Scoring
    console.log('🎯 Step 3: Calculating match score...');
    const matchDetails = await scoreMatch(resumeAnalysis, jobAnalysis);
    console.log(`✅ Match Score: ${matchDetails.score}/10 (${matchDetails.skill_overlap_percentage}% skill overlap)`);

    // Step 4: Apply Decision
    console.log('🤔 Step 4: Making apply decision...');
    const applyDecision = makeApplyDecision(matchDetails.score, matchDetails);
    console.log(`✅ Decision: ${applyDecision.apply} - ${applyDecision.reason}`);

    // Initialize optional outputs
    let optimizedResume = '';
    let email = { subject: '', body: '', word_count: 0 };
    let interview = { technical: [], hr: [], tips: [] };

    // Only generate detailed outputs if we should apply
    if (applyDecision.apply === 'YES') {
      // Step 5: Resume Optimization
      console.log('📝 Step 5: Optimizing resume...');
      optimizedResume = await optimizeResume(resume, job, jobAnalysis);
      console.log('✅ Resume optimized for ATS');

      // Step 6: Email Generation
      console.log('📧 Step 6: Generating application email...');
      try {
        email = await generateEmail(candidate_name, job, resumeAnalysis, matchDetails);
        const emailValidation = validateEmailQuality(email);
        if (!emailValidation.is_valid) {
          console.log('⚠️ Email quality issues:', emailValidation.issues);
          email = generateFallbackEmail(candidate_name, job, matchDetails.matching_skills);
        }
      } catch (error) {
        console.log('⚠️ Email generation failed, using fallback');
        email = generateFallbackEmail(candidate_name, job, matchDetails.matching_skills);
      }
      console.log(`✅ Email generated (${email.word_count} words)`);

      // Step 7: Interview Preparation
      console.log('🎤 Step 7: Preparing interview questions...');
      interview = await generateInterviewPrep(job, jobAnalysis, resumeAnalysis);
      console.log(`✅ Generated ${interview.technical.length} technical + ${interview.hr.length} HR questions`);
    } else {
      console.log('⏭️ Skipping optimization steps (score below threshold)');
    }

    // Step 8: Compile Final Output
    console.log('📦 Step 8: Compiling final output...');
    const output = compileOutput(
      resumeAnalysis,
      jobAnalysis,
      matchDetails,
      applyDecision,
      optimizedResume,
      email,
      interview
    );

    console.log('✅ PlaceAI Pipeline Complete!');
    return output;

  } catch (error) {
    console.error('❌ Pipeline Error:', error.message);
    throw new Error(`PlaceAI Pipeline failed: ${error.message}`);
  }
}

/**
 * Validate input data
 * @param {object} input - Input data
 */
function validateInput(input) {
  const required = ['resume', 'candidate_name', 'target_role', 'job'];
  
  for (const field of required) {
    if (!input[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (!input.job.company || !input.job.role) {
    throw new Error('Job must include company and role');
  }

  if (input.resume.length < 50) {
    throw new Error('Resume appears too short. Please provide a complete resume.');
  }
}

/**
 * Compile all outputs into final structured format
 */
function compileOutput(
  resumeAnalysis,
  jobAnalysis,
  matchDetails,
  applyDecision,
  optimizedResume,
  email,
  interview
) {
  return {
    analysis: {
      skills: resumeAnalysis.skills,
      experience_level: resumeAnalysis.experience_level,
      strengths: resumeAnalysis.strengths,
      weaknesses: resumeAnalysis.weaknesses,
      missing_skills: matchDetails.missing_critical_skills
    },
    job_analysis: {
      required_skills: jobAnalysis.required_skills,
      expectations: jobAnalysis.core_expectations
    },
    score: matchDetails.score,
    apply: applyDecision.apply,
    reason: applyDecision.reason,
    optimized_resume: optimizedResume,
    email: {
      subject: email.subject,
      body: email.body
    },
    interview: {
      technical: interview.technical.map(q => ({
        question: q.question,
        answer: q.answer,
        difficulty: q.difficulty
      })),
      hr: interview.hr.map(q => ({
        question: q.question,
        answer: q.answer
      }))
    }
  };
}

/**
 * Process multiple jobs in batch
 * @param {object} input - Base input with resume and candidate info
 * @param {object[]} jobs - Array of job postings
 * @returns {Promise<object[]>} - Array of results sorted by score
 */
export async function processBatch(input, jobs) {
  const results = [];

  for (const job of jobs) {
    try {
      const jobInput = { ...input, job };
      const result = await executePipeline(jobInput);
      results.push(result);
    } catch (error) {
      console.error(`Failed to process job: ${job.role} at ${job.company}`, error.message);
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

export default {
  executePipeline,
  processBatch
};