import { type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  ArrowRight, Search, FileText, ListChecks, KanbanSquare, Boxes, GitBranch,
  Users, ShieldAlert, CalendarClock, DollarSign, MessageSquare, BookOpen,
  GitPullRequest, BarChart3, Bot, Check, X, Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";
import { PipelineDemo } from "./PipelineDemo";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#comparison", label: "Why DevPilot" },
  { href: "#features", label: "AI features" },
  { href: "#pricing", label: "Pricing" },
];

const LIFECYCLE_STEPS = [
  { title: "Describe the idea", detail: "The client writes it in plain language, or uploads a spec / Figma link." },
  { title: "AI analyzes it", detail: "Requirements, user stories, architecture, ERD, cost range, timeline, milestones, sprint plan and a risk report — drafted automatically." },
  { title: "A Technical Manager reviews it", detail: "A human lead edits the plan and assigns developers — the AI ranks candidates, the manager confirms." },
  { title: "The client approves", detail: "Or sends it back with feedback; the AI redrafts around it." },
  { title: "Developers build in sprints", detail: "Clear Kanban tickets, time tracking, deliverables tied to milestones." },
  { title: "AI keeps watch", detail: "Every pull request gets reviewed, the health score updates, delay risk is flagged early." },
  { title: "Milestones get approved", detail: "The manager signs off on quality, the client signs off on the milestone and releases payment." },
  { title: "Everyone gets reporting", detail: "Clients and managers get recurring status reports; admins get platform-wide analytics." },
];

const COMPARISON_ROWS = [
  { capability: "Turns an idea into written requirements", clickup: false, devpilot: true },
  { capability: "Estimates cost and timeline", clickup: false, devpilot: true },
  { capability: "Drafts architecture and an ER diagram", clickup: false, devpilot: true },
  { capability: "Reviews every pull request", clickup: false, devpilot: true },
  { capability: "Predicts delay risk before it happens", clickup: false, devpilot: true },
  { capability: "Matches developers to tasks by skill", clickup: false, devpilot: true },
  { capability: "Organizes boards, sprints and tickets", clickup: true, devpilot: true },
  { capability: "Built for non-technical founders, not existing eng teams", clickup: false, devpilot: true },
];

const AI_FEATURES = [
  { icon: Search, label: "Project Analyzer" },
  { icon: FileText, label: "Requirement Generator" },
  { icon: ListChecks, label: "User Story Generator" },
  { icon: KanbanSquare, label: "Sprint Planner" },
  { icon: Boxes, label: "Architecture Generator" },
  { icon: GitBranch, label: "ER Diagram Generator" },
  { icon: Users, label: "Developer Matching" },
  { icon: ShieldAlert, label: "Risk Prediction" },
  { icon: CalendarClock, label: "Timeline Prediction" },
  { icon: DollarSign, label: "Budget Estimation" },
  { icon: MessageSquare, label: "Meeting Summarizer" },
  { icon: BookOpen, label: "Documentation Generator" },
  { icon: GitPullRequest, label: "AI Code Review" },
  { icon: BarChart3, label: "Project Health Score" },
  { icon: Bot, label: "AI Chat Assistant" },
];

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    tagline: "One idea, moving.",
    features: ["1 active project", "3 seats", "Core AI analysis", "Email support"],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$199",
    tagline: "For founders shipping for real.",
    features: ["5 active projects", "15 seats", "Full AI suite", "AI code review", "Priority support"],
    highlighted: true,
  },
  {
    name: "Scale",
    price: "$599",
    tagline: "For teams running a pipeline of builds.",
    features: ["Unlimited projects", "Unlimited seats", "Priority AI queue", "Custom prompt tuning", "Dedicated manager option"],
    highlighted: false,
  },
];

function fadeUp(delay = 0): Variants {
  return {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: "easeOut" } },
  };
}

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={fadeUp(delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.14em] text-primary">
      <Sparkles className="size-3.5" strokeWidth={2} />
      {children}
    </span>
  );
}

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-display text-sm font-bold">D</div>
            <span className="font-display text-sm font-semibold tracking-tight">DevPilot</span>
          </div>
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </a>
            ))}
          </nav>
          <Button size="sm" onClick={onEnter} className="shrink-0">
            <span className="hidden sm:inline">Launch dashboard</span>
            <span className="sm:hidden">Launch</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.15] blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--chart-1), var(--chart-2) 60%, transparent 75%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-28">
          <motion.div
            initial={prefersReducedMotion ? undefined : "hidden"}
            animate={prefersReducedMotion ? undefined : "show"}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div variants={fadeUp()}>
              <Badge variant="outline" className="border-primary/30 text-primary font-mono">
                Your AI Technical Project Manager
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeUp(0.05)} className="mt-5 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
              Describe the idea.
              <br />
              DevPilot runs the project.
            </motion.h1>
            <motion.p variants={fadeUp(0.1)} className="mt-5 text-balance text-muted-foreground lg:text-lg">
              Most tools give you an empty board and leave the technical work to you. DevPilot's AI drafts the requirements,
              architecture, cost, and sprint plan — then reviews every pull request while a real Technical Manager signs off
              on the parts that matter.
            </motion.p>
            <motion.div variants={fadeUp(0.15)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" onClick={onEnter}>
                Launch the dashboard
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">See how it works</a>
              </Button>
            </motion.div>
          </motion.div>

          <div className="mt-16">
            <Reveal delay={0.05}>
              <PipelineDemo />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-border/80 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SectionEyebrow>The problem</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Non-technical founders can't evaluate technical work.
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Marketplaces like Upwork hand you a list of freelancers and leave the vetting and delivery management to you.
              Tools like ClickUp or Jira hand you an empty board — they organize the work, they don't do it.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.05} className="rounded-xl border border-border bg-card/60 p-6">
              <h3 className="font-display text-lg font-semibold">If you're the client</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>Can't tell if the work is actually good, or just looks busy.</li>
                <li>No real sense of what it should cost or how long it should take.</li>
                <li>No visibility into risk until a deadline is already missed.</li>
                <li>Constant fear of being overcharged by people you can't technically judge.</li>
              </ul>
            </Reveal>
            <Reveal delay={0.12} className="rounded-xl border border-border bg-card/60 p-6">
              <h3 className="font-display text-lg font-semibold">If you're the developer</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>Ad-hoc requests instead of clearly scoped tickets.</li>
                <li>Time tracking and payment that depend on someone remembering to pay you.</li>
                <li>A non-technical client trying to manage technical decisions directly.</li>
                <li>Hours lost writing status updates instead of building.</li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border/80 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SectionEyebrow>How it works</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              One idea, eight steps, a delivered project.
            </h2>
          </Reveal>

          <div className="relative mt-14 grid gap-x-8 gap-y-10 lg:grid-cols-2">
            <div aria-hidden className="absolute left-[15px] top-2 hidden h-[calc(100%-2rem)] w-px bg-border lg:block" />
            {LIFECYCLE_STEPS.map((step, i) => (
              <Reveal key={step.title} delay={(i % 2) * 0.05} className="relative flex gap-4 lg:pl-0">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-xs font-medium text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Guardrail principle */}
      <section className="border-t border-border/80 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal className="rounded-xl border border-primary/25 bg-primary/[0.06] p-5 text-center sm:p-8">
            <p className="font-display text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
              AI proposes. Humans approve.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Every cost, timeline, and risk score DevPilot generates is labeled as an estimate — never a guarantee. Money,
              hiring, and deployment always pass through a human Technical Manager and the client before anything moves.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Comparison */}
      <section id="comparison" className="border-t border-border/80 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <SectionEyebrow>Why DevPilot</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              A board organizes work. DevPilot does it.
            </h2>
          </Reveal>

          <Reveal delay={0.05} className="mt-10 overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-border bg-card/60 text-left">
                  <th className="px-5 py-3.5 font-medium text-muted-foreground">Capability</th>
                  <th className="px-5 py-3.5 font-medium text-muted-foreground text-center">ClickUp / Jira</th>
                  <th className="px-5 py-3.5 font-medium text-primary text-center">DevPilot</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.capability} className={cn("border-b border-border last:border-0", i % 2 === 1 && "bg-card/30")}>
                    <td className="px-5 py-3.5">{row.capability}</td>
                    <td className="px-5 py-3.5 text-center">
                      {row.clickup ? <Check className="mx-auto size-4 text-success" /> : <X className="mx-auto size-4 text-muted-foreground/50" />}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {row.devpilot ? <Check className="mx-auto size-4 text-primary" /> : <X className="mx-auto size-4 text-muted-foreground/50" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* AI Features grid */}
      <section id="features" className="border-t border-border/80 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SectionEyebrow>Under the hood</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Fifteen AI capabilities, one continuous manager.
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {AI_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.label} delay={(i % 5) * 0.04}>
                  <div className="group h-full rounded-lg border border-border bg-card/50 p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.04]">
                    <Icon className="size-4 text-primary" strokeWidth={1.75} />
                    <p className="mt-2.5 text-sm font-medium">{feature.label}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border/80 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="text-center">
            <SectionEyebrow>Pricing</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Priced for how many projects you run.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.06}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-xl border p-6 transition-transform hover:-translate-y-1",
                    plan.highlighted ? "border-primary/50 bg-primary/[0.05]" : "border-border bg-card/50"
                  )}
                >
                  {plan.highlighted && (
                    <Badge className="absolute -top-3 left-6">Most popular</Badge>
                  )}
                  <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                  <p className="mt-5 font-display text-3xl font-semibold">
                    {plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-6"
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={onEnter}
                  >
                    Get started
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA + footer */}
      <section className="border-t border-border/80 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Your next project deserves a technical manager.
            </h2>
            <p className="mt-3 text-muted-foreground">Even if it's an AI one, backed by a human who signs off on it.</p>
            <div className="mt-7">
              <Button size="lg" onClick={onEnter}>
                Launch the dashboard
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-border/80 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 sm:text-left">
          <span>© {new Date().getFullYear()} DevPilot. All estimates are AI-generated and reviewed by a human before they're final.</span>
          <span className="font-mono">AI proposes · humans approve</span>
        </div>
      </footer>
    </div>
  );
}
