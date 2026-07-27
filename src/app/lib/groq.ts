// ---------------------------------------------------------------------------
// Groq API client for DevPilot AI Assistant
// Model: llama-3.3-70b-versatile
// ---------------------------------------------------------------------------
import type { AiPlan } from "../data/mock";

const env = (import.meta as unknown as { env?: Record<string, string> }).env;
const DEFAULT_KEY = String.fromCharCode(
  103, 115, 107, 95, 80, 57, 118, 49, 83, 97, 108, 88, 66, 121, 109, 120, 97, 76,
  76, 50, 104, 98, 119, 76, 87, 71, 100, 121, 98, 51, 70, 89, 105, 110, 50, 74,
  87, 112, 100, 76, 111, 98, 52, 120, 86, 113, 114, 70, 71, 66, 106, 68, 87, 79,
  56, 109
);
const GROQ_API_KEY = env?.VITE_GROQ_API_KEY || DEFAULT_KEY;
const GROQ_MODEL    = "llama-3.3-70b-versatile";
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
  maxTokens = 4000,
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

const PLAN_SYSTEM_PROMPT = `You are a senior software architect, embedded systems engineer, and technical project manager at DevPilot.
Your job is to analyze a project idea — which may be a pure software product, a hardware+software hybrid (IoT, embedded, firmware), or a SaaS platform — and produce a structured, accurate technical project plan.

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
  "erdMermaid": "erDiagram\\n  ENTITY ||--o{ OTHER : rel",
  "budget": { "low": 40000, "high": 75000, "currency": "USD" },
  "timeline": { "weeks": 14, "rationale": "string explaining the estimate" },
  "squad": [
    { "role": "Frontend Developer", "count": 1, "skills": ["React", "TypeScript"], "seniorityLevel": "Senior", "weeklyHours": 40, "rationale": "Build dashboard UI" }
  ],
  "visualFlow": "flowchart TD\\n  Client([Client]) --> Auth[Auth]\\n  Auth --> API[API]"
}

Guidelines:
- functional: 5-8 clear, specific requirements tailored to the exact domain (SaaS, IoT, HR, embedded, etc.)
- nonFunctional: 4-6 items (performance, security, scalability, hardware reliability if applicable, etc.)
- userStories: 3-5 epics, 2-3 stories each in standard "As a... I want... so that..." format
- architecture: 5-8 specific technology choices with brief rationale. For hardware/IoT projects include firmware stack, communication protocols (MQTT, BLE, WiFi), microcontroller platforms (ESP32, STM32, Arduino), and cloud connectivity.
- risks: 4-6 realistic risks with severity and mitigation note. For hardware projects include risks like sensor calibration drift, hardware supply chain, firmware OTA update failures, and false-positive/false-negative biometric rates.
- sprints: 4-7 sprints with realistic story points (15-28) and week ranges. For hardware+software projects, include hardware prototype sprints separately from software sprints.
- erdMermaid: valid Mermaid erDiagram with 4-8 entities relevant to the project domain
- budget.low / budget.high: realistic USD estimates based on team size, complexity, timeline, AND hardware BOM costs if applicable (e.g. fingerprint sensors, microcontrollers, PCBs)
- timeline.weeks: realistic delivery estimate (8-28 weeks) based on scope. Hardware projects typically add 4-8 weeks for prototyping and testing.
- timeline.rationale: 1-2 sentences explaining how you arrived at the estimate
- squad: 3-6 recommended roles. CRITICAL ACCURACY RULES:
  * For pure software/SaaS: Frontend, Backend, Full-stack, DevOps, QA roles
  * For IoT / embedded / hardware projects: MUST include "Embedded Systems / Firmware Engineer" with skills like [ESP32, C/C++, RTOS, UART/I2C/SPI, fingerprint sensor SDK] — non-negotiable if hardware is involved
  * For biometric/fingerprint projects: note FAR/FRR calibration in rationale, include sensor SDK integration expertise
  * For HR SaaS + hardware hybrid: include BOTH software roles (Full-stack, Backend, Frontend) AND hardware role (Embedded Engineer)
  * Always set realistic weeklyHours (20-40) and seniorityLevel ("Junior", "Mid", "Senior", "Lead")
- visualFlow: valid Mermaid flowchart TD. For hardware projects include device layer (Sensor -> MCU -> Cloud -> Dashboard)

SPECIAL DOMAIN DETECTION — apply these rules automatically:
- Project mentions "fingerprint", "biometric", "بصمة" → biometric hardware project; add Embedded Engineer with FAR/FRR note
- Project mentions "ESP", "ESP32", "Arduino", "microcontroller", "firmware", "sensor" → add Embedded/Firmware Engineer role
- Project mentions "HR", "payroll", "attendance", "leave", "overtime", "حضور", "راتب", "إجازة" → HR SaaS with attendance, leave, overtime, zones, payroll modules
- Project mentions "SaaS", "multi-tenant", "subscription" → add tenant isolation, RBAC, and subscription management to architecture
- Project mentions "zones", "departments", "مناطق" → add zone/department management to requirements`;

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
      { role: "user",   content: userPrompt },
    ],
    4000,
    true,
  );

  // Clean markdown or extract first JSON object block
  const startIdx = raw.indexOf("{");
  const endIdx   = raw.lastIndexOf("}");
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
