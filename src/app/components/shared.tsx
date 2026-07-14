import { cn } from "./ui/utils";
import { Badge } from "./ui/badge";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

// A small label rendered in mono — used for keys, metrics, statuses.
export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-mono", className)}>{children}</span>;
}

// Card surface used everywhere.
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card", className)}>{children}</div>
  );
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h3 className="text-foreground">{children}</h3>
      {hint && <span className="text-xs text-muted-foreground font-mono">{hint}</span>}
    </div>
  );
}

// Marks AI-generated content per the PRD guardrail.
export function AiTag({ label = "AI generated · estimate" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
      <Sparkles className="size-3" /> {label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: "primary" | "success" | "warning" | "destructive";
  icon?: ReactNode;
}) {
  const accentColor =
    accent === "success"
      ? "text-success"
      : accent === "warning"
      ? "text-warning"
      : accent === "destructive"
      ? "text-destructive"
      : "text-primary";
  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground font-mono">{label}</span>
        {icon && <span className={cn("opacity-80", accentColor)}>{icon}</span>}
      </div>
      <div className="mt-2 text-3xl font-display font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </Panel>
  );
}

// Circular health/score gauge.
export function ScoreRing({ score, size = 88, label }: { score: number; size?: number; label?: string }) {
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  const color = score >= 75 ? "var(--success)" : score >= 50 ? "var(--warning)" : "var(--destructive)";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={6} fill="none" stroke="var(--border)" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={6}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * score) / 100}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-xl font-semibold" style={{ color }}>{score}</span>
        {label && <span className="text-[10px] text-muted-foreground font-mono">{label}</span>}
      </div>
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

const statusStyles: Record<string, string> = {
  paid: "bg-success/15 text-success border-success/25",
  approved: "bg-success/15 text-success border-success/25",
  done: "bg-success/15 text-success border-success/25",
  active: "bg-success/15 text-success border-success/25",
  "in-review": "bg-warning/15 text-warning border-warning/25",
  review: "bg-warning/15 text-warning border-warning/25",
  due: "bg-warning/15 text-warning border-warning/25",
  pending: "bg-warning/15 text-warning border-warning/25",
  upcoming: "bg-muted text-muted-foreground border-border",
  todo: "bg-muted text-muted-foreground border-border",
  "in-progress": "bg-chart-2/15 text-chart-2 border-chart-2/25",
  overdue: "bg-destructive/15 text-destructive border-destructive/25",
  suspended: "bg-destructive/15 text-destructive border-destructive/25",
  escalated: "bg-destructive/15 text-destructive border-destructive/25",
  high: "bg-destructive/15 text-destructive border-destructive/25",
  medium: "bg-warning/15 text-warning border-warning/25",
  low: "bg-muted text-muted-foreground border-border",
  open: "bg-chart-2/15 text-chart-2 border-chart-2/25",
  closed: "bg-muted text-muted-foreground border-border",
  security: "bg-destructive/15 text-destructive border-destructive/25",
  warning: "bg-warning/15 text-warning border-warning/25",
  info: "bg-chart-2/15 text-chart-2 border-chart-2/25",
};

export function StatusPill({ status }: { status: string }) {
  const cls = statusStyles[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={cn("capitalize font-mono", cls)}>
      {status.replace(/-/g, " ")}
    </Badge>
  );
}

export function money(n: number) {
  return "$" + n.toLocaleString("en-US");
}
