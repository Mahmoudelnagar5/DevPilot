// ---------------------------------------------------------------------------
// DevPilot mock data layer
// Central source of truth for the prototype. All roles read from here so the
// screens feel like a single coherent product.
// ---------------------------------------------------------------------------

export type Role = "client" | "developer" | "tm" | "admin";

export interface Person {
  id: string;
  name: string;
  role: Role;
  title: string;
  avatar: string;
  skills?: string[];
  availability?: number; // % free capacity
  rate?: number; // hourly USD
}

export interface Milestone {
  id: string;
  name: string;
  due: string;
  amount: number;
  status: "upcoming" | "in-review" | "approved" | "paid";
  progress: number;
}

export interface Task {
  id: string;
  key: string;
  title: string;
  status: "todo" | "in-progress" | "review" | "done";
  assignee: string; // person id
  points: number;
  epic: string;
  hoursLogged: number;
  estimate: number;
}

export interface Invoice {
  id: string;
  number: string;
  milestone: string;
  amount: number;
  issued: string;
  status: "paid" | "due" | "overdue";
}

export interface Project {
  id: string;
  name: string;
  client: string;
  domain: string;
  description: string;
  complexity: "Low" | "Medium" | "High";
  status: "intake" | "ai-analysis" | "tm-review" | "client-approval" | "in-progress" | "delivered";
  health: number;
  progress: number;
  riskScore: number;
  riskFlags: string[];
  budgetLow: number;
  budgetHigh: number;
  spent: number;
  timelineWeeks: number;
  predictedStart: string;
  predictedEnd: string;
  team: string[]; // person ids
  milestones: Milestone[];
  tasks: Task[];
  invoices: Invoice[];
  cover: string;
}

const AV = (seed: string) =>
  `https://i.pravatar.cc/120?u=${seed}`;

export const people: Person[] = [
  { id: "u-nadia", name: "Nadia Farouk", role: "client", title: "Founder, LedgerLoop", avatar: AV("nadia") },
  { id: "u-marco", name: "Marco Belli", role: "client", title: "CEO, FleetSense", avatar: AV("marco") },
  { id: "u-lina", name: "Lina Haddad", role: "tm", title: "Delivery Lead", avatar: AV("lina") },
  { id: "u-youssef", name: "Youssef Amrani", role: "developer", title: "Full-Stack Engineer", avatar: AV("youssef"), skills: ["React", "Node", "PostgreSQL", "AWS"], availability: 40, rate: 65 },
  { id: "u-sara", name: "Sara Novak", role: "developer", title: "Frontend Engineer", avatar: AV("sara"), skills: ["React", "TypeScript", "Design Systems"], availability: 70, rate: 58 },
  { id: "u-devon", name: "Devon Price", role: "developer", title: "Backend Engineer", avatar: AV("devon"), skills: [".NET", "SQL Server", "Azure", "CQRS"], availability: 25, rate: 72 },
  { id: "u-mei", name: "Mei Tanaka", role: "developer", title: "ML / AI Engineer", avatar: AV("mei"), skills: ["Python", "Gemini API", "LangChain", "Vector DB"], availability: 55, rate: 80 },
  { id: "u-admin", name: "Ops Console", role: "admin", title: "Platform Admin", avatar: AV("ops") },
];

export const personById = (id: string) => people.find((p) => p.id === id);

export const CURRENT_USER: Record<Role, Person> = {
  client: people.find((p) => p.id === "u-nadia")!,
  developer: people.find((p) => p.id === "u-youssef")!,
  tm: people.find((p) => p.id === "u-lina")!,
  admin: people.find((p) => p.id === "u-admin")!,
};

// ---------------------------------------------------------------------------
// AI-generated artifacts (shared per project via id)
// ---------------------------------------------------------------------------

export const aiRequirements = {
  functional: [
    "Double-entry bookkeeping engine with immutable transaction ledger",
    "Bank feed aggregation via Plaid with automatic reconciliation",
    "Multi-currency invoicing with configurable tax rules per region",
    "Role-based access for Owner, Accountant, and Read-only viewer",
    "Exportable financial statements (P&L, Balance Sheet, Cash Flow)",
  ],
  nonFunctional: [
    "Sub-300ms P95 latency on ledger queries up to 5M rows",
    "SOC 2 Type II aligned audit logging on every mutation",
    "99.9% uptime for the core accounting API",
    "Encryption at rest (AES-256) and in transit (TLS 1.3)",
  ],
};

export const aiUserStories = [
  { epic: "Onboarding", stories: [
    "As a founder, I want to connect my bank account so that transactions import automatically.",
    "As a founder, I want a guided chart-of-accounts setup so that I don't need an accountant to start.",
  ]},
  { epic: "Ledger", stories: [
    "As an accountant, I want to categorize transactions in bulk so that month-end close is faster.",
    "As an accountant, I want an immutable audit trail so that I can prove compliance.",
  ]},
  { epic: "Reporting", stories: [
    "As a founder, I want a real-time cash-flow view so that I can make runway decisions.",
  ]},
];

export const aiRisks = [
  { flag: "Plaid integration scope underestimated", severity: "high" as const, note: "Bank feed edge cases (pending vs. posted) commonly add 1–2 sprints." },
  { flag: "Multi-currency tax rules ambiguous", severity: "medium" as const, note: "Requirements name 'configurable tax rules' without listing target jurisdictions." },
  { flag: "Single backend engineer at 25% availability", severity: "medium" as const, note: "Devon is the only .NET resource and is near capacity across projects." },
];

export const aiArchitecture = [
  "Next.js 15 (App Router) frontend on Vercel edge",
  "ASP.NET Core 9 API — Clean Architecture + CQRS/MediatR",
  "SQL Server primary with read replicas for reporting",
  "Redis for session cache and idempotency keys",
  "Azure Blob Storage (SAS-scoped) for statement exports",
  "Gemini API service layer for analysis + function calling",
];

export const erdMermaid = `erDiagram
  ORGANIZATION ||--o{ ACCOUNT : owns
  ACCOUNT ||--o{ TRANSACTION : records
  TRANSACTION }o--|| CATEGORY : classified_by
  ORGANIZATION ||--o{ INVOICE : issues
  INVOICE ||--o{ LINE_ITEM : contains
  ORGANIZATION ||--o{ USER : employs`;

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const projects: Project[] = [
  {
    id: "p-ledgerloop",
    name: "LedgerLoop",
    client: "u-nadia",
    domain: "Fintech / Accounting SaaS",
    description: "AI-assisted double-entry bookkeeping platform for early-stage startups with automated bank reconciliation and real-time cash-flow reporting.",
    complexity: "High",
    status: "in-progress",
    health: 82,
    progress: 46,
    riskScore: 38,
    riskFlags: ["Plaid scope", "Backend capacity"],
    budgetLow: 68000,
    budgetHigh: 94000,
    spent: 41200,
    timelineWeeks: 18,
    predictedStart: "2026-05-04",
    predictedEnd: "2026-09-11",
    team: ["u-lina", "u-youssef", "u-sara", "u-devon", "u-mei"],
    cover: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=400&fit=crop&auto=format",
    milestones: [
      { id: "m1", name: "Foundations & Auth", due: "2026-05-30", amount: 14000, status: "paid", progress: 100 },
      { id: "m2", name: "Ledger Engine", due: "2026-07-04", amount: 22000, status: "approved", progress: 100 },
      { id: "m3", name: "Bank Reconciliation", due: "2026-08-01", amount: 24000, status: "in-review", progress: 78 },
      { id: "m4", name: "Reporting & Export", due: "2026-09-11", amount: 18000, status: "upcoming", progress: 12 },
    ],
    invoices: [
      { id: "i1", number: "DP-1042", milestone: "Foundations & Auth", amount: 14000, issued: "2026-06-01", status: "paid" },
      { id: "i2", number: "DP-1067", milestone: "Ledger Engine", amount: 22000, issued: "2026-07-05", status: "paid" },
      { id: "i3", number: "DP-1091", milestone: "Bank Reconciliation", amount: 24000, issued: "2026-07-10", status: "due" },
    ],
    tasks: [
      { id: "t1", key: "LL-118", title: "Handle Plaid pending→posted transitions", status: "in-progress", assignee: "u-youssef", points: 8, epic: "Ledger", hoursLogged: 11, estimate: 16 },
      { id: "t2", key: "LL-121", title: "Reconciliation match UI", status: "in-progress", assignee: "u-sara", points: 5, epic: "Ledger", hoursLogged: 6, estimate: 12 },
      { id: "t3", key: "LL-124", title: "Idempotent import worker (Redis keys)", status: "review", assignee: "u-devon", points: 8, epic: "Ledger", hoursLogged: 14, estimate: 14 },
      { id: "t4", key: "LL-126", title: "Cash-flow chart data endpoint", status: "todo", assignee: "u-devon", points: 5, epic: "Reporting", hoursLogged: 0, estimate: 10 },
      { id: "t5", key: "LL-130", title: "Gemini categorization suggestions", status: "todo", assignee: "u-mei", points: 13, epic: "Ledger", hoursLogged: 0, estimate: 24 },
      { id: "t6", key: "LL-101", title: "JWT + refresh token rotation", status: "done", assignee: "u-devon", points: 5, epic: "Onboarding", hoursLogged: 9, estimate: 8 },
      { id: "t7", key: "LL-104", title: "Chart-of-accounts wizard", status: "done", assignee: "u-sara", points: 8, epic: "Onboarding", hoursLogged: 15, estimate: 16 },
      { id: "t8", key: "LL-128", title: "Multi-currency FX rate service", status: "todo", assignee: "u-youssef", points: 8, epic: "Reporting", hoursLogged: 0, estimate: 14 },
    ],
  },
  {
    id: "p-fleetsense",
    name: "FleetSense",
    client: "u-marco",
    domain: "IoT / Logistics",
    description: "Real-time fleet telemetry dashboard with predictive maintenance alerts and route optimization for mid-size logistics operators.",
    complexity: "Medium",
    status: "client-approval",
    health: 71,
    progress: 8,
    riskScore: 52,
    riskFlags: ["Hardware dependency", "Unclear SLA"],
    budgetLow: 42000,
    budgetHigh: 61000,
    spent: 4800,
    timelineWeeks: 12,
    predictedStart: "2026-07-20",
    predictedEnd: "2026-10-12",
    team: ["u-lina", "u-mei", "u-sara"],
    cover: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&h=400&fit=crop&auto=format",
    milestones: [
      { id: "m1", name: "Telemetry Ingest", due: "2026-08-15", amount: 16000, status: "upcoming", progress: 0 },
      { id: "m2", name: "Alerting Engine", due: "2026-09-12", amount: 20000, status: "upcoming", progress: 0 },
      { id: "m3", name: "Route Optimizer", due: "2026-10-12", amount: 18000, status: "upcoming", progress: 0 },
    ],
    invoices: [],
    tasks: [
      { id: "t1", key: "FS-12", title: "MQTT ingest spike", status: "todo", assignee: "u-mei", points: 5, epic: "Ingest", hoursLogged: 0, estimate: 10 },
      { id: "t2", key: "FS-14", title: "Dashboard shell", status: "todo", assignee: "u-sara", points: 3, epic: "UI", hoursLogged: 0, estimate: 6 },
    ],
  },
];

export const projectById = (id: string) => projects.find((p) => p.id === id);

// ---------------------------------------------------------------------------
// Code review (AI) sample
// ---------------------------------------------------------------------------

export const codeReview = {
  pr: "#284 · Handle Plaid pending→posted transitions",
  qualityScore: 84,
  securityFlags: 1,
  comments: [
    { file: "ImportWorker.cs", line: 142, severity: "warning" as const, text: "Potential race: two webhooks for the same transaction can both pass the exists() check. Use the Redis idempotency key here." },
    { file: "ImportWorker.cs", line: 88, severity: "security" as const, text: "Raw Plaid access_token is written to the debug log. Redact before logging (PII / secret exposure)." },
    { file: "TransactionMapper.cs", line: 51, severity: "info" as const, text: "Consider extracting the currency-normalization branch into FxService for reuse in reporting." },
  ],
};

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export interface Message { id: string; from: string; text: string; time: string; }
export const messages: Message[] = [
  { id: "msg1", from: "u-lina", text: "Hi Nadia — the ledger engine milestone is approved on our side. Reconciliation is at 78%, tracking to the Aug 1 date.", time: "09:14" },
  { id: "msg2", from: "u-nadia", text: "Great to hear. One question — will the Plaid pending-transaction handling affect my cash-flow report accuracy?", time: "09:22" },
  { id: "msg3", from: "u-youssef", text: "It won't — pending amounts are shown separately and reconciled once posted, so the cash-flow view stays accurate.", time: "09:31" },
  { id: "msg4", from: "u-nadia", text: "Perfect. Approving the ledger milestone payment now. 🎉", time: "09:40" },
];

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface Notification { id: string; type: "milestone" | "risk" | "message" | "review"; text: string; time: string; unread: boolean; }
export const notifications: Notification[] = [
  { id: "n1", type: "risk", text: "Risk score for LedgerLoop rose to 38 — Plaid scope flagged.", time: "12m", unread: true },
  { id: "n2", type: "review", text: "AI code review completed on PR #284 (score 84, 1 security flag).", time: "1h", unread: true },
  { id: "n3", type: "milestone", text: "Milestone 'Bank Reconciliation' submitted for review.", time: "3h", unread: true },
  { id: "n4", type: "message", text: "New message from Lina Haddad in LedgerLoop.", time: "5h", unread: false },
];

// ---------------------------------------------------------------------------
// Admin / platform analytics
// ---------------------------------------------------------------------------

export const platformStats = {
  activeProjects: 128,
  mrr: 84200,
  churn: 2.4,
  aiCost: 3180,
  aiCalls: 41200,
  users: { clients: 342, developers: 1180, tms: 46 },
};

export const mrrTrend = [
  { month: "Jan", mrr: 51200, churn: 3.1 },
  { month: "Feb", mrr: 56800, churn: 2.9 },
  { month: "Mar", mrr: 61400, churn: 3.3 },
  { month: "Apr", mrr: 67900, churn: 2.7 },
  { month: "May", mrr: 74100, churn: 2.6 },
  { month: "Jun", mrr: 79800, churn: 2.5 },
  { month: "Jul", mrr: 84200, churn: 2.4 },
];

export const aiUsageByFeature = [
  { feature: "Analyzer", calls: 8200 },
  { feature: "Requirements", calls: 7100 },
  { feature: "Sprint Plan", calls: 6400 },
  { feature: "Code Review", calls: 9800 },
  { feature: "Risk", calls: 4300 },
  { feature: "Chat", calls: 5400 },
];

export interface PlatformUser { id: string; name: string; email: string; role: Role; status: "active" | "suspended" | "pending"; projects: number; joined: string; }
export const platformUsers: PlatformUser[] = [
  { id: "pu1", name: "Nadia Farouk", email: "nadia@ledgerloop.io", role: "client", status: "active", projects: 1, joined: "2026-04-28" },
  { id: "pu2", name: "Marco Belli", email: "marco@fleetsense.co", role: "client", status: "active", projects: 1, joined: "2026-07-01" },
  { id: "pu3", name: "Youssef Amrani", email: "youssef@dev.io", role: "developer", status: "active", projects: 3, joined: "2025-11-12" },
  { id: "pu4", name: "Sara Novak", email: "sara@dev.io", role: "developer", status: "active", projects: 4, joined: "2025-09-03" },
  { id: "pu5", name: "Devon Price", email: "devon@dev.io", role: "developer", status: "active", projects: 5, joined: "2025-06-20" },
  { id: "pu6", name: "Lina Haddad", email: "lina@devpilot.io", role: "tm", status: "active", projects: 9, joined: "2025-03-15" },
  { id: "pu7", name: "Karl Vex", email: "karl@spam.io", role: "developer", status: "suspended", projects: 0, joined: "2026-06-30" },
  { id: "pu8", name: "Priya Nair", email: "priya@dev.io", role: "developer", status: "pending", projects: 0, joined: "2026-07-11" },
];

export const plans = [
  { name: "Starter", price: 0, projects: 1, seats: 3, ai: "500 AI actions/mo", active: 210, highlight: false },
  { name: "Growth", price: 249, projects: 5, seats: 15, ai: "5,000 AI actions/mo", active: 96, highlight: true },
  { name: "Scale", price: 899, projects: "Unlimited", seats: 50, ai: "50,000 AI actions/mo", active: 36, highlight: false },
];

export const supportTickets = [
  { id: "TK-401", subject: "Cannot export P&L to PDF", user: "Nadia Farouk", priority: "high", status: "open", age: "2h" },
  { id: "TK-398", subject: "AI risk score seems too high", user: "Marco Belli", priority: "medium", status: "open", age: "6h" },
  { id: "TK-390", subject: "Payout not received", user: "Devon Price", priority: "high", status: "escalated", age: "1d" },
  { id: "TK-385", subject: "Feature request: dark mode", user: "Sara Novak", priority: "low", status: "closed", age: "3d" },
];

// The AI lifecycle stages, used for the intake / status stepper.
export const lifecycleStages = [
  { key: "intake", label: "Intake" },
  { key: "ai-analysis", label: "AI Analysis" },
  { key: "tm-review", label: "TM Review" },
  { key: "client-approval", label: "Client Approval" },
  { key: "in-progress", label: "Execution" },
  { key: "delivered", label: "Delivered" },
] as const;
