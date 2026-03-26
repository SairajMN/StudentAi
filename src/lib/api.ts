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
