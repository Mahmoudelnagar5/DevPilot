import { createContext, useContext, useState, type ReactNode } from "react";
import { projects as seedProjects, CURRENT_USER, type Role, type Project } from "./data/mock";

export interface NewProjectInput {
  name: string;
  description: string;
}

export interface LedgerEntry {
  id: string;
  projectId: string;
  category: "ai-proposal" | "human-edit" | "approval" | "scope-change" | "milestone";
  title: string;
  detail: string;
  actor: string;
  actorRole: "AI" | "Client" | "Technical Manager" | "Developer";
  timestamp: string;
  signature: string;
  status: "recorded" | "pending" | "approved" | "rejected";
}

const seedLedger: LedgerEntry[] = [
  {
    id: "led-4", projectId: "p-ledgerloop", category: "milestone", title: "Ledger Engine milestone approved",
    detail: "Deliverables accepted and $22,000 payment release authorized.", actor: "Nadia Farouk", actorRole: "Client",
    timestamp: "2026-07-05T09:40:00Z", signature: "SIG-NF-7A21", status: "approved",
  },
  {
    id: "led-3", projectId: "p-ledgerloop", category: "human-edit", title: "Plaid edge cases added to scope",
    detail: "Lina added pending-to-posted reconciliation handling after reviewing the AI draft.", actor: "Lina Haddad", actorRole: "Technical Manager",
    timestamp: "2026-05-02T14:18:00Z", signature: "SIG-LH-91CD", status: "recorded",
  },
  {
    id: "led-2", projectId: "p-ledgerloop", category: "approval", title: "Project plan approved",
    detail: "Nadia approved the reviewed 18-week plan and its $68k-$94k estimate range.", actor: "Nadia Farouk", actorRole: "Client",
    timestamp: "2026-05-03T10:06:00Z", signature: "SIG-NF-4D82", status: "approved",
  },
  {
    id: "led-1", projectId: "p-ledgerloop", category: "ai-proposal", title: "Initial delivery plan proposed",
    detail: "Gemini generated requirements, architecture, five sprints, and a confidence-scored estimate.", actor: "DevPilot AI", actorRole: "AI",
    timestamp: "2026-05-01T08:30:00Z", signature: "AI-HASH-22F8", status: "recorded",
  },
];

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  page: string;
  setPage: (p: string) => void;
  projectId: string;
  openProject: (id: string) => void;
  // live project data (shared across all roles)
  projects: Project[];
  getProject: (id: string) => Project | undefined;
  addProject: (input: NewProjectInput) => Project;
  updateProjectStatus: (id: string, status: Project["status"]) => void;
  ledger: LedgerEntry[];
  addLedgerEntry: (entry: Omit<LedgerEntry, "id" | "timestamp" | "signature" | "actor" | "actorRole">) => void;
  decideLedgerEntry: (id: string, decision: "approved" | "rejected") => void;
}

const Ctx = createContext<AppState | null>(null);

// Default landing page per role.
export const DEFAULT_PAGE: Record<Role, string> = {
  client: "dashboard",
  developer: "board",
  tm: "overview",
  admin: "analytics",
};

// Builds a full Project object from the client's short intake, filling in the
// AI-drafted defaults so the new project renders everywhere immediately.
function createProjectFromInput(input: NewProjectInput): Project {
  const id = "p-" + input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString().slice(-4);
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 12 * 7);
  return {
    id,
    name: input.name,
    client: "u-nadia",
    domain: "New submission",
    description: input.description,
    complexity: "Medium",
    status: "tm-review", // waiting on the Technical Manager
    health: 70,
    progress: 0,
    riskScore: 30,
    riskFlags: ["Scope to be confirmed"],
    budgetLow: 38000,
    budgetHigh: 62000,
    spent: 0,
    timelineWeeks: 12,
    predictedStart: start.toISOString().slice(0, 10),
    predictedEnd: end.toISOString().slice(0, 10),
    team: ["u-lina"],
    cover: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=400&fit=crop&auto=format",
    milestones: [
      { id: "m1", name: "Discovery & Foundations", due: end.toISOString().slice(0, 10), amount: 14000, status: "upcoming", progress: 0 },
      { id: "m2", name: "Core Build", due: end.toISOString().slice(0, 10), amount: 26000, status: "upcoming", progress: 0 },
      { id: "m3", name: "Launch & Hardening", due: end.toISOString().slice(0, 10), amount: 18000, status: "upcoming", progress: 0 },
    ],
    invoices: [],
    tasks: [],
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("client");
  const [page, setPage] = useState<string>(DEFAULT_PAGE.client);
  const [projectId, setProjectId] = useState<string>("p-ledgerloop");
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [ledger, setLedger] = useState<LedgerEntry[]>(seedLedger);

  const setRole = (r: Role) => {
    setRoleState(r);
    setPage(DEFAULT_PAGE[r]);
  };

  const openProject = (id: string) => {
    setProjectId(id);
    setPage("project");
  };

  const getProject = (id: string) => projects.find((p) => p.id === id);

  const addProject = (input: NewProjectInput) => {
    const project = createProjectFromInput(input);
    setProjects((prev) => [project, ...prev]);
    return project;
  };

  const updateProjectStatus = (id: string, status: Project["status"]) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    const project = projects.find((p) => p.id === id);
    const messages: Partial<Record<Project["status"], string>> = {
      "tm-review": "Plan returned for Technical Manager review",
      "client-approval": "Plan released for client approval",
      "in-progress": "Project plan approved and execution started",
    };
    if (messages[status]) {
      addLedgerEntry({ projectId: id, category: "approval", title: messages[status]!, detail: `${project?.name ?? "Project"} moved to ${status.replace(/-/g, " ")}.`, status: status === "in-progress" ? "approved" : "recorded" });
    }
  };

  const actorRole = role === "client" ? "Client" : role === "tm" ? "Technical Manager" : role === "developer" ? "Developer" : "Technical Manager";
  const addLedgerEntry: AppState["addLedgerEntry"] = (entry) => {
    const now = new Date();
    setLedger((prev) => [{
      ...entry,
      id: `led-${now.getTime()}`,
      timestamp: now.toISOString(),
      actor: CURRENT_USER[role].name,
      actorRole,
      signature: `SIG-${CURRENT_USER[role].name.split(" ").map((part) => part[0]).join("")}-${now.getTime().toString(16).slice(-4).toUpperCase()}`,
    }, ...prev]);
  };

  const decideLedgerEntry: AppState["decideLedgerEntry"] = (id, decision) => {
    setLedger((prev) => prev.map((entry) => entry.id === id ? { ...entry, status: decision } : entry));
    const original = ledger.find((entry) => entry.id === id);
    if (original) addLedgerEntry({ projectId: original.projectId, category: "approval", title: `Scope change ${decision}`, detail: `${original.title} was ${decision} after reviewing the predicted impact.`, status: decision });
  };

  return (
    <Ctx.Provider
      value={{
        role, setRole, page, setPage, projectId, openProject,
        projects, getProject, addProject, updateProjectStatus, ledger, addLedgerEntry, decideLedgerEntry,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}
