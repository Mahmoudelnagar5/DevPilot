import { useState, useEffect } from "react";
import { useApp } from "../AppContext";
import { projectById, personById, codeReview, CURRENT_USER, type Task } from "../data/mock";
import { PageHeader } from "../components/Shell";
import { Panel, StatCard, Mono, StatusPill, ProgressBar, SectionTitle, money } from "../components/shared";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Clock, Play, Square, GitPullRequest, ShieldAlert, Info, AlertTriangle,
  Github, Linkedin, Link2, CheckCircle2, Plus, Sparkles, Copy, Send, Pencil, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";

export function DeveloperViews() {
  const { page } = useApp();
  switch (page) {
    case "board": return <KanbanBoard />;
    case "time": return <TimeTracking />;
    case "reviews": return <CodeReviews />;
    case "log": return <DailyLog />;
    case "standup": return <StandupCoach />;
    case "profile": return <DevProfile />;
    default: return <KanbanBoard />;
  }
}

const COLUMNS: { key: Task["status"]; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

function KanbanBoard() {
  const p = projectById("p-ledgerloop")!;
  const [tasks, setTasks] = useState<Task[]>(p.tasks);
  const [dragId, setDragId] = useState<string | null>(null);

  const move = (id: string, status: Task["status"]) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));

  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Task Board" subtitle={`${p.name} · Sprint 3 — drag cards to update status`} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragId) { move(dragId, col.key); setDragId(null); } }}
              className="flex flex-col rounded-lg border border-border bg-sidebar/40 p-3"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-sm font-medium">{col.label}</span>
                <Mono className="text-xs text-muted-foreground">{items.length}</Mono>
              </div>
              <div className="space-y-2">
                {items.map((t) => {
                  const dev = personById(t.assignee)!;
                  return (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={() => setDragId(t.id)}
                      className={cn(
                        "cursor-grab rounded-md border border-border bg-card p-3 active:cursor-grabbing hover:border-primary/40",
                        dragId === t.id && "opacity-50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Mono className="text-xs text-primary">{t.key}</Mono>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{t.epic}</span>
                      </div>
                      <p className="mt-2 text-sm leading-snug">{t.title}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <Avatar className="size-6"><AvatarImage src={dev.avatar} /><AvatarFallback>{dev.name.slice(0, 2)}</AvatarFallback></Avatar>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mono>{t.points}pt</Mono>
                          <span className="flex items-center gap-1"><Clock className="size-3" /><Mono>{t.hoursLogged}/{t.estimate}h</Mono></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && <div className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">Drop here</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeTracking() {
  const p = projectById("p-ledgerloop")!;
  const me = CURRENT_USER.developer.id;
  const myTasks = p.tasks.filter((t) => t.assignee === me);
  const [running, setRunning] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const totalLogged = myTasks.reduce((s, t) => s + t.hoursLogged, 0);

  // lightweight ticking timer
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [running]);

  const fmt = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Time Tracking" subtitle="Log time per task — manual entry or timer" />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Logged This Week" value={`${totalLogged}h`} icon={<Clock className="size-4" />} />
        <StatCard label="Billable (est.)" value={money(totalLogged * (CURRENT_USER.developer.rate ?? 65))} accent="success" />
        <StatCard label="Active Timer" value={<Mono>{running ? fmt(seconds) : "00:00:00"}</Mono>} accent={running ? "primary" : undefined} />
      </div>
      <Panel className="divide-y divide-border">
        {myTasks.map((t) => (
          <div key={t.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2"><Mono className="text-xs text-primary">{t.key}</Mono><StatusPill status={t.status} /></div>
              <div className="mt-1 text-sm">{t.title}</div>
              <div className="mt-2 max-w-xs"><ProgressBar value={(t.hoursLogged / t.estimate) * 100} /></div>
            </div>
            <Mono className="text-sm text-muted-foreground sm:text-right">{t.hoursLogged}/{t.estimate}h</Mono>
            <Button
              variant={running === t.id ? "destructive" : "outline"}
              size="sm"
              onClick={() => {
                if (running === t.id) { setRunning(null); toast.success(`Logged time on ${t.key}`); }
                else { setRunning(t.id); setSeconds(0); }
              }}
            >
              {running === t.id ? <><Square className="size-4" /> Stop</> : <><Play className="size-4" /> Start</>}
            </Button>
          </div>
        ))}
      </Panel>
    </div>
  );
}

function CodeReviews() {
  const sevIcon = { security: <ShieldAlert className="size-4 text-destructive" />, warning: <AlertTriangle className="size-4 text-warning" />, info: <Info className="size-4 text-chart-2" /> };
  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="AI Code Reviews" subtitle="Advisory feedback on your pull requests — not blocking by default" />
      <Panel className="mb-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GitPullRequest className="size-5 text-primary" />
            <div>
              <div className="font-medium">{codeReview.pr}</div>
              <div className="text-xs text-muted-foreground font-mono">reviewed by Gemini · 3 comments</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="font-display text-2xl font-semibold text-success">{codeReview.qualityScore}</div>
              <div className="text-[10px] text-muted-foreground font-mono">QUALITY</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl font-semibold text-destructive">{codeReview.securityFlags}</div>
              <div className="text-[10px] text-muted-foreground font-mono">SECURITY</div>
            </div>
          </div>
        </div>
      </Panel>
      <div className="space-y-3">
        {codeReview.comments.map((c, i) => (
          <Panel key={i} className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              {sevIcon[c.severity]}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <span className="text-foreground">{c.file}</span> : {c.line}
                  <StatusPill status={c.severity} />
                </div>
                <p className="mt-1.5 text-sm">{c.text}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => toast.success("Marked as resolved")}>Resolve</Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function DailyLog() {
  const [entries, setEntries] = useState([
    { day: "Today", text: "Wired Plaid webhook handler; still chasing the pending→posted race condition flagged by AI review." },
    { day: "Yesterday", text: "Finished reconciliation match UI happy path; paired with Sara on the empty state." },
  ]);
  const [draft, setDraft] = useState("");
  return (
    <div className="max-w-3xl p-4 sm:p-6">
      <PageHeader title="Daily Log" subtitle="Short structured update — AI can summarize your week for standup" />
      <Panel className="mb-4 p-4">
        <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} placeholder="What did you work on today? Any blockers?" />
        <div className="mt-3 flex flex-col justify-end gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => draft && toast.success("AI summary drafted from your update")}>Summarize with AI</Button>
          <Button onClick={() => { if (draft) { setEntries((e) => [{ day: "Today", text: draft }, ...e]); setDraft(""); toast.success("Log posted"); } }}>
            <Plus className="size-4" /> Post update
          </Button>
        </div>
      </Panel>
      <div className="space-y-3">
        {entries.map((e, i) => (
          <Panel key={i} className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono"><CheckCircle2 className="size-3.5 text-success" /> {e.day}</div>
            <p className="mt-1.5 text-sm">{e.text}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function StandupCoach() {
  const p = projectById("p-ledgerloop")!;
  const me = CURRENT_USER.developer.id;
  const completed = p.tasks.filter((task) => task.assignee === me && (task.status === "done" || task.hoursLogged > 0));
  const [editing, setEditing] = useState(false);
  const [points, setPoints] = useState([
    "Yesterday: I implemented the Plaid pending-to-posted transition path and added idempotency coverage.",
    "Today: I am closing the race condition from AI review, then starting the multi-currency FX service.",
    "Blocker: I need confirmation on whether pending transactions should affect available cash in reports.",
  ]);

  const copy = () => {
    navigator.clipboard?.writeText(points.join("\n"));
    toast.success("Standup points copied.");
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="AI Standup Coach"
        subtitle="Tomorrow's standup · prepared from your tasks, time, PRs, and daily log"
        action={<div className="flex gap-2"><Button variant="outline" onClick={() => toast.success("Standup regenerated from the latest activity.")}><RefreshCw className="size-4" /> Refresh</Button><Button onClick={copy}><Copy className="size-4" /> Copy update</Button></div>}
      />
      <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <div className="space-y-4">
          <Panel className="p-5">
            <div className="flex items-center justify-between gap-2"><h3>Activity summary</h3><span className="flex items-center gap-1 text-xs text-primary"><Sparkles className="size-3.5" /> AI prepared</span></div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">You logged <Mono className="text-foreground">11 hours</Mono> across {completed.length} active or completed items. Your main progress was on Plaid reconciliation, with one security issue and one concurrency issue surfaced during review.</p>
            <div className="mt-4 space-y-2">{completed.map((task) => <div key={task.id} className="rounded-md border border-border bg-muted/20 p-3"><div className="flex items-center justify-between gap-2"><Mono className="text-xs text-primary">{task.key}</Mono><StatusPill status={task.status} /></div><div className="mt-1 text-sm">{task.title}</div><div className="mt-1 text-xs text-muted-foreground">{task.hoursLogged}h logged · {task.points} points</div></div>)}</div>
          </Panel>
          <Panel className="border-warning/30 bg-warning/5 p-5"><div className="flex items-center gap-2 text-warning"><AlertTriangle className="size-4" /><h3>Coach note</h3></div><p className="mt-2 text-sm text-muted-foreground">Lead with the user impact, not implementation detail. Ask Lina for a decision on pending cash treatment so the blocker has a clear owner.</p></Panel>
        </div>
        <Panel className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h3>Your 3 talking points</h3><p className="text-xs text-muted-foreground">AI drafted. Edit before sharing; nothing is posted automatically.</p></div><Button size="sm" variant="ghost" onClick={() => setEditing((value) => !value)}><Pencil className="size-4" /> {editing ? "Done editing" : "Edit"}</Button></div>
          <div className="mt-5 space-y-3">{points.map((point, index) => <div key={index} className="flex gap-3 rounded-lg border border-border bg-muted/20 p-4"><div className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/15 font-mono text-xs text-primary">{index + 1}</div>{editing ? <Textarea className="min-h-20" value={point} onChange={(event) => setPoints((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /> : <p className="text-sm leading-relaxed">{point}</p>}</div>)}</div>
          <div className="mt-5 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"><div className="text-xs text-muted-foreground"><CheckCircle2 className="mr-1 inline size-3.5 text-success" /> Private draft · only you can share it</div><Button onClick={() => toast.success("Standup update shared with the project channel.")}><Send className="size-4" /> Approve & share</Button></div>
        </Panel>
      </div>
    </div>
  );
}

function DevProfile() {
  const me = CURRENT_USER.developer;
  return (
    <div className="max-w-3xl p-4 sm:p-6">
      <PageHeader title="My Profile" subtitle="Your public profile drives AI developer matching" />
      <Panel className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-16"><AvatarImage src={me.avatar} /><AvatarFallback>{me.name.slice(0, 2)}</AvatarFallback></Avatar>
          <div>
            <div className="font-display text-xl font-semibold">{me.name}</div>
            <div className="text-sm text-muted-foreground">{me.title}</div>
            <div className="mt-1 text-sm"><Mono className="text-primary">{money(me.rate ?? 0)}/hr</Mono> · <span className="text-muted-foreground">{me.availability}% available</span></div>
          </div>
        </div>
        <SectionTitle>Skills</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {me.skills?.map((s) => <span key={s} className="rounded-md border border-border bg-muted px-3 py-1 text-sm font-mono">{s}</span>)}
        </div>
        <SectionTitle>Links</SectionTitle>
        <div className="space-y-2">
          {[{ icon: <Github className="size-4" />, label: "github.com/youssef-a" }, { icon: <Linkedin className="size-4" />, label: "linkedin.com/in/youssef" }, { icon: <Link2 className="size-4" />, label: "youssef.dev" }].map((l) => (
            <a key={l.label} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">{l.icon}{l.label}</a>
          ))}
        </div>
      </Panel>
    </div>
  );
}
