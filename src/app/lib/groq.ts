// ---------------------------------------------------------------------------
// Groq API client for DevPilot AI Assistant
// Model: llama-3.3-70b-versatile
// ---------------------------------------------------------------------------
import type { AiPlan } from "../data/mock";

const env = (import.meta as unknown as { env?: Record<string, string> }).env;
const GROQ_API_KEY = env?.VITE_GROQ_API_KEY ?? "";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Calls the Groq chat completion API (non-streaming) and returns the reply text.
 * Throws on network or API errors.
 */
export async function groqChat(
  messages: GroqMessage[],
  maxTokens = 3000,
  responseFormatJson = false,
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("Missing VITE_GROQ_API_KEY in environment variables.");
  }
  const body: Record<string, unknown> = {
    model: GROQ_MODEL,
    messages,
    temperature: 0.5,
    max_tokens: maxTokens,
    stream: false,
  };
  if (responseFormatJson) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => response.statusText);
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  return text.trim();
}

/**
 * Streams a Groq response. Calls `onChunk` for each incremental text chunk
 * and resolves the promise with the full concatenated text when done.
 */
export async function groqChatStream(
  messages: GroqMessage[],
  onChunk: (chunk: string) => void,
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("Missing VITE_GROQ_API_KEY in environment variables.");
  }
  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.6,
      max_tokens: 512,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => response.statusText);
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body reader available.");

  const decoder = new TextDecoder("utf-8");
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const raw = decoder.decode(value, { stream: true });
    // SSE lines: "data: {...}" or "data: [DONE]"
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const chunk: string = json?.choices?.[0]?.delta?.content ?? "";
        if (chunk) {
          full += chunk;
          onChunk(chunk);
        }
      } catch {
        // Ignore malformed SSE chunks
      }
    }
  }

  return full;
}

// ---------------------------------------------------------------------------
// Project plan generation
// ---------------------------------------------------------------------------

const PLAN_SYSTEM_PROMPT = `You are a senior software architect and technical project manager at DevPilot.
Your job is to analyze a project idea and produce a structured technical project plan.

Return ONLY a single valid JSON object — no markdown fences, no explanation, just raw JSON.
The JSON must match this exact schema:
{
  "requirements": {
    "functional": ["string", ...],
    "nonFunctional": ["string", ...]
  },
  "userStories": [
    { "epic": "string", "stories": ["As a ..., I want ..., so that ...", ...] }
  ],
  "architecture": ["string", ...],
  "risks": [
    { "flag": "string", "severity": "high" | "medium" | "low", "note": "string" }
  ],
  "sprints": [
    { "n": 1, "goal": "string", "pts": 20, "weeks": "Wk 1-2" }
  ],
  "erdMermaid": "erDiagram\n  ENTITY ||--o{ OTHER : rel",
  "budget": { "low": 40000, "high": 75000, "currency": "USD" },
  "timeline": { "weeks": 14, "rationale": "string explaining the estimate" }
}

Guidelines:
- functional: 5-7 clear, specific requirements
- nonFunctional: 4-5 items (performance, security, scalability, etc.)
- userStories: 3-4 epics, 2-3 stories each in standard "As a... I want... so that..." format
- architecture: 5-7 specific technology choices with brief rationale
- risks: 3-5 realistic risks with severity and mitigation note
- sprints: 4-6 sprints with realistic story points (15-28) and week ranges
- erdMermaid: valid Mermaid erDiagram with 4-7 entities relevant to the project
- budget.low / budget.high: realistic USD estimates based on team size, complexity, and timeline (e.g. 35000–200000 range)
- timeline.weeks: realistic delivery estimate (8–24 weeks) based on scope
- timeline.rationale: 1-2 sentences explaining how you arrived at the estimate`;

/**
 * Calls Groq to generate a full AiPlan for the given project.
 * Returns the parsed plan or throws on error.
 */
export async function generateProjectPlan(
  name: string,
  description: string,
): Promise<AiPlan> {
  const userPrompt = `Project Name: ${name}

Project Description:
${description}

Generate the complete technical project plan JSON now.`;

  const raw = await groqChat(
    [
      { role: "system", content: PLAN_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    3500,
    true,
  );

  // Clean markdown or extract first JSON object block
  const startIdx = raw.indexOf("{");
  const endIdx = raw.lastIndexOf("}");
  if (startIdx === -1 || endIdx === -1) {
    throw new Error("Invalid response format: No JSON object found.");
  }
  const jsonStr = raw.substring(startIdx, endIdx + 1);

  const parsed = JSON.parse(jsonStr) as AiPlan;

  // Validate top-level keys are present
  const required: (keyof AiPlan)[] = [
    "requirements",
    "userStories",
    "architecture",
    "risks",
    "sprints",
    "erdMermaid",
    "budget",
    "timeline",
  ];
  for (const key of required) {
    if (!(key in parsed)) throw new Error(`Missing key in AI response: ${key}`);
  }

  return parsed;
}
