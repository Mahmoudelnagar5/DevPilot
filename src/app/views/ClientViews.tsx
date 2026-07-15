import { useState } from "react";
import { useApp } from "../AppContext";
import {
  personById, messages, CURRENT_USER, type Project,
} from "../data/mock";
import { PageHeader } from "../components/Shell";
import {
  Panel, StatCard, ScoreRing, ProgressBar, StatusPill, Mono, money, AiTag, SectionTitle,
} from "../components/shared";
import { ProjectPlan } from "../components/ProjectPlan";
import { TrustLayer } from "../components/TrustLayer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Activity, TrendingUp, Wallet, Send, Check, X, Plus, ArrowRight,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

export function ClientViews() {
  const { page } = useApp();
  switch (page) {
    case "dashboard": return <ClientDashboard />;
    case "project": return <ClientProject />;
    case "milestones": return <ClientMilestones />;
    case "invoices": return <ClientInvoices />;
    case "messages": return <MessagesView />;
    case "team": return <TeamView />;
    case "trust": return <TrustLayer />;
    default: return <ClientDashboard />;
  }
}

function ClientDashboard() {
  const { openProject, projects } = useApp();
  const avgHealth = projects.length ? Math.round(projects.reduce((s, p) => s + p.health, 0) / projects.length) : 0;
  const committed = projects.reduce((s, p) => s + p.budgetHigh, 0);
  const spent = projects.reduce((s, p) => s + p.spent, 0);
  const inExecution = projects.filter((p) => p.status === "in-progress").length;
  const awaiting = projects.filter((p) => p.status === "tm-review" || p.status === "client-approval").length;
  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Welcome back, Nadia"
        subtitle="Your portfolio at a glance — AI-monitored, human-approved."
        action={<NewProjectDialog />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Projects" value={projects.length} sub={`${inExecution} in execution · ${awaiting} awaiting approval`} icon={<Activity className="size-4" />} />
        <StatCard label="Avg Health" value={avgHealth} accent="success" sub="Composite AI score" icon={<TrendingUp className="size-4" />} />
        <StatCard label="Committed Budget" value={money(committed)} sub={`${money(spent)} spent`} icon={<Wallet className="size-4" />} />
        <StatCard label="Next Milestone" value="Aug 1" accent="warning" sub="Bank Reconciliation" />
      </div>

      <SectionTitle hint="click a card to open">Projects</SectionTitle>
      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((proj) => (
          <ProjectCard key={proj.id} project={proj} onOpen={() => openProject(proj.id)} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project: p, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="group text-left">
      <Panel className="overflow-hidden transition-colors group-hover:border-primary/40">
        <div className="relative h-32 bg-muted">
          <ImageWithFallback src={p.cover} alt={p.name} className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <div className="font-display text-lg font-semibold">{p.name}</div>
              <div className="text-xs text-muted-foreground font-mono">{p.domain}</div>
            </div>
            <StatusPill status={p.status} />
          </div>
        </div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <ScoreRing score={p.health} label="health" />
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span><Mono>{p.progress}%</Mono>
              </div>
              <ProgressBar value={p.progress} className="mt-1" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget</span>
              <Mono>{money(p.budgetLow)}–{money(p.budgetHigh)}</Mono>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Risk</span>
              <span className="flex items-center gap-2">
                <Mono className={p.riskScore > 50 ? "text-destructive" : p.riskScore > 30 ? "text-warning" : "text-success"}>{p.riskScore}/100</Mono>
              </span>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </Panel>
    </button>
  );
}

function NewProjectDialog() {
  const { addProject, openProject } = useApp();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [idea, setIdea] = useState("");

  const reset = () => { setStep(0); setName(""); setIdea(""); };

  const submit = () => {
    const project = addProject({ name: name.trim(), description: idea.trim() });
    setOpen(false);
    reset();
    toast.success("Draft plan generated — sent to Technical Manager for review.");
    openProject(project.id);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button><Plus className="size-4" /> New Project</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a project</DialogTitle>
          <DialogDescription>
            Describe your idea and DevPilot's AI will draft requirements, an architecture, a plan, and a cost estimate.
          </DialogDescription>
        </DialogHeader>
        {step === 0 ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm">Project name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. LedgerLoop" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm">Describe your idea</label>
              <Textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={5}
                placeholder="In plain language, what do you want to build? DevPilot's AI will turn this into requirements, an architecture, a plan, and a cost estimate."
              />
            </div>
            <p className="text-xs text-muted-foreground">You can optionally attach a PDF spec or Figma link after creation.</p>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-primary">
              <AiTag label="Gemini is analyzing your idea" />
            </div>
            {["Detecting domain & complexity", "Drafting requirements", "Proposing architecture", "Estimating cost & timeline", "Building sprint plan"].map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm">
                <Check className="size-4 text-success" /> {s}
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          {step === 0 ? (
            <Button onClick={() => setStep(1)} disabled={!name.trim() || !idea.trim()}>Generate plan with AI</Button>
          ) : (
            <Button onClick={submit}>Send to Technical Manager</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ClientProject() {
  const { projectId, getProject, updateProjectStatus } = useApp();
  const p = getProject(projectId);
  const awaitingClient = p?.status === "client-approval";
  const inReviewByTM = p?.status === "tm-review";
  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Project Plan"
        subtitle="AI-generated plan — review before approving. Every figure is an estimate."
        action={
          p && (
            awaitingClient ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" onClick={() => { updateProjectStatus(p.id, "tm-review"); toast("Sent back to your Technical Manager with comments."); }}>
                  <X className="size-4" /> Request changes
                </Button>
                <Button onClick={() => { updateProjectStatus(p.id, "in-progress"); toast.success("Plan approved — the team is starting execution! 🎉"); }}>
                  <Check className="size-4" /> Approve & start project
                </Button>
              </div>
            ) : inReviewByTM ? (
              <span className="rounded-md border border-warning/25 bg-warning/10 px-3 py-1.5 text-sm text-warning">
                Awaiting Technical Manager review
              </span>
            ) : null
          )
        }
      />
      <ProjectPlan projectId={projectId} />
    </div>
  );
}

function ClientMilestones() {
  const { projectId, getProject, addLedgerEntry } = useApp();
  const p = getProject(projectId);
  const [decided, setDecided] = useState<Record<string, "approved" | "rejected">>({});
  if (!p) return <div className="p-6 text-muted-foreground">Select a project first.</div>;
  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Milestones & Approvals" subtitle={`${p.name} — approve deliverables to release payment.`} />
      <div className="space-y-4">
        {p.milestones.map((m) => {
          const decision = decided[m.id];
          const canAct = m.status === "in-review";
          return (
            <Panel key={m.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3>{m.name}</h3>
                    <StatusPill status={decision ?? m.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Due {new Date(m.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <Mono>{money(m.amount)}</Mono>
                  </div>
                  <div className="mt-3 max-w-md">
                    <ProgressBar value={m.progress} />
                    <div className="mt-1 text-xs text-muted-foreground font-mono">{m.progress}% complete</div>
                  </div>
                </div>
                {canAct && !decision && (
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button variant="outline" onClick={() => { setDecided((d) => ({ ...d, [m.id]: "rejected" })); addLedgerEntry({ projectId, category: "milestone", title: `${m.name} changes requested`, detail: "Client declined the current deliverable and returned it for revision.", status: "rejected" }); toast("Milestone sent back with comments."); }}>
                      <X className="size-4" /> Request changes
                    </Button>
                    <Button onClick={() => { setDecided((d) => ({ ...d, [m.id]: "approved" })); addLedgerEntry({ projectId, category: "milestone", title: `${m.name} approved`, detail: `${money(m.amount)} payment release authorized after deliverable review.`, status: "approved" }); toast.success(`Approved — ${money(m.amount)} released.`); }}>
                      <Check className="size-4" /> Approve & pay
                    </Button>
                  </div>
                )}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

function ClientInvoices() {
  const { projectId, getProject } = useApp();
  const p = getProject(projectId);
  if (!p) return <div className="p-6 text-muted-foreground">Select a project first.</div>;
  const total = p.invoices.reduce((s, i) => s + i.amount, 0);
  const paid = p.invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Invoices & Payments" subtitle={p.name} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Invoiced" value={money(total)} icon={<Wallet className="size-4" />} />
        <StatCard label="Paid" value={money(paid)} accent="success" />
        <StatCard label="Outstanding" value={money(total - paid)} accent="warning" />
      </div>
      <Panel className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Milestone</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {p.invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell><Mono>{inv.number}</Mono></TableCell>
                <TableCell>{inv.milestone}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(inv.issued).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</TableCell>
                <TableCell><Mono>{money(inv.amount)}</Mono></TableCell>
                <TableCell><StatusPill status={inv.status} /></TableCell>
                <TableCell className="text-right">
                  {inv.status === "due" ? (
                    <Button size="sm" onClick={() => toast.success(`Payment of ${money(inv.amount)} initiated.`)}>Pay now</Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}

export function MessagesView() {
  const [list, setList] = useState(messages);
  const [text, setText] = useState("");
  const me = "u-nadia";
  const send = () => {
    if (!text.trim()) return;
    setList((l) => [...l, { id: "m" + Date.now(), from: me, text, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }]);
    setText("");
  };
  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Messages" subtitle="LedgerLoop — project channel" />
      <Panel className="flex h-[calc(100dvh-14.5rem)] min-h-[26rem] flex-col sm:h-[calc(100dvh-13rem)]">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {list.map((m) => {
            const person = personById(m.from)!;
            const mine = m.from === me;
            return (
              <div key={m.id} className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
                <Avatar className="size-8"><AvatarImage src={person.avatar} /><AvatarFallback>{person.name.slice(0, 2)}</AvatarFallback></Avatar>
                <div className={`max-w-[82%] sm:max-w-[70%] ${mine ? "text-right" : ""}`}>
                  <div className="mb-1 text-xs text-muted-foreground"><span className="text-foreground">{person.name.split(" ")[0]}</span> · {m.time}</div>
                  <div className={`rounded-lg px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{m.text}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 border-t border-border p-3">
          <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message the team…" />
          <Button onClick={send}><Send className="size-4" /></Button>
        </div>
      </Panel>
    </div>
  );
}

export function TeamView() {
  const { projectId, getProject } = useApp();
  const p = getProject(projectId);
  if (!p) return <div className="p-6 text-muted-foreground">Select a project first.</div>;
  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Project Team" subtitle={`${p.name} — assigned by your Technical Manager`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {p.team.map((id) => {
          const m = personById(id)!;
          return (
            <Panel key={id} className="p-5">
              <div className="flex items-center gap-3">
                <Avatar className="size-12"><AvatarImage src={m.avatar} /><AvatarFallback>{m.name.slice(0, 2)}</AvatarFallback></Avatar>
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.title}</div>
                </div>
              </div>
              {m.skills && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.skills.map((s) => (
                    <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">{s}</span>
                  ))}
                </div>
              )}
              {m.availability != null && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground"><span>Availability</span><Mono>{m.availability}%</Mono></div>
                  <ProgressBar value={m.availability} className="mt-1" />
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
