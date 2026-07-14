import { useState } from "react";
import { useApp } from "../AppContext";
import { projectById, personById, people, codeReview } from "../data/mock";
import { PageHeader } from "../components/Shell";
import { Panel, StatCard, ScoreRing, ProgressBar, StatusPill, Mono, money, AiTag, SectionTitle } from "../components/shared";
import { ProjectPlan } from "../components/ProjectPlan";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  FolderKanban, AlertTriangle, Clock, Check, X, FileDown, GitPullRequest, ShieldAlert, Sparkles, Star,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";

export function TMViews() {
  const { page } = useApp();
  switch (page) {
    case "overview": return <TMOverview />;
    case "review": return <PlanReview />;
    case "project": return <PlanReview />;
    case "assign": return <Assignments />;
    case "prs": return <PRReviews />;
    case "reports": return <Reports />;
    default: return <TMOverview />;
  }
}

function TMOverview() {
  const { openProject, projects } = useApp();
  const atRisk = projects.filter((p) => p.riskScore > 45).length;
  const pendingApprovals = projects.filter((p) => p.status === "tm-review").length;
  return (
    <div className="p-6">
      <PageHeader title="Delivery Overview" subtitle="Lina Haddad — projects awaiting your review appear here" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Owned Projects" value={projects.length} icon={<FolderKanban className="size-4" />} />
        <StatCard label="At Risk" value={atRisk} accent="destructive" sub="risk score > 45" icon={<AlertTriangle className="size-4" />} />
        <StatCard label="Pending Approvals" value={pendingApprovals} accent="warning" sub="awaiting TM review" icon={<Clock className="size-4" />} />
        <StatCard label="Avg Health" value="77" accent="success" />
      </div>

      <SectionTitle hint="AI-flagged items need your judgment">Projects</SectionTitle>
      <Panel className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Predicted End</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id} className="cursor-pointer" onClick={() => openProject(p.id)}>
                <TableCell>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{personById(p.client)?.name}</div>
                </TableCell>
                <TableCell><StatusPill status={p.status} /></TableCell>
                <TableCell><Mono className={p.health >= 75 ? "text-success" : "text-warning"}>{p.health}</Mono></TableCell>
                <TableCell className="w-40"><ProgressBar value={p.progress} /><span className="text-xs text-muted-foreground font-mono">{p.progress}%</span></TableCell>
                <TableCell><Mono className={p.riskScore > 45 ? "text-destructive" : p.riskScore > 30 ? "text-warning" : "text-success"}>{p.riskScore}</Mono></TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(p.predictedEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</TableCell>
                <TableCell><Button variant="ghost" size="sm">Open</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}

function PlanReview() {
  const { projectId, getProject, updateProjectStatus, projects, openProject } = useApp();
  const p = getProject(projectId);

  // If the currently-open project isn't awaiting review, surface the queue.
  const queue = projects.filter((x) => x.status === "tm-review");

  if (!p) {
    return (
      <div className="p-6">
        <PageHeader title="AI Plan Review" subtitle="No project selected." />
      </div>
    );
  }

  const isPending = p.status === "tm-review";
  const alreadyReleased = p.status === "client-approval" || p.status === "in-progress" || p.status === "delivered";

  return (
    <div className="p-6">
      <PageHeader
        title="AI Plan Review"
        subtitle="Review and edit the AI's draft before the client sees it. You have final say."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast("Sent back to AI with your notes")}>Regenerate section</Button>
            <Button
              disabled={!isPending}
              onClick={() => { updateProjectStatus(p.id, "client-approval"); toast.success(`${p.name} approved — released to client for approval`); }}
            >
              <Check className="size-4" /> {alreadyReleased ? "Released to client" : "Approve & release to client"}
            </Button>
          </div>
        }
      />

      {queue.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-warning/25 bg-warning/10 p-3 text-sm">
          <span className="text-warning font-medium">{queue.length} awaiting review:</span>
          {queue.map((q) => (
            <button
              key={q.id}
              onClick={() => openProject(q.id)}
              className={cn("rounded-md border px-2 py-1 text-xs", q.id === p.id ? "border-primary/50 text-primary" : "border-border text-muted-foreground hover:text-foreground")}
            >
              {q.name}
            </button>
          ))}
        </div>
      )}

      <ProjectPlan projectId={projectId} editable />
    </div>
  );
}

function Assignments() {
  // Rank developers for the currently-open backlog task by simple skill match.
  const task = projectById("p-ledgerloop")!.tasks.find((t) => t.status === "todo")!;
  const required = ["Python", "Gemini API"];
  const [assigned, setAssigned] = useState<string | null>(null);
  const devs = people.filter((p) => p.role === "developer");
  const ranked = devs
    .map((d) => {
      const matches = (d.skills ?? []).filter((s) => required.includes(s)).length;
      const score = matches * 40 + (d.availability ?? 0) * 0.4;
      return { d, matches, score };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="p-6">
      <PageHeader title="Developer Assignment" subtitle="AI ranks candidates by skill match & availability — you confirm or override" />
      <Panel className="mb-4 p-4">
        <div className="flex items-center gap-2 text-sm">
          <Mono className="text-primary">{task.key}</Mono>
          <span>{task.title}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          Required skills:
          {required.map((r) => <span key={r} className="rounded bg-muted px-2 py-0.5 font-mono">{r}</span>)}
          <AiTag label="AI ranked" />
        </div>
      </Panel>
      <div className="space-y-3">
        {ranked.map(({ d, matches, score }, i) => (
          <Panel key={d.id} className={cn("p-4", i === 0 && "border-primary/40")}>
            <div className="flex items-center gap-4">
              <div className="w-8 text-center">
                {i === 0 ? <Star className="mx-auto size-5 text-primary" /> : <Mono className="text-muted-foreground">#{i + 1}</Mono>}
              </div>
              <Avatar className="size-10"><AvatarImage src={d.avatar} /><AvatarFallback>{d.name.slice(0, 2)}</AvatarFallback></Avatar>
              <div className="flex-1">
                <div className="font-medium">{d.name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {d.skills?.map((s) => (
                    <span key={s} className={cn("rounded px-1.5 py-0.5 text-[11px] font-mono", required.includes(s) ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div><Mono>{matches}</Mono> skill match</div>
                <div><Mono>{d.availability}%</Mono> free</div>
              </div>
              <div className="w-28 text-right">
                <div className="text-xs text-muted-foreground">match</div>
                <div className="font-display text-lg font-semibold text-primary">{Math.round(score)}</div>
              </div>
              <Button
                variant={assigned === d.id ? "default" : "outline"}
                size="sm"
                onClick={() => { setAssigned(d.id); toast.success(`${d.name} assigned to ${task.key}`); }}
              >
                {assigned === d.id ? <><Check className="size-4" /> Assigned</> : "Assign"}
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function PRReviews() {
  const [decision, setDecision] = useState<"accepted" | "overridden" | null>(null);
  return (
    <div className="p-6">
      <PageHeader title="PR Review" subtitle="Your review sits alongside the AI's — accept or override with reasoning" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <div className="flex items-center gap-2 mb-3"><GitPullRequest className="size-5 text-primary" /><h3>{codeReview.pr}</h3></div>
          <p className="text-sm text-muted-foreground">Author: Youssef Amrani · +214 −38 · 6 files</p>
          <SectionTitle hint="advisory">AI Review</SectionTitle>
          <div className="mb-3 flex gap-6">
            <div><span className="text-muted-foreground text-xs font-mono">QUALITY </span><Mono className="text-success">{codeReview.qualityScore}</Mono></div>
            <div><span className="text-muted-foreground text-xs font-mono">SECURITY </span><Mono className="text-destructive">{codeReview.securityFlags} flag</Mono></div>
          </div>
          <div className="space-y-2">
            {codeReview.comments.map((c, i) => (
              <div key={i} className="flex items-start gap-2 rounded-md border border-border p-2.5 text-sm">
                <ShieldAlert className={cn("size-4 mt-0.5", c.severity === "security" ? "text-destructive" : c.severity === "warning" ? "text-warning" : "text-chart-2")} />
                <div>
                  <Mono className="text-xs text-muted-foreground">{c.file}:{c.line}</Mono>
                  <p>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <h3 className="mb-3">Your Decision</h3>
          <div className="rounded-md border border-warning/25 bg-warning/10 p-3 text-sm mb-4">
            <Sparkles className="mb-1 size-4 text-warning" />
            AI recommends <strong>request changes</strong> — 1 unresolved security flag (access_token logged).
          </div>
          <Textarea rows={4} placeholder="Reasoning (logged for auditability — every override is recorded)…" className="mb-3" />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setDecision("overridden"); toast("Override recorded — merged with reasoning"); }}>
              Override & approve
            </Button>
            <Button onClick={() => { setDecision("accepted"); toast.success("Accepted AI recommendation — changes requested"); }}>
              <Check className="size-4" /> Accept & request changes
            </Button>
          </div>
          {decision && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="size-4 text-success" /> Decision logged: <Mono>{decision}</Mono>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Reports() {
  const p = projectById("p-ledgerloop")!;
  return (
    <div className="p-6">
      <PageHeader
        title="Status Reports"
        subtitle="AI-drafted, exportable reports for clients & stakeholders"
        action={<Button onClick={() => toast.success("Report exported to PDF")}><FileDown className="size-4" /> Export PDF</Button>}
      />
      <Panel className="p-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display">{p.name} — Weekly Status</h2>
          <AiTag label="AI drafted" />
        </div>
        <p className="mt-1 text-xs text-muted-foreground font-mono">Week of Jul 6 – Jul 12, 2026</p>
        <div className="mt-4 flex items-center gap-6">
          <ScoreRing score={p.health} label="health" />
          <div className="space-y-1 text-sm">
            <div>Progress: <Mono>{p.progress}%</Mono> ({p.milestones.filter((m) => m.status === "approved" || m.status === "paid").length}/{p.milestones.length} milestones)</div>
            <div>Risk: <Mono className="text-warning">{p.riskScore}/100</Mono> — Plaid scope, backend capacity</div>
            <div>Predicted delivery: <Mono>{new Date(p.predictedEnd).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</Mono></div>
          </div>
        </div>
        <SectionTitle>Summary</SectionTitle>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The team completed the ledger engine milestone and is 78% through bank reconciliation, tracking to the Aug 1 date.
          The main watch item remains Plaid's pending→posted transition handling, which surfaced a race condition now being resolved.
          Health is strong at {p.health}; no client action is required this week beyond the pending reconciliation approval.
        </p>
      </Panel>
    </div>
  );
}
