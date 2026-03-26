// Adzuna API Configuration
const ADZUNA_APP_ID = "45a9d375";
const ADZUNA_API_KEY = "ba1d0eeaf58d54304a60e6d867289d62";
const ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs";

// Open Router AI Configuration
const OPEN_ROUTER_API_KEY =
  "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";
const OPEN_ROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

// CS-related job roles for selection
export const CS_JOB_ROLES = [
  "Software Developer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Machine Learning Engineer",
  "Mobile Developer",
  "Cloud Engineer",
  "Cybersecurity Analyst",
  "QA Engineer",
  "Site Reliability Engineer",
  "Data Engineer",
  "AI Engineer",
  "Blockchain Developer",
];

const N8N_WEBHOOK_URL =
  "https://rtyui.app.n8n.cloud/webhook-test/placement-agent";

export interface PlacementRequest {
  name: string;
  email: string;
  skills: string[];
  targetRole: string;
  location: string;
  resume?: string;
  minScore?: number;
}

export interface JobMatch {
  id?: number;
  role: string;
  company: string;
  location: string;
  score: number;
  reason: string;
  status: string;
  link?: string;
  applyUrl?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  skillsNeeded?: string[];
  emailSubject?: string;
  emailDraft?: string;
  source?: string;
}

export interface PlacementResponse {
  success: boolean;
  jobs?: JobMatch[];
  message?: string;
  error?: string;
  aiCareerGuidance?: string;
  totalMatched?: number;
}

export async function runPlacementAgent(
  data: PlacementRequest,
): Promise<PlacementResponse> {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        skills: data.skills,
        keyword: data.targetRole,
        location: data.location,
        resume: data.resume,
        minScore: data.minScore ?? 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Handle n8n Placement Agent response format
    if (result.status === "success" && result.jobs) {
      const jobs: JobMatch[] = result.jobs.map(
        (job: Record<string, unknown>, index: number) => ({
          id: index + 1,
          role:
            (job.jobTitle as string) || (job.role as string) || "Unknown Role",
          company: (job.company as string) || "Unknown Company",
          location:
            (job.jobLocation as string) ||
            (job.location as string) ||
            "Not specified",
          score: (job.score as number) || 0,
          reason: (job.reason as string) || "",
          status: "Ready",
          link: (job.applyUrl as string) || "",
          applyUrl: (job.applyUrl as string) || "",
          salaryMin: job.salaryMin as number | null | undefined,
          salaryMax: job.salaryMax as number | null | undefined,
          skillsNeeded: (job.skills_needed as string[]) || [],
          emailSubject: (job.emailSubject as string) || "",
          emailDraft: (job.emailDraft as string) || "",
          source: (job.source as string) || "Adzuna",
        }),
      );

      return {
        success: true,
        jobs,
        aiCareerGuidance: result.aiCareerGuidance || "",
        totalMatched: result.totalMatched || jobs.length,
      };
    }

    // Handle different response formats from n8n
    if (Array.isArray(result)) {
      return {
        success: true,
        jobs: result,
      };
    }

    if (result.jobs) {
      return {
        success: true,
        jobs: result.jobs,
      };
    }

    if (result.data) {
      return {
        success: true,
        jobs: Array.isArray(result.data) ? result.data : [result.data],
      };
    }

    // If response is a single job object
    if (result.role || result.company) {
      return {
        success: true,
        jobs: [result],
      };
    }

    return {
      success: true,
      jobs: [],
      message: result.message || "Workflow completed successfully",
    };
  } catch (error) {
    console.error("Placement agent error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Adzuna API - Fetch real jobs
export async function fetchAdzunaJobs(
  role: string,
  location: string = "India",
  resultsPerPage: number = 10,
): Promise<JobMatch[]> {
  try {
    const country = "in"; // India
    const encodedRole = encodeURIComponent(role);
    const encodedLocation = encodeURIComponent(location);

    const url = `${ADZUNA_BASE_URL}/${country}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_API_KEY}&what=${encodedRole}&where=${encodedLocation}&results_per_page=${resultsPerPage}&content-type=application/json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Adzuna API error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    // Map Adzuna results to JobMatch format
    const jobs: JobMatch[] = data.results.map(
      (job: Record<string, unknown>, index: number) => ({
        id: index + 1,
        role: (job.title as string) || role,
        company:
          ((job.company as Record<string, unknown>)?.display_name as string) ||
          "Company Not Listed",
        location:
          ((job.location as Record<string, unknown>)?.display_name as string) ||
          location,
        score: 0, // Will be calculated by AI
        reason: "", // Will be generated by AI
        status: "Ready",
        link: (job.redirect_url as string) || "",
        applyUrl: (job.redirect_url as string) || "",
        salaryMin: (job.salary_min as number) || null,
        salaryMax: (job.salary_max as number) || null,
        skillsNeeded: [],
        source: "Adzuna",
      }),
    );

    return jobs;
  } catch (error) {
    console.error("Adzuna fetch error:", error);
    return [];
  }
}

// Open Router AI - Score and analyze jobs
export async function analyzeJobsWithAI(
  jobs: JobMatch[],
  userSkills: string[],
  targetRole: string,
): Promise<{ jobs: JobMatch[]; guidance: string }> {
  try {
    const jobsDescription = jobs
      .map(
        (job, i) =>
          `${i + 1}. Role: ${job.role}, Company: ${job.company}, Location: ${job.location}, Salary: ${job.salaryMin ? job.salaryMin.toLocaleString() : "Not specified"} - ${job.salaryMax ? job.salaryMax.toLocaleString() : "Not specified"}`,
      )
      .join("\n");

    const prompt = `You are an AI career advisor. Analyze these job listings for a candidate targeting "${targetRole}" with skills: ${userSkills.join(", ")}.

Jobs found:
${jobsDescription}

For each job, provide:
1. A match score (0-100) based on role alignment
2. A brief reason for the score (1-2 sentences)
3. Key skills to highlight when applying (2-3 skills)

Also provide overall career guidance (3-4 sentences) for this candidate.

Respond in JSON format:
{
  "jobScores": [
    {
      "index": 1,
      "score": 85,
      "reason": "Strong match for...",
      "skillsToHighlight": ["React", "TypeScript"]
    }
  ],
  "careerGuidance": "Your guidance here..."
}`;

    const response = await fetch(OPEN_ROUTER_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPEN_ROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Open Router API error! status: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    // Parse AI response
    let parsed;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      console.error("Failed to parse AI response:", aiResponse);
      // Return jobs with default scores
      return {
        jobs: jobs.map((job) => ({
          ...job,
          score: 70,
          reason: "AI analysis unavailable",
        })),
        guidance: "Unable to generate career guidance at this time.",
      };
    }

    // Update jobs with AI scores
    const scoredJobs = jobs.map((job, index) => {
      const scoreData = parsed.jobScores?.find(
        (s: Record<string, unknown>) => s.index === index + 1,
      );
      return {
        ...job,
        score: (scoreData?.score as number) || 70,
        reason: (scoreData?.reason as string) || "Good potential match",
        skillsNeeded: (scoreData?.skillsToHighlight as string[]) || [],
      };
    });

    return {
      jobs: scoredJobs,
      guidance:
        parsed.careerGuidance ||
        "Focus on building relevant skills and networking.",
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    return {
      jobs: jobs.map((job) => ({
        ...job,
        score: 70,
        reason: "AI analysis unavailable",
      })),
      guidance: "Unable to generate career guidance at this time.",
    };
  }
}

// Main function to search jobs with AI analysis
export async function searchJobsWithAI(
  role: string,
  location: string = "India",
  userSkills: string[] = ["JavaScript", "React", "Node.js"],
): Promise<PlacementResponse> {
  try {
    // Step 1: Fetch jobs from Adzuna
    const rawJobs = await fetchAdzunaJobs(role, location, 10);

    if (rawJobs.length === 0) {
      // Return success with empty jobs array instead of error
      // This allows the UI to handle the "no results" case gracefully
      return {
        success: true,
        jobs: [],
        aiCareerGuidance: `No jobs found for "${role}" in "${location}". Try broadening your search criteria, checking different locations, or exploring related roles.`,
        totalMatched: 0,
      };
    }

    // Step 2: Analyze jobs with AI
    const { jobs: scoredJobs, guidance } = await analyzeJobsWithAI(
      rawJobs,
      userSkills,
      role,
    );

    return {
      success: true,
      jobs: scoredJobs,
      aiCareerGuidance: guidance,
      totalMatched: scoredJobs.length,
    };
  } catch (error) {
    console.error("Job search error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Gmail API integration for sending emails
export async function sendEmailViaGmail(
  to: string,
  subject: string,
  body: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // This would integrate with Gmail API or another n8n webhook for email sending
    // For now, we'll use a mailto link as fallback
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, "_blank");
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
