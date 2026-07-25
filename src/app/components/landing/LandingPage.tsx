import { type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  ArrowRight, ArrowDown, Search, FileText, ListChecks, KanbanSquare, Boxes, GitBranch,
  Users, ShieldAlert, CalendarClock, DollarSign, MessageSquare, BookOpen,
  GitPullRequest, BarChart3, Bot, Check, X, Sparkles, FileClock,
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
  { href: "#human-oversight", label: "Human oversight" },
];

const LIFECYCLE_STEPS = [
  { title: "Describe the idea", detail: "The client writes it in plain language, or uploads a spec / Figma link." },
  { title: "AI analyzes it", detail: "Requirements, user stories, architecture, ERD, cost range, timeline, milestones, sprint plan and a risk report — drafted automatically." },
  { title: "Human oversight reviews it", detail: "A human lead edits the plan and assigns developers — the AI ranks candidates, the manager confirms." },
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
  {
    icon: Search, label: "Project Analyzer",
    desc: "Scans your idea and identifies scope, risks, and missing pieces before writing a line of code.",
    example: 'e.g. "Build an Uber for dogs" → finds hidden complexity around payments, GPS, and vet verification.',
  },
  {
    icon: FileText, label: "Requirement Generator",
    desc: "Turns a one-sentence idea into structured user stories with acceptance criteria.",
    example: 'e.g. "Add login" → generates SSO, password reset, 2FA, and role-based access stories.',
  },
  {
    icon: ListChecks, label: "User Story Generator",
    desc: "Breaks features into granular, testable user stories with priority and effort estimates.",
    example: 'e.g. "Payment flow" → creates separate stories for checkout, receipts, refunds, and currency.',
  },
  {
    icon: KanbanSquare, label: "Sprint Planner",
    desc: "Organizes work into realistic sprints based on team velocity and dependency chains.",
    example: 'e.g. Detects that API must be built before frontend work can start, schedules accordingly.',
  },
  {
    icon: Boxes, label: "Architecture Generator",
    desc: "Proposes a scalable system architecture with tech stack recommendations.",
    example: 'e.g. Recommends Next.js + PostgreSQL + Redis for a SaaS dashboard, explains trade-offs.',
  },
  {
    icon: GitBranch, label: "ER Diagram Generator",
    desc: "Auto-generates entity-relationship diagrams from your requirements.",
    example: 'e.g. Detects Users, Projects, Tasks, Comments → draws relationships and foreign keys.',
  },
  {
    icon: Users, label: "Developer Matching",
    desc: "Matches developers to tasks based on skills, availability, and past performance.",
    example: 'e.g. Assigns a React specialist to the frontend sprint, backend dev to API work.',
  },
  {
    icon: ShieldAlert, label: "Risk Prediction",
    desc: "Flags technical and timeline risks before they become blockers.",
    example: 'e.g. "Third-party payment API has 2-week approval time" → alerts 3 sprints early.',
  },
  {
    icon: CalendarClock, label: "Timeline Prediction",
    desc: "Estimates realistic delivery dates based on similar projects and team capacity.",
    example: 'e.g. "MVP in 8 weeks" instead of a developer guessing "4 weeks" and missing it.',
  },
  {
    icon: DollarSign, label: "Budget Estimation",
    desc: "Provides cost breakdowns by feature, sprint, and role.",
    example: 'e.g. "Auth system: $2,400 | Dashboard: $5,100 | Total: $18,500 ± 15%".',
  },
  {
    icon: MessageSquare, label: "Meeting Summarizer",
    desc: "Transcribes and summarizes standups, client calls, and sprint reviews.",
    example: 'e.g. 30-min call → 5 bullet points with decisions, action items, and owners.',
  },
  {
    icon: BookOpen, label: "Documentation Generator",
    desc: "Auto-generates API docs, README files, and technical specifications.",
    example: 'e.g. Generates OpenAPI spec from your endpoint code, adds usage examples.',
  },
  {
    icon: GitPullRequest, label: "AI Code Review",
    desc: "Reviews every PR for bugs, security issues, and style violations.",
    example: 'e.g. Flags SQL injection risk, suggests performance optimization, checks naming conventions.',
  },
  {
    icon: BarChart3, label: "Health Score",
    desc: "Continuously scores your project on timeline, budget, quality, and risk.",
    example: 'e.g. "Score: 72/100 — timeline risk high, code quality excellent".',
  },
  {
    icon: Bot, label: "AI Chat Assistant",
    desc: "Ask questions about your project in natural language, get instant answers.",
    example: 'e.g. "What\'s blocking the payment feature?" → shows dependency chain and ETA.',
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    priceNote: "/month",
    tagline: "Validate your idea",
    features: [
      "1 Project", "Idea Analysis", "Requirements", "Cost & Timeline",
      "Sprint Planning", "Architecture", "Code Review", "Decision Ledger",
      "Health Score", "Community",
    ],
    note: "AI Proposes. Human Oversight available when you upgrade.",
    checks: [],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$49",
    priceNote: "/month",
    tagline: "Your AI Technical Project Manager",
    features: [
      "Unlimited Projects", "AI Planning", "Impact Simulator", "Stand-up Coach",
      "Advanced Code Review", "Security Review", "Priority Processing",
      "Client Portal", "Export Docs", "Email Support", "Human Oversight",
    ],
    checks: [
      "Technical Manager validates critical decisions when risk is high.",
    ],
    cta: "Start Building",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$199",
    priceNote: "/month",
    tagline: "AI + Human Expertise",
    features: [
      "Unlimited Members", "Shared Workspace", "Sprint Analytics",
      "Risk Dashboard", "Architecture Validation", "Advanced Security",
      "TM Consultation", "Faster SLA", "Team Insights", "API Access",
      "Priority Support", "Human Oversight",
    ],
    checks: [
      "Direct consultation with a DevPilot Certified Technical Manager.",
      "Architecture & milestone validation.",
    ],
    cta: "Grow Faster",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom Pricing",
    priceNote: "",
    tagline: "Your External Engineering Office",
    features: [
      "Dedicated TM", "Solution Architect", "Executive Dashboard",
      "Weekly Reviews", "CTO Advisory", "Compliance & Security",
      "Custom AI Models", "On-premise", "SSO", "SLA Guarantee",
      "Dedicated CSM", "Human Oversight",
    ],
    checks: [
      "Every critical technical decision supervised by your DevPilot engineering team.",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const WHY_DEVPILOT_ROWS = [
  { traditional: "AI gives suggestions", devpilot: "AI gives recommendations validated by engineering workflows" },
  { traditional: "You make decisions alone", devpilot: "Critical decisions can be reviewed by Technical Managers" },
  { traditional: "No project governance", devpilot: "Decision Ledger & Trust Layer" },
  { traditional: "Generic code review", devpilot: "Context-aware code review tied to project requirements" },
  { traditional: "Just another chatbot", devpilot: "AI Technical Project Manager" },
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

function FlowNode({ children, highlight = false }: { children: ReactNode; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border px-5 py-2.5 text-center text-sm font-medium",
        highlight
          ? "border-primary/40 bg-primary/[0.08] text-primary"
          : "border-border bg-card text-foreground"
      )}
    >
      {children}
    </div>
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
              Most tools give you an empty board and leave the technical work to you. DevPilot&apos;s AI drafts the requirements,
              architecture, cost, and sprint plan — then reviews every pull request while human oversight signs off
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
              Non-technical founders can&apos;t evaluate technical work.
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Marketplaces like Upwork hand you a list of freelancers and leave the vetting and delivery management to you.
              Tools like ClickUp or Jira hand you an empty board — they organize the work, they don&apos;t do it.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.05} className="rounded-xl border border-border bg-card/60 p-6">
              <h3 className="font-display text-lg font-semibold">If you&apos;re the client</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>Can&apos;t tell if the work is actually good, or just looks busy.</li>
                <li>No real sense of what it should cost or how long it should take.</li>
                <li>No visibility into risk until a deadline is already missed.</li>
                <li>Constant fear of being overcharged by people you can&apos;t technically judge.</li>
              </ul>
            </Reveal>
            <Reveal delay={0.12} className="rounded-xl border border-border bg-card/60 p-6">
              <h3 className="font-display text-lg font-semibold">If you&apos;re the developer</h3>
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

      {/* Trust Layer */}
      <section id="trust-layer" className="border-t border-border/80 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="text-center">
            <SectionEyebrow>Trust Layer</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Why let DevPilot run your project?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              Because every estimate is labeled, every decision is logged, and every payout is approved by two people
              before it moves.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Reveal delay={0.05} className="rounded-xl border border-border bg-card/50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                  <span className="text-lg font-bold">~</span>
                </div>
                <h3 className="font-display text-base font-semibold">Everything is an estimate — never a guarantee</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Every cost, timeline, and risk score DevPilot generates is explicitly labeled as an estimate, not a
                promise. The AI shows its confidence level and assumptions so you always know how much to trust it.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="rounded-xl border border-border bg-card/50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <span className="text-lg font-bold">🔒</span>
                </div>
                <h3 className="font-display text-base font-semibold">Money & hiring pass through a human</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                AI proposes budgets and timelines, but no money moves and no developer gets hired without a human
                Technical Manager and the client both signing off. The AI recommends — the humans decide.
              </p>
            </Reveal>

            <Reveal delay={0.15} className="rounded-xl border border-border bg-card/50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-lg font-bold">✓✓</span>
                </div>
                <h3 className="font-display text-base font-semibold">Dual sign-off on quality and milestones</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                The Technical Manager signs off on code quality, architecture, and delivery. The client signs off on
                milestones and feature completion. Both must approve before a milestone is marked done.
              </p>
            </Reveal>

            <Reveal delay={0.2} className="rounded-xl border border-border bg-card/50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                  <span className="text-lg font-bold">$</span>
                </div>
                <h3 className="font-display text-base font-semibold">No money moves without dual approval</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Every payment release requires approval from both the client and the Technical Manager. The AI tracks
                the budget, flags overruns, and logs every transaction in the Decision Ledger — transparent to all
                parties.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.25} className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.06] px-5 py-2 text-sm text-muted-foreground">
              <FileClock className="size-4 text-primary" />
              Every decision is logged in the <strong className="text-foreground">Decision Ledger</strong> — a permanent,
              tamper-evident record your team and auditors can review.
            </div>
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

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AI_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.label} delay={(i % 3) * 0.04}>
                  <div className="group h-full rounded-xl border border-border bg-card/50 p-5 transition-colors hover:border-primary/40 hover:bg-primary/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="size-4 text-primary" strokeWidth={1.75} />
                      </div>
                      <h4 className="text-sm font-semibold">{feature.label}</h4>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                    <p className="mt-2 text-xs text-muted-foreground/70 italic">{feature.example}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border/80 py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="text-center">
            <SectionEyebrow>Pricing</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for outcomes, not feature lists.
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
              Reduce project risk. Save time. Prevent failure. Keep an accountable engineering partner in the loop.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.05}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-xl border p-5 transition-transform hover:-translate-y-1",
                    plan.highlighted ? "border-primary/50 bg-primary/[0.05]" : "border-border bg-card/50"
                  )}
                >
                  {plan.highlighted && (
                    <Badge className="absolute -top-3 left-6">Most popular</Badge>
                  )}
                  <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{plan.tagline}</p>
                  <p className="mt-3 font-display text-3xl font-semibold">
                    {plan.price}
                    {plan.priceNote && <span className="text-sm font-normal text-muted-foreground">{plan.priceNote}</span>}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {plan.features.map((f) => (
                      <span key={f} className="inline-block rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground">
                        {f}
                      </span>
                    ))}
                  </div>
                  {plan.note && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="flex items-start gap-1.5 text-[11px] text-primary">
                        <Check className="mt-0.5 size-3 shrink-0" />
                        <span>{plan.note}</span>
                      </p>
                    </div>
                  )}
                  {plan.checks.length > 0 && (
                    <div className="mt-3 space-y-1 border-t border-border pt-3">
                      {plan.checks.map((c) => (
                        <p key={c} className="flex items-start gap-1.5 text-[11px] text-primary">
                          <Check className="mt-0.5 size-3 shrink-0" />
                          <span>{c}</span>
                        </p>
                      ))}
                    </div>
                  )}
                  <Button
                    className="mt-4"
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={onEnter}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why DevPilot isn&apos;t just another AI tool */}
      <section id="why-devpilot" className="border-t border-border/80 py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <SectionEyebrow>Built differently</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Why DevPilot isn&apos;t just another AI tool
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Most AI coding tools leave you with a suggestion. DevPilot gives you decisions backed by engineering
              workflows, risk checks, and human oversight.
            </p>
          </Reveal>

          <Reveal delay={0.05} className="mt-6 overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-card/60 text-left">
                    <th className="px-5 py-3 font-medium text-muted-foreground">Traditional AI</th>
                    <th className="px-5 py-3 font-medium text-primary">DevPilot</th>
                  </tr>
                </thead>
                <tbody>
                  {WHY_DEVPILOT_ROWS.map((row, i) => (
                    <tr key={row.traditional} className={cn("border-b border-border last:border-0", i % 2 === 1 && "bg-card/30")}>
                      <td className="px-5 py-3 text-muted-foreground">{row.traditional}</td>
                      <td className="px-5 py-3 font-medium">{row.devpilot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Human Oversight */}
      <section id="human-oversight" className="border-t border-border/80 py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <SectionEyebrow>Human Oversight</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              AI proposes. Experts validate.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Every AI recommendation passes through a risk engine. Low-risk decisions move forward automatically.
              High-risk decisions are routed to a Technical Manager before anything gets built.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-12 flex flex-col items-center gap-3">
              <FlowNode>Idea</FlowNode>
              <ArrowDown className="size-5 text-muted-foreground/60" />
              <FlowNode>AI Analysis</FlowNode>
              <ArrowDown className="size-5 text-muted-foreground/60" />
              <FlowNode>AI Recommendation</FlowNode>
              <ArrowDown className="size-5 text-muted-foreground/60" />
              <FlowNode highlight>Risk Engine</FlowNode>
              <div className="my-1 h-6 w-px bg-border" />
              <div className="grid w-full max-w-xl grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col items-center gap-3">
                  <FlowNode>Low Risk</FlowNode>
                  <ArrowDown className="size-5 text-muted-foreground/60" />
                  <FlowNode>Continue</FlowNode>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <FlowNode>High Risk</FlowNode>
                  <ArrowDown className="size-5 text-muted-foreground/60" />
                  <FlowNode>Technical Manager Review</FlowNode>
                </div>
              </div>
              <div className="my-1 h-6 w-px bg-border" />
              <FlowNode highlight>Decision Ledger</FlowNode>
              <ArrowDown className="size-5 text-muted-foreground/60" />
              <FlowNode>Development</FlowNode>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA + footer */}
      <section className="border-t border-border/80 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Your next project deserves real oversight.
            </h2>
            <p className="mt-3 text-muted-foreground">Even if it starts with AI, a human expert signs off on what matters.</p>
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
