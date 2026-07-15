import { useState } from "react";
import { useApp, type LedgerEntry } from "../AppContext";
import { PageHeader } from "./Shell";
import { AiTag, Mono, Panel, ScoreRing, StatusPill, money } from "./shared";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { cn } from "./ui/utils";
import { AlertTriangle, Bot, Check, FileClock, FlaskConical, Scale, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

const changes = [
  { id: "tax", label: "Add multi-region tax automation", cost: 12800, weeks: 2, risk: 9, note: "Adds jurisdiction rules, test fixtures, and compliance review." },
  { id: "sprint", label: "Remove the hardening sprint", cost: -6200, weeks: -2, risk: 18, note: "Saves time now, but materially increases launch and security risk." },
  { id: "swap", label: "Replace backend developer", cost: 3400, weeks: 1, risk: 7, note: "Includes handover and reduced velocity during onboarding." },
];

const categoryIcon: Record<LedgerEntry["category"], React.ReactNode> = {
  "ai-proposal": <Bot className="size-4" />, "human-edit": <FileClock className="size-4" />,
  approval: <ShieldCheck className="size-4" />, "scope-change": <FlaskConical className="size-4" />,
  milestone: <Check className="size-4" />,
};

export function TrustLayer() {
  const { projectId, getProject, role, ledger, addLedgerEntry, decideLedgerEntry } = useApp();
  const project = getProject(projectId);
  const [selected, setSelected] = useState(changes[0]);
  const [previewed, setPreviewed] = useState(false);
  if (!project) return <div className="p-6 text-muted-foreground">Select a project first.</div>;
  const entries = ledger.filter((entry) => entry.projectId === projectId);

  const submitChange = () => {
    addLedgerEntry({
      projectId, category: "scope-change", title: selected.label,
      detail: `Predicted impact: ${selected.cost >= 0 ? "+" : "-"}${money(Math.abs(selected.cost))}, ${selected.weeks >= 0 ? "+" : ""}${selected.weeks} weeks, +${selected.risk} risk points. ${selected.note}`,
      status: "pending",
    });
    setPreviewed(false);
    toast.success("Change proposal signed and added to the ledger for approval.");
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Trust Layer" subtitle={`${project.name} · blame-free delivery record with AI second opinion`} />
      <Panel className="mb-4 overflow-hidden border-primary/30">
        <div className="grid gap-px bg-border sm:grid-cols-3">
          {[{ label: "Signed decisions", value: entries.length, sub: "immutable records" }, { label: "Pending consent", value: entries.filter((e) => e.status === "pending").length, sub: "no silent commits" }, { label: "Ledger integrity", value: "Verified", sub: "signatures intact" }].map((item) => (
            <div key={item.label} className="bg-card p-4"><div className="text-xs font-mono uppercase text-muted-foreground">{item.label}</div><div className="mt-1 font-display text-2xl font-semibold">{item.value}</div><div className="text-xs text-success">{item.sub}</div></div>
          ))}
        </div>
      </Panel>

      <Tabs defaultValue="ledger">
        <TabsList className="h-auto max-w-full flex-wrap justify-start">
          <TabsTrigger value="ledger"><ShieldCheck className="size-4" /> Decision Ledger</TabsTrigger>
          <TabsTrigger value="opinion"><Scale className="size-4" /> AI Second Opinion</TabsTrigger>
          <TabsTrigger value="simulator"><FlaskConical className="size-4" /> Change Simulator</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-4">
          <Panel className="p-4 sm:p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><div><h3>Immutable decision timeline</h3><p className="text-xs text-muted-foreground">Who proposed, changed, or approved what. Entries cannot be edited.</p></div><StatusPill status="verified" /></div>
            <div className="space-y-0">
              {entries.map((entry, index) => (
                <div key={entry.id} className="relative flex gap-3 pb-6 last:pb-0 sm:gap-4">
                  {index < entries.length - 1 && <div className="absolute left-4 top-8 h-[calc(100%-1rem)] w-px bg-border" />}
                  <div className={cn("relative z-10 grid size-8 shrink-0 place-items-center rounded-full border bg-card", entry.actorRole === "AI" ? "border-primary/40 text-primary" : "border-success/40 text-success")}>{categoryIcon[entry.category]}</div>
                  <div className="min-w-0 flex-1 rounded-lg border border-border bg-muted/20 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2"><div><div className="font-medium">{entry.title}</div><div className="text-xs text-muted-foreground">{entry.actor} · {entry.actorRole}</div></div><StatusPill status={entry.status} /></div>
                    <p className="mt-2 text-sm text-muted-foreground">{entry.detail}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground font-mono"><span>{new Date(entry.timestamp).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span><span className="text-success">{entry.signature}</span></div>
                    {entry.status === "pending" && ((role === "client" && entry.actorRole !== "Client") || (role === "tm" && entry.actorRole !== "Technical Manager")) && <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row"><Button size="sm" variant="outline" onClick={() => decideLedgerEntry(entry.id, "rejected")}><X className="size-4" /> Reject</Button><Button size="sm" onClick={() => decideLedgerEntry(entry.id, "approved")}><Check className="size-4" /> Approve & sign</Button></div>}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="opinion" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
            <Panel className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2"><h3>Cost & timeline recommendation</h3><AiTag label="AI advisory · not a guarantee" /></div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-lg bg-primary/10 p-4"><div className="text-xs font-mono text-primary">ESTIMATED BUDGET</div><div className="mt-1 font-display text-2xl font-semibold">{money(project.budgetLow)}-{money(project.budgetHigh)}</div><div className="text-xs text-muted-foreground">80% likely range</div></div><div className="rounded-lg bg-primary/10 p-4"><div className="text-xs font-mono text-primary">DELIVERY WINDOW</div><div className="mt-1 font-display text-2xl font-semibold">{project.timelineWeeks}-21 weeks</div><div className="text-xs text-muted-foreground">Sep 11-Oct 2</div></div></div>
              <div className="mt-5 flex items-center gap-4"><ScoreRing score={78} size={78} label="confidence" /><div className="text-sm"><div className="font-medium">Moderate-high confidence</div><p className="mt-1 text-muted-foreground">Based on scope clarity, team availability, and 14 comparable fintech builds.</p></div></div>
            </Panel>
            <Panel className="border-warning/35 bg-warning/5 p-5"><div className="flex items-center gap-2 text-warning"><AlertTriangle className="size-5" /><h3>Devil's advocate</h3></div><p className="mt-3 text-sm leading-relaxed">This estimate may be wrong if Plaid's pending-to-posted edge cases extend beyond the sampled banks. The single backend specialist is also at 25% availability.</p><div className="mt-4 rounded-md border border-warning/25 bg-card p-3 text-sm"><div className="font-medium">Downside scenario</div><div className="mt-1 text-muted-foreground">Up to <Mono className="text-warning">+$17,000</Mono> and <Mono className="text-warning">+3 weeks</Mono></div></div></Panel>
          </div>
          <Panel className="mt-4 p-5"><h3>Comparable delivery history</h3><div className="mt-3 grid gap-3 sm:grid-cols-3">{[{ name: "ClearBooks", budget: "$88k", time: "19 weeks", fit: "91%" }, { name: "CashMint", budget: "$76k", time: "17 weeks", fit: "84%" }, { name: "ReconcileHQ", budget: "$102k", time: "22 weeks", fit: "79%" }].map((item) => <div key={item.name} className="rounded-md border border-border p-3"><div className="flex justify-between"><span className="font-medium">{item.name}</span><Mono className="text-primary">{item.fit}</Mono></div><div className="mt-2 text-xs text-muted-foreground">{item.budget} · {item.time}</div></div>)}</div></Panel>
        </TabsContent>

        <TabsContent value="simulator" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
            <Panel className="p-5"><h3>1. Choose a change</h3><p className="mt-1 text-xs text-muted-foreground">Nothing changes until impact is reviewed and signed.</p><div className="mt-4 space-y-2">{changes.map((change) => <button key={change.id} onClick={() => { setSelected(change); setPreviewed(false); }} className={cn("w-full rounded-md border p-3 text-left text-sm", selected.id === change.id ? "border-primary/50 bg-primary/10" : "border-border hover:border-primary/30")}>{change.label}</button>)}</div><Button className="mt-4 w-full" variant="outline" onClick={() => setPreviewed(true)}><FlaskConical className="size-4" /> Simulate impact</Button></Panel>
            <Panel className={cn("p-5 transition-opacity", !previewed && "opacity-55")}><div className="flex items-center justify-between"><h3>2. Predicted impact</h3>{previewed && <AiTag label="Preview only" />}</div>{previewed ? <><div className="mt-5 grid gap-3 sm:grid-cols-3"><Impact label="Budget" value={`${selected.cost >= 0 ? "+" : "-"}${money(Math.abs(selected.cost))}`} bad={selected.cost > 0} /><Impact label="Timeline" value={`${selected.weeks >= 0 ? "+" : ""}${selected.weeks} weeks`} bad={selected.weeks > 0} /><Impact label="Risk score" value={`+${selected.risk}`} bad /></div><div className="mt-4 rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">{selected.note}</div><div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end"><Button variant="ghost" onClick={() => setPreviewed(false)}>Discard</Button><Button onClick={submitChange}><ShieldCheck className="size-4" /> Sign & submit for approval</Button></div></> : <div className="grid min-h-48 place-items-center text-center text-sm text-muted-foreground">Run the simulation to reveal cost, time, and risk before committing.</div>}</Panel>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Impact({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return <div className="rounded-lg border border-border bg-muted/20 p-4"><div className="text-xs font-mono text-muted-foreground">{label}</div><div className={cn("mt-1 font-display text-2xl font-semibold", bad ? "text-warning" : "text-success")}>{value}</div></div>;
}
