import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { cn } from "./ui/utils";
import { type Project } from "../data/mock";
import { useApp } from "../AppContext";
import { groqChatStream, type GroqMessage } from "../lib/groq";

interface ChatMsg {
  role: "user" | "ai";
  text: string;
  /** True while we are still streaming the AI reply */
  streaming?: boolean;
}

/** Build a detailed system prompt from live project data */
function buildSystemPrompt(project: Project | undefined): string {
  if (!project) {
    return `You are DevPilot AI, an expert technical project management assistant.
Answer questions concisely and helpfully. If no project is selected, let the user know.`;
  }

  const spentPct = Math.round((project.spent / project.budgetHigh) * 100);
  const milestonesText = project.milestones
    .map(
      (m) =>
        `  • ${m.name}: $${m.amount.toLocaleString()} — ${m.status} (${m.progress}% done, due ${m.due})`,
    )
    .join("\n");
  const tasksText = project.tasks
    .map((t) => `  • [${t.key}] ${t.title} — ${t.status} (${t.points}pts)`)
    .join("\n");
  const riskText = project.riskFlags.map((f) => `  • ${f}`).join("\n");

  return `You are DevPilot AI, an expert technical project management assistant embedded in the DevPilot platform.
You have access to the following LIVE project data for "${project.name}" — use it to give accurate, grounded answers.

=== PROJECT SNAPSHOT ===
Name: ${project.name}
Domain: ${project.domain}
Description: ${project.description}
Status: ${project.status}
Complexity: ${project.complexity}

=== HEALTH & PROGRESS ===
Overall health: ${project.health}/100
Progress: ${project.progress}%
Risk score: ${project.riskScore}/100
Risk flags:
${riskText}

=== BUDGET ===
Estimated range: $${project.budgetLow.toLocaleString()} – $${project.budgetHigh.toLocaleString()}
Spent to date: $${project.spent.toLocaleString()} (${spentPct}% of upper estimate)

=== TIMELINE ===
Planned start: ${project.predictedStart}
Predicted end: ${project.predictedEnd}
Duration: ${project.timelineWeeks} weeks

=== MILESTONES ===
${milestonesText}

=== CURRENT TASKS ===
${tasksText || "  (none yet)"}

=== INSTRUCTIONS ===
- Respond concisely (2–5 sentences unless detail is truly needed).
- Always ground your answers in the data above; never make up numbers.
- If asked for advice beyond the data, give best-practice guidance and note it is advisory.
- Use a friendly, professional tone.
- Do NOT output markdown headers or bullet-point heavy responses unless explicitly asked for a list.`;
}

const SUGGESTIONS = [
  "How is the project going?",
  "What's the cost estimate?",
  "Any risks I should know about?",
  "When will the project finish?",
];

export function AiAssistant() {
  const { projectId, getProject } = useApp();
  const project = getProject(projectId);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      role: "ai",
      text: "Hi! I'm your DevPilot AI assistant powered by Llama 3.3. Ask me anything about your project's status, cost, timeline, or risks — I read live project data.",
    },
  ]);

  // History for multi-turn context (only committed messages, not streaming placeholder)
  const historyRef = useRef<GroqMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    setLoading(true);

    // Add user message immediately
    const userMsg: ChatMsg = { role: "user", text };
    setMsgs((prev) => [...prev, userMsg]);

    // Build Groq history
    const userGroqMsg: GroqMessage = { role: "user", content: text };
    const messages: GroqMessage[] = [
      { role: "system", content: buildSystemPrompt(project) },
      ...historyRef.current,
      userGroqMsg,
    ];

    // Add streaming placeholder
    setMsgs((prev) => [...prev, { role: "ai", text: "", streaming: true }]);

    try {
      let accumulated = "";
      await groqChatStream(messages, (chunk) => {
        accumulated += chunk;
        setMsgs((prev) => {
          const updated = [...prev];
          // Replace the last message (streaming placeholder)
          updated[updated.length - 1] = {
            role: "ai",
            text: accumulated,
            streaming: true,
          };
          return updated;
        });
      });

      // Finalize: mark as done and commit to history
      setMsgs((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "ai", text: accumulated };
        return updated;
      });

      historyRef.current = [
        ...historyRef.current,
        userGroqMsg,
        { role: "assistant", content: accumulated },
      ];
    } catch (err) {
      const errorText =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setMsgs((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          text: `⚠️ ${errorText}`,
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
        >
          <Sparkles className="size-5" />
          <span className="font-medium text-sm">Ask AI</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-x-3 bottom-3 z-40 flex h-[min(540px,calc(100dvh-1.5rem))] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="grid size-7 place-items-center rounded-md bg-primary/15 text-primary">
                <Sparkles className="size-4" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-medium">AI Assistant</div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  Llama 3.3 · live project data
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {m.text}
                  {m.streaming && m.text === "" && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <span className="inline-block size-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                      <span className="inline-block size-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                      <span className="inline-block size-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                  {m.streaming && m.text !== "" && (
                    <span className="ml-0.5 inline-block h-4 w-px bg-current align-middle animate-pulse" />
                  )}
                </div>
              </div>
            ))}

            {/* Suggestion chips — show only on first message */}
            {msgs.length <= 1 && (
              <div className="space-y-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={loading}
                    className="block w-full rounded-md border border-border px-3 py-2 text-left text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about status, cost, risk…"
              disabled={loading}
              className="flex-1 rounded-md border border-border bg-input-background px-3 py-2 text-sm outline-none focus:border-primary/50 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
