import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { chatInput, sessionId, history, resumeText, fileName } = req.body;

    const webhookUrl =
      "https://rtyui.app.n8n.cloud/webhook/3babe261-ee55-46b6-b2c9-2d6c918b939c/chat";

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatInput: chatInput || "",
        sessionId: sessionId || "anonymous",
        history: history || [],
        resumeText: resumeText || "",
        fileName: fileName || "",
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }

    const data = await response.json();

    // n8n chat webhooks usually return { output: "..." } or similar
    const output =
      data.output ||
      data.response ||
      data.text ||
      (typeof data === "string"
        ? data
        : "I received a response but couldn't parse the message content.");

    return res.status(200).json({ output, data });
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({
      error: "Failed to process request",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
