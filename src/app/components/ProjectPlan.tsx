import { useState } from "react";
import {
  personById, lifecycleStages, type Project,
} from "../data/mock";
import { useApp } from "../AppContext";
import { useLanguage } from "../LanguageContext";
import { Panel, AiTag, Mono, StatusPill, money, ProgressBar } from "./shared";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { cn } from "./ui/utils";
import {
  FileText, ListTree, Network, Database, CalendarRange, ShieldAlert,
  DollarSign, Check, Pencil, Loader2, AlertTriangle, Users, Workflow,
  ExternalLink, Sparkles, UserCheck, HeartHandshake, ShieldCheck,
} from "lucide-react";
import { BookTQAMeetingDialog } from "./BookTQAMeetingDialog";



function Stepper({ status }: { status: Project["status"] }) {
  const idx = lifecycleStages.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {lifecycleStages.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1 text-xs whitespace-nowrap",
              i < idx && "border-success/30 bg-success/10 text-success",
              i === idx && "border-primary/40 bg-primary/10 text-primary",
              i > idx && "border-border text-muted-foreground"
            )}
          >
            {i < idx ? <Check className="size-3" /> : <span className="font-mono">{i + 1}</span>}
            {s.label}
          </div>
          {i < lifecycleStages.length - 1 && <div className="h-px w-4 bg-border" />}
        </div>
      ))}
    </div>
  );
}

/** Skeleton shimmer for loading state */
function SkeletonLine({ className }: { className?: string }) {
  return (
    <div className={cn("h-4 rounded bg-muted animate-pulse", className)} />
  );
}

function PlanLoadingState({ t }: { t: (key: string, defaultVal?: string) => string }) {
  return (
    <div className="space-y-4 mt-4">
      <Panel className="p-5">
        <div className="flex items-center gap-3 mb-4 text-primary">
          <Loader2 className="size-5 animate-spin" />
          <div>
            <div className="text-sm font-medium">{t("plan.aiAnalyzing")}</div>
            <div className="text-xs text-muted-foreground">{t("plan.generatingReqs")}</div>
          </div>
        </div>
        <div className="space-y-3">
          {[
            "Detecting domain & complexity",
            "Drafting functional requirements",
            "Proposing architecture stack",
            "Estimating cost & timeline",
            "Building sprint plan",
            "Running risk analysis",
          ].map((s, i) => (
            <div key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className={cn("size-4 text-primary", i === 0 ? "animate-spin" : "opacity-30")} />
              {s}
            </div>
          ))}
        </div>
      </Panel>
      {[1, 2].map((n) => (
        <Panel key={n} className="p-5 space-y-3">
          <SkeletonLine className="w-1/3" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-5/6" />
          <SkeletonLine className="w-4/5" />
        </Panel>
      ))}
    </div>
  );
}

function PlanErrorState({ t }: { t: (key: string, defaultVal?: string) => string }) {
  return (
    <div className="mt-4">
      <Panel className="p-5">
        <div className="flex items-center gap-3 text-destructive">
          <AlertTriangle className="size-5" />
          <div>
            <div className="text-sm font-medium">{t("plan.genError")}</div>
            <div className="text-xs text-muted-foreground">{t("plan.genErrorSub")}</div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

// editable — when true (TM view) shows edit/approve affordances.
export function ProjectPlan({ projectId, editable = false }: { projectId: string; editable?: boolean }) {
  const { getProject, projects } = useApp();
  const { t } = useLanguage();
  const p = getProject(projectId) || projects[0];
  const [tab, setTab] = useState("reqs");
  if (!p) return <div className="p-6 text-muted-foreground">{t("common.selectProjectFirst")}</div>;

  const tabMeta = [
    { key: "reqs", label: t("tab.requirements"), icon: <FileText className="size-4" /> },
    { key: "stories", label: t("tab.userStories"), icon: <ListTree className="size-4" /> },
    { key: "visualFlow", label: t("tab.visualFlow"), icon: <Workflow className="size-4" /> },
    { key: "squad", label: t("tab.squad"), icon: <Users className="size-4" /> },
    { key: "arch", label: t("tab.architecture"), icon: <Network className="size-4" /> },
    { key: "erd", label: t("tab.erd"), icon: <Database className="size-4" /> },
    { key: "sprints", label: t("tab.sprints"), icon: <CalendarRange className="size-4" /> },
    { key: "risk", label: t("tab.risk"), icon: <ShieldAlert className="size-4" /> },
    { key: "cost", label: t("tab.cost"), icon: <DollarSign className="size-4" /> },
  ];

  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display">{p.name}</h2>
              <StatusPill status={p.status} />
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{p.description}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
              <span>{p.domain}</span>
              <span>{t("plan.complexity")}: {p.complexity}</span>
            </div>
          </div>
          <AiTag label={t("plan.generatedBy")} />
        </div>
        <div className="mt-4">
          <Stepper status={p.status} />
        </div>
      </Panel>

      {/* TQA Meeting Recommendation Banner */}
      {(!p.aiPlanStatus || p.aiPlanStatus === "ready") && (
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-card/60 p-4 sm:p-5 shadow-lg backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-semibold text-foreground text-sm sm:text-base">
                    {t("tqa.recommendationTitle")}
                  </h4>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                    QA Review Option
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-2xl">
                  {t("tqa.recommendationDesc")}
                </p>
              </div>
            </div>
            <div className="self-start sm:self-center shrink-0">
              <BookTQAMeetingDialog projectName={p.name} />
            </div>
          </div>
        </div>
      )}

      {/* Show loading or error state for new projects */}
      {p.aiPlanStatus === "generating" && <PlanLoadingState t={t} />}
      {p.aiPlanStatus === "error" && <PlanErrorState t={t} />}

      {/* Show full plan tabs only when ready */}
      {(!p.aiPlanStatus || p.aiPlanStatus === "ready") && p.aiPlan && (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto max-w-full flex-wrap justify-start overflow-x-auto">
            {tabMeta.map((tabItem) => (
              <TabsTrigger key={tabItem.key} value={tabItem.key} className="gap-1.5">
                {tabItem.icon} {tabItem.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="reqs" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <PlanCard title={t("plan.functionalReqs")} editable={editable}>
                <ul className="space-y-2">
                  {p.aiPlan.requirements.functional.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <Mono className="text-primary">FR{i + 1}</Mono>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </PlanCard>
              <PlanCard title={t("plan.nonFunctionalReqs")} editable={editable}>
                <ul className="space-y-2">
                  {p.aiPlan.requirements.nonFunctional.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <Mono className="text-chart-2">NFR{i + 1}</Mono>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </PlanCard>
            </div>
          </TabsContent>

          <TabsContent value="stories" className="mt-4">
            <div className="grid gap-4 md:grid-cols-3">
              {p.aiPlan.userStories.map((e) => (
                <PlanCard key={e.epic} title={e.epic} editable={editable}>
                  <ul className="space-y-3">
                    {e.stories.map((s, i) => (
                      <li key={i} className="rounded-md bg-muted/40 p-3 text-sm leading-relaxed">{s}</li>
                    ))}
                  </ul>
                </PlanCard>
              ))}
            </div>
          </TabsContent>

          {/* Visual Architecture Flowchart */}
          <TabsContent value="visualFlow" className="mt-4">
            <PlanCard title={t("visualFlow.title")} editable={editable}>
              <p className="mb-4 text-sm text-muted-foreground">{t("visualFlow.subtitle")}</p>
              {p.aiPlan.visualFlow ? (
                <div className="rounded-xl border border-border bg-[#0a0e14] p-5">
                  <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="flex items-center gap-2 font-mono text-xs text-primary">
                      <Workflow className="size-4" /> System Flow Diagram
                    </span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-mono text-primary">Mermaid TD</span>
                  </div>
                  <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-emerald-400">
{p.aiPlan.visualFlow}
                  </pre>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Visual flow diagram generated automatically upon plan creation.
                </div>
              )}
            </PlanCard>
          </TabsContent>

          {/* Squad Recommendation */}
          <TabsContent value="squad" className="mt-4">
            <div className="space-y-4">
              <PlanCard title={t("squad.title")} editable={editable}>
                <p className="mb-4 text-sm text-muted-foreground">{t("squad.subtitle")}</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(p.aiPlan.squad || [
                    { role: "Frontend Developer", count: 1, skills: ["React", "TypeScript"], seniorityLevel: "Senior", weeklyHours: 40, rationale: "Build responsive dashboard and user flows." },
                    { role: "Backend Developer", count: 1, skills: ["Node.js", "PostgreSQL"], seniorityLevel: "Mid", weeklyHours: 40, rationale: "API endpoints, database schema, and integrations." },
                  ]).map((member, i) => (
                    <div key={i} className="flex flex-col justify-between rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/40">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-semibold text-foreground text-sm">{member.role}</span>
                          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                            {member.count}x
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{member.seniorityLevel}</span>
                          <span>·</span>
                          <span>{member.weeklyHours}h / week</span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{member.rationale}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-1 border-t border-border/60 pt-3">
                        {member.skills.map((skill) => (
                          <span key={skill} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </PlanCard>

              {/* Freelance Freedom Note */}
              <div className="flex gap-3.5 rounded-xl border border-primary/30 bg-primary/[0.06] p-4 text-sm">
                <HeartHandshake className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h4 className="font-semibold text-foreground">{t("squad.freelanceNoteTitle")}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("squad.freelanceNoteDesc")}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="arch" className="mt-4">
            <PlanCard title="Recommended Architecture" editable={editable}>
              <div className="grid gap-3 sm:grid-cols-2">
                {p.aiPlan.architecture.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-3 text-sm">
                    <span className="grid size-6 shrink-0 place-items-center rounded bg-primary/15 font-mono text-xs text-primary">{i + 1}</span>
                    {a}
                  </div>
                ))}
              </div>
            </PlanCard>
          </TabsContent>

          <TabsContent value="erd" className="mt-4">
            <PlanCard title="Entity-Relationship Model" editable={editable}>
              <p className="mb-3 text-xs text-muted-foreground">Mermaid draft — refined by a human DB designer.</p>
              <pre className="overflow-x-auto rounded-md border border-border bg-[#0a0e14] p-4 font-mono text-xs leading-relaxed text-chart-1">
{p.aiPlan.erdMermaid}
              </pre>
            </PlanCard>
          </TabsContent>

          <TabsContent value="sprints" className="mt-4">
            <PlanCard title={t("plan.sprintPlan")} editable={editable}>
              <div className="space-y-3">
                {p.aiPlan.sprints.map((s) => (
                  <div key={s.n} className="flex flex-col gap-3 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 font-display font-semibold text-primary">S{s.n}</div>
                    <div className="flex-1">
                      <div className="text-sm">{s.goal}</div>
                      <div className="text-xs text-muted-foreground font-mono">{s.weeks}</div>
                    </div>
                    <Mono className="text-sm text-muted-foreground sm:text-right">{s.pts} pts</Mono>
                  </div>
                ))}
              </div>
            </PlanCard>
          </TabsContent>

          <TabsContent value="risk" className="mt-4">
            <PlanCard title={t("plan.riskReport")} editable={editable}>
              <div className="mb-4 flex items-center gap-3 rounded-md border border-warning/25 bg-warning/10 p-3">
                <ShieldAlert className="size-5 text-warning" />
                <div>
                  <div className="text-sm font-medium">Composite risk score: {p.riskScore}/100 (Moderate)</div>
                  <div className="text-xs text-muted-foreground">Recalculated weekly from velocity, scope, and deadline proximity.</div>
                </div>
              </div>
              <div className="space-y-3">
                {p.aiPlan.risks.map((r, i) => (
                  <div key={i} className="rounded-md border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium">{r.flag}</span>
                      <StatusPill status={r.severity} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.note}</p>
                  </div>
                ))}
              </div>
            </PlanCard>
          </TabsContent>

          <TabsContent value="cost" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <PlanCard title={t("plan.budgetEstimate")} editable={editable}>
                <div className="text-3xl font-display font-semibold">{money(p.budgetLow)} – {money(p.budgetHigh)}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("client.everythingEstimate").replace("{spent}", money(p.spent))}
                </p>
                <div className="mt-4">
                  <ProgressBar value={(p.spent / p.budgetHigh) * 100} />
                  <div className="mt-1 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground font-mono">
                    <span>{t("plan.spent")}: {money(p.spent)}</span>
                    <span>{t("plan.ceiling")}: {money(p.budgetHigh)}</span>
                  </div>
                </div>
              </PlanCard>
              <PlanCard title={t("plan.timelinePrediction")} editable={editable}>
                <div className="text-3xl font-display font-semibold">{p.timelineWeeks} weeks</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(p.predictedStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} →{" "}
                  {new Date(p.predictedEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                {p.aiPlan.timeline?.rationale && (
                  <p className="mt-2 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground italic">
                    "{p.aiPlan.timeline.rationale}"
                  </p>
                )}
                <div className="mt-4 space-y-2">
                  {p.team.slice(0, 4).map((id) => {
                    const m = personById(id)!;
                    return (
                      <div key={id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span>{m.name}</span>
                        <span className="text-muted-foreground font-mono">{m.role === "tm" ? "Lead" : m.rate ? money(m.rate) + "/hr" : "—"}</span>
                      </div>
                    );
                  })}
                </div>
              </PlanCard>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function PlanCard({ title, children, editable }: { title: string; children: React.ReactNode; editable?: boolean }) {
  const { t } = useLanguage();
  return (
    <Panel className="p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3>{title}</h3>
        {editable && (
          <button className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40">
            <Pencil className="size-3" /> {t("common.edit")}
          </button>
        )}
      </div>
      {children}
    </Panel>
  );
}
