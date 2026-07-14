import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { cn } from "./ui/utils";
import { type Project } from "../data/mock";
import { useApp } from "../AppContext";

interface ChatMsg { role: "user" | "ai"; text: string; }

// Canned, project-grounded answers. In production these come from Gemini
// function-calling over the live project DB (see PRD §5 AI Chat Assistant).
function answer(q: string, p: Project | undefined): string {
  if (!p) return "I couldn't find that project.";
  const lower = q.toLowerCase();
  if (lower.includes("cost") || lower.includes("budget") || lower.includes("pay")) {
    return `${p.name} is estimated at $${p.budgetLow.toLocaleString()}–$${p.budgetHigh.toLocaleString()}. So far $${p.spent.toLocaleString()} has been spent (${Math.round((p.spent / p.budgetHigh) * 100)}% of the upper estimate). Note: this is an AI estimate, not a fixed quote.`;
  }
  if (lower.includes("risk")) {
    return `The current risk score is ${p.riskScore}/100. Top flags: ${p.riskFlags.join(", ")}. The main driver is the Plaid integration scope, which historically adds 1–2 sprints.`;
  }
  if (lower.includes("time") || lower.includes("when") || lower.includes("deadline") || lower.includes("finish")) {
    return `Predicted completion is around ${new Date(p.predictedEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} (${p.timelineWeeks}-week plan). The project is ${p.progress}% complete and tracking on schedule.`;
  }
  if (lower.includes("health") || lower.includes("status") || lower.includes("going")) {
    return `${p.name} has a health score of ${p.health}/100 and is ${p.progress}% complete. The Bank Reconciliation milestone is in review at 78%. Overall it's tracking well.`;
  }
  if (lower.includes("team") || lower.includes("who")) {
    return `The team has ${p.team.length} members including your Technical Manager Lina Haddad and engineers across frontend, backend, and AI. Ask me about anyone's availability.`;
  }
  return `Here's what I know about ${p.name}: it's ${p.progress}% complete with a health score of ${p.health}. Try asking about cost, timeline, risk, or the team.`;
}

const SUGGESTIONS = ["How is the project going?", "What's the cost estimate?", "Any risks I should know about?"];

export function AiAssistant() {
  const { projectId, getProject } = useApp();
  const project = getProject(projectId);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: "ai", text: "Hi! I'm your DevPilot assistant. Ask me anything about your project's status, cost, timeline, or risks — I read live project data." },
  ]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }, { role: "ai", text: answer(text, project) }]);
    setInput("");
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105"
        >
          <Sparkles className="size-5" />
          <span className="font-medium text-sm">Ask AI</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-40 flex h-[520px] w-96 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="grid size-7 place-items-center rounded-md bg-primary/15 text-primary">
                <Sparkles className="size-4" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-medium">AI Assistant</div>
                <div className="text-[10px] text-muted-foreground font-mono">Grounded on live data</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {msgs.length <= 1 && (
              <div className="space-y-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full rounded-md border border-border px-3 py-2 text-left text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about status, cost, risk…"
              className="flex-1 rounded-md border border-border bg-input-background px-3 py-2 text-sm outline-none focus:border-primary/50"
            />
            <button type="submit" className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
