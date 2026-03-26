// PlaceAI Agent - AI Prompts Module
// Contains all prompts for different analysis stages

export const PROMPTS = {
  RESUME_ANALYSIS: `You are an expert resume analyzer and career coach. Analyze the following resume and extract structured information.

RESUME:
{resume}

TARGET ROLE: {target_role}

Provide a JSON response with:
{
  "skills": ["list of technical and soft skills found"],
  "experience_level": "fresher|junior|mid|senior",
  "strengths": ["top 3-5 strengths based on resume"],
  "weaknesses": ["potential weaknesses or gaps"],
  "years_of_experience": number,
  "education": "highest education",
  "key_achievements": ["notable achievements"]
}

Be precise. Do NOT invent skills or experience not present in the resume.`,

  JOB_ANALYSIS: `You are a hiring manager and job requirements analyst. Analyze the following job posting.

JOB POSTING:
Company: {company}
Role: {role}
Description: {description}
Requirements: {requirements}

Provide a JSON response with:
{
  "required_skills": ["must-have skills"],
  "preferred_skills": ["nice-to-have skills"],
  "core_expectations": ["main responsibilities"],
  "hidden_expectations": ["inferred expectations not explicitly stated"],
  "seniority_level": "fresher|junior|mid|senior",
  "domain": "industry/domain",
  "culture_signals": ["company culture indicators"]
}

Focus on extracting concrete, actionable requirements.`,

  MATCH_SCORING: `You are a strict recruitment screener. Score the match between this candidate and job.

CANDIDATE PROFILE:
Skills: {skills}
Experience Level: {experience_level}
Strengths: {strengths}
Experience: {experience_summary}

JOB REQUIREMENTS:
Required Skills: {required_skills}
Preferred Skills: {preferred_skills}
Expectations: {expectations}
Seniority: {seniority_level}

Provide a JSON response with:
{
  "score": number (1-10),
  "skill_overlap_percentage": number (0-100),
  "matching_skills": ["skills that match"],
  "missing_critical_skills": ["required skills candidate lacks"],
  "assessment": "brief honest assessment"
}

SCORING RULES:
- 9-10: Exceptional match, candidate exceeds requirements
- 7-8: Strong match, meets most requirements
- 5-6: Partial match, significant gaps exist
- Below 5: Poor match, major misalignment

Be STRICT and HONEST. Do not inflate scores.`,

  RESUME_OPTIMIZATION: `You are an ATS optimization expert and professional resume writer. Optimize this resume for the specific job.

ORIGINAL RESUME:
{resume}

TARGET JOB:
Company: {company}
Role: {role}
Required Skills: {required_skills}
Key Expectations: {expectations}

RULES:
1. Keep ALL real experience - do NOT fabricate
2. Reorder bullet points to highlight relevant experience first
3. Use strong action verbs (Led, Developed, Implemented, Optimized)
4. Include keywords from job description naturally
5. Quantify achievements where possible
6. Remove or de-emphasize irrelevant content
7. Keep it concise and impactful
8. Ensure ATS compatibility

Provide the optimized resume as plain text, ready to use.`,

  EMAIL_GENERATION: `You are a professional career communication specialist. Write a compelling job application email.

CANDIDATE: {candidate_name}
TARGET ROLE: {role}
COMPANY: {company}
KEY STRENGTHS: {strengths}
MATCHING SKILLS: {matching_skills}

REQUIREMENTS:
- Professional but human tone (NOT robotic)
- 120-180 words exactly
- Personalized for this specific company and role
- Mention 2-3 relevant strengths naturally
- Show genuine enthusiasm
- Include a clear call-to-action
- NO generic phrases like "I am writing to apply"
- NO fluff or filler words
- Sound like a real person, not AI

Provide a JSON response:
{
  "subject": "concise, compelling email subject line",
  "body": "complete email body"
}`,

  INTERVIEW_TECHNICAL: `You are a technical interviewer for this role. Generate interview questions.

ROLE: {role}
REQUIRED SKILLS: {required_skills}
CANDIDATE SKILLS: {candidate_skills}

Generate 5 technical questions with ideal answers.

Provide a JSON array:
[
  {
    "question": "technical question",
    "answer": "ideal comprehensive answer",
    "difficulty": "Easy|Medium|Hard",
    "skill_tested": "which skill this tests"
  }
]

Make questions practical and role-specific, not generic.`,

  INTERVIEW_HR: `You are an HR interviewer. Generate behavioral/HR interview questions.

ROLE: {role}
COMPANY: {company}
CANDIDATE STRENGTHS: {strengths}

Generate 3 HR questions with ideal answers.

Provide a JSON array:
[
  {
    "question": "behavioral question",
    "answer": "ideal answer using STAR method",
    "what_it_tests": "what this question evaluates"
  }
]

Focus on questions relevant to this specific role and company.`
};

// Helper function to format prompts with variables
export function formatPrompt(template, variables) {
  let formatted = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{${key}}`;
    const valueStr = Array.isArray(value) ? value.join(', ') : String(value);
    formatted = formatted.replace(new RegExp(placeholder, 'g'), valueStr);
  }
  return formatted;
}