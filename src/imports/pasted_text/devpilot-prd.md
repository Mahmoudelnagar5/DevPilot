# DevPilot — Product Requirements Document (PRD)

**Tagline:** Your AI Technical Project Manager
**Version:** 1.0 (v1 Full Scope)
**AI Provider:** Google Gemini API
**Roles in v1:** Client, Developer, Technical Manager, Admin

---

## 1. Product Vision

DevPilot is an AI-powered technical project manager for software projects. Instead of a freelance marketplace where clients must vet developers and manage delivery themselves, DevPilot's AI layer acts as the technical authority throughout the project lifecycle: turning an idea into requirements, architecture, a costed sprint plan, and a monitored delivery pipeline — with human developers and a human Technical Manager executing and validating the AI's output.

**Core principle:** AI proposes, humans (Technical Manager, then Client) approve. AI never has unilateral authority over money, hiring, or deployment — it recommends; a human role confirms.

---

## 2. Personas

### 2.1 Client ("Nadia, Founder")
Non-technical or semi-technical founder/business owner with an idea. Wants to know: what will this cost, how long will it take, is it going well, can I trust the output. Primary fear: being overcharged or misled by developers she can't technically evaluate.

### 2.2 Developer ("Youssef, Full-Stack Engineer")
Freelance or contracted engineer. Wants clear scoped tasks, fair time tracking, fast payment, and to avoid being micromanaged by a non-technical client directly — prefers structured tickets over ad-hoc requests.

### 2.3 Technical Manager ("Lina, Delivery Lead")
Either a DevPilot employee or a senior contractor overseeing multiple projects. Uses AI output as a first draft, exercises judgment on top of it: assigns developers, approves milestones, reviews PRs, overrides AI risk/timeline predictions when she has better context.

### 2.4 Admin ("DevPilot Ops")
Manages the platform itself: subscriptions, payments, user base, platform health, support tickets. Not involved in individual project delivery.

---

## 3. Project Lifecycle (End-to-End Flow)

1. **Intake** — Client creates a project: describes idea in free text, optionally uploads a PDF spec or Figma link.
2. **AI Analysis** — AI generates: requirements doc, user stories, suggested tech stack, architecture outline, ER diagram draft, cost estimate, timeline, milestone breakdown, sprint plan, risk report.
3. **TM Review** — Technical Manager reviews AI output, edits/approves it, assigns developers (AI suggests matches based on skills/availability; TM confirms).
4. **Client Approval** — Client reviews requirements, cost, and timeline; approves or requests changes (loop back to step 2 with feedback).
5. **Execution** — Developers work sprints via Kanban board; log time; submit deliverables and PRs.
6. **Continuous AI Monitoring** — AI reviews code on PR submission, updates project health score, flags delay risk, summarizes standups/meetings.
7. **Milestone Approval** — TM approves deliverable quality; Client approves milestone and releases payment.
8. **Reporting** — AI generates recurring status reports for Client and TM; Admin sees aggregate platform analytics.

---

## 4. Functional Requirements by Role

### 4.1 Client
| # | Requirement | Priority |
|---|---|---|
| C1 | Create project via guided form (idea description, optional PDF/Figma upload) | Must |
| C2 | Trigger AI generation: requirements, user stories, tech stack, architecture, ERD, cost estimate, timeline, milestones, sprint plan, risk report, documentation | Must |
| C3 | View/edit AI-generated requirements before approval | Must |
| C4 | Dashboard: project status, progress %, health score, upcoming milestones | Must |
| C5 | View assigned team (Developers, TM) with roles and availability | Must |
| C6 | Approve or reject milestones with comments | Must |
| C7 | View and pay invoices; view payment history | Must |
| C8 | Messaging with TM/Developers (per-project channel) | Must |
| C9 | Real-time notifications (milestone updates, messages, risk alerts) | Must |
| C10 | AI Chat Assistant — ask questions about project status, cost, timeline in natural language | Should |
| C11 | Multi-project portfolio view | Should |

### 4.2 Developer
| # | Requirement | Priority |
|---|---|---|
| D1 | Public profile: skills, portfolio links, GitHub/LinkedIn, availability calendar | Must |
| D2 | Kanban task board per assigned project (To Do / In Progress / Review / Done) | Must |
| D3 | Daily progress log (short structured update, optional AI summarization) | Should |
| D4 | Upload deliverables (files, PR links) tied to tasks/milestones | Must |
| D5 | Time tracking per task (manual entry + optional timer) | Must |
| D6 | View AI code review results on own PRs | Must |
| D7 | Messaging with TM and Client (project channel) | Must |
| D8 | Notifications (new task, review feedback, deadline reminders) | Must |

### 4.3 Technical Manager
| # | Requirement | Priority |
|---|---|---|
| T1 | Cross-project overview dashboard | Must |
| T2 | Review/edit AI-generated plans before Client sees them | Must |
| T3 | Assign developers to tasks (AI suggests ranked matches; TM confirms/overrides) | Must |
| T4 | Approve/reject developer deliverables | Must |
| T5 | Review AI suggestions (risk, timeline, budget) and accept/override with reasoning | Must |
| T6 | Monitor deadlines across all owned projects; escalation alerts | Must |
| T7 | Generate/export status reports (PDF/shareable link) | Should |
| T8 | Review pull requests alongside AI review output | Must |

### 4.4 Admin
| # | Requirement | Priority |
|---|---|---|
| A1 | Platform analytics: active projects, MRR, churn, AI usage/cost | Must |
| A2 | User management (Clients, Developers, TMs) — suspend, verify, edit roles | Must |
| A3 | Project oversight (list/search/filter all projects, drill into any) | Must |
| A4 | Subscription plan management (tiers, limits, upgrades/downgrades) | Must |
| A5 | Payments/payouts oversight, dispute handling | Must |
| A6 | Support ticket queue | Should |
| A7 | Platform settings (feature flags, AI provider config, rate limits) | Should |

---

## 5. AI Feature Specifications

| Feature | Input | Output | Notes |
|---|---|---|---|
| Project Analyzer | Free-text idea, optional PDF/Figma | Structured summary of intent, domain, complexity tier | First step of intake |
| Requirement Generator | Analyzer output | Functional + non-functional requirements doc | Editable by TM/Client |
| User Story Generator | Requirements | User stories in "As a... I want... so that..." format, grouped by epic | Feeds sprint planner |
| Architecture Generator | Requirements + tech constraints | Recommended architecture (components, data flow) | TM can override stack choices |
| ER Diagram Generator | Requirements | Draft entity-relationship model (Mermaid syntax) | Human DB designer refines |
| Sprint Planner | User stories + team velocity assumptions | Sprint-by-sprint backlog with estimated points | Recalculates on scope change |
| Developer Matching | Task skill requirements + developer profiles | Ranked candidate list with match rationale | TM has final say |
| Risk Prediction | Project history, task velocity, deadline proximity | Risk score + narrative flags (e.g., "scope creep likely") | Recalculated weekly |
| Timeline Prediction | Sprint plan + actual velocity | Predicted completion date range | Updates as sprints close |
| Budget Estimation | Requirements complexity + team rates | Cost range (not a single fixed number) | Disclosed as estimate, not quote |
| Meeting Summarizer | Uploaded transcript/notes | Structured summary + action items | Optional feature |
| Documentation Generator | Codebase + requirements | README/API docs draft | Runs post-milestone |
| AI Code Review | PR diff | Inline comments, quality score, security flags | Advisory, not blocking by default |
| Project Health Score | Velocity, risk score, deliverable approval rate | 0–100 composite score shown on dashboards | Recalculated daily |
| AI Chat Assistant | Client/TM natural-language query + project context | Grounded answer referencing live project data | Gemini function-calling over project DB |

**Guardrail:** All AI-generated estimates (cost, timeline, risk) are explicitly labeled as estimates/predictions in the UI, never presented as guarantees. This avoids client harm from over-trusting AI output and sets correct expectations contractually.

---

## 6. Non-Functional Requirements

- **Scale target:** architecture must support 1M+ registered users, designed for horizontal scaling (stateless API layer, Redis cache, read replicas where needed).
- **Availability:** 99.9% uptime target for core API.
- **Security:** JWT + refresh tokens, role-based authorization at API and UI level, input validation on all endpoints, rate limiting, HTTPS-only, CSRF/XSS protections.
- **Real-time:** SignalR for notifications, live task/project updates, and chat — sub-2-second delivery target.
- **Data residency:** documents/files in Azure Blob Storage with access-controlled SAS URLs.
- **Auditability:** every AI-generated output and every human override is logged (who approved/rejected what, when) for dispute resolution.
- **Internationalization-ready:** UI text externalized even if only English ships in v1.
- **Accessibility:** WCAG 2.1 AA target for core flows.

---

## 7. Out of Scope for v1 (explicitly deferred)

- Native mobile apps (responsive web only in v1)
- In-app video calls (Zoom/Meet links only)
- Automated developer payouts across multiple currencies/tax jurisdictions (manual/Stripe Connect basic flow only)
- Marketplace-style public bidding on projects (DevPilot assigns, not an open bid board)
- Fully autonomous AI code-writing (AI reviews and plans; it does not commit code in v1)

---

## 8. Success Metrics (v1)

- Time from idea submission to Client-approved project plan: target < 24 hours
- % of AI-generated requirements accepted by TM without major edits: target > 60%
- Risk prediction precision (flagged-as-at-risk projects that actually slip): target > 70%
- Client-reported trust/clarity score (in-app survey): target > 4/5
- Milestone approval cycle time: target < 48 hours from submission

---

## 9. Next Steps (Delivery Plan)

| Step | Deliverable |
|---|---|
| 1 | ✅ Product Requirements Document (this document) |
| 2 | Software Architecture (system diagram, service boundaries, Clean Architecture layout) |
| 3 | Database Design (SQL Server schema, ERD, indexes, constraints) |
| 4 | Backend APIs (ASP.NET Core 9, CQRS/MediatR, endpoints, Swagger) |
| 5 | Frontend UI (Next.js 15 / React 19, core screens) |
| 6 | Admin Dashboard |
| 7 | AI Services (Gemini integration layer, prompt design, function calling) |
| 8 | Deployment (Docker, Compose, GitHub Actions, Nginx) |