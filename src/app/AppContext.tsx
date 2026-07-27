import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { projects as seedProjects, CURRENT_USER, type Role, type Project } from "./data/mock";
import { generateProjectPlan } from "./lib/groq";
import { fetchProjects, insertProject, patchProject } from "./lib/projectsService";
import { supabase } from "./lib/supabase";
import { loadLocalProjects, saveLocalProjects } from "./lib/localProjectsService";

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
  projects: Project[];
  getProject: (id: string) => Project | undefined;
  addProject: (input: NewProjectInput) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  updateProjectStatus: (id: string, status: Project["status"]) => void;
  ledger: LedgerEntry[];
  addLedgerEntry: (entry: Omit<LedgerEntry, "id" | "timestamp" | "signature" | "actor" | "actorRole">) => void;
  decideLedgerEntry: (id: string, decision: "approved" | "rejected") => void;
  /** true while the initial Supabase project load is in flight */
  projectsLoading: boolean;
}

const Ctx = createContext<AppState | null>(null);

export const DEFAULT_PAGE: Record<Role, string> = {
  client:    "dashboard",
  developer: "board",
  tm:        "overview",
  admin:     "analytics",
};

function createProjectFromInput(input: NewProjectInput): Project {
  const id = "p-" + input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString().slice(-4);
  const start = new Date();
  const end   = new Date();
  end.setDate(end.getDate() + 12 * 7);
  return {
    id,
    name:           input.name,
    client:         "u-nadia",
    domain:         "New submission",
    description:    input.description,
    complexity:     "Medium",
    status:         "tm-review",
    health:         70,
    progress:       0,
    riskScore:      30,
    riskFlags:      ["Scope to be confirmed"],
    budgetLow:      38000,
    budgetHigh:     62000,
    spent:          0,
    timelineWeeks:  12,
    predictedStart: start.toISOString().slice(0, 10),
    predictedEnd:   end.toISOString().slice(0, 10),
    team:           ["u-lina"],
    cover:          "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=400&fit=crop&auto=format",
    milestones: [
      { id: "m1", name: "Discovery & Foundations", due: end.toISOString().slice(0, 10), amount: 14000, status: "upcoming", progress: 0 },
      { id: "m2", name: "Core Build",              due: end.toISOString().slice(0, 10), amount: 26000, status: "upcoming", progress: 0 },
      { id: "m3", name: "Launch & Hardening",      due: end.toISOString().slice(0, 10), amount: 18000, status: "upcoming", progress: 0 },
    ],
    invoices:      [],
    tasks:         [],
    aiPlanStatus:  "generating",
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role,            setRoleState]     = useState<Role>("client");
  const [page,            setPage]          = useState<string>(DEFAULT_PAGE.client);
  const [projectId,       setProjectId]     = useState<string>("p-ledgerloop");
  const [projects,        setProjects]      = useState<Project[]>(() => {
    const local = loadLocalProjects();
    return local.length > 0 ? local : seedProjects;
  });
  const [ledger,          setLedger]        = useState<LedgerEntry[]>(seedLedger);
  const [projectsLoading, setProjectsLoading] = useState<boolean>(false);

  // Persist projects to localStorage whenever they change
  const isInitialRender = useRef(true);
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    saveLocalProjects(projects);
  }, [projects]);

  // -------------------------------------------------------------------------
  // On mount (and whenever the auth session changes): load projects from
  // Supabase. If the user is not logged in or the table doesn't exist yet,
  // we silently keep the local data.
  // -------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setProjectsLoading(true);
      const rows = await fetchProjects();
      if (!cancelled && rows.length > 0) {
        // Merge: remote projects take priority; keep local projects for any id not in remote
        setProjects((prev) => {
          const remoteIds = new Set(rows.map((r) => r.id));
          const localOnly = prev.filter((p) => !remoteIds.has(p.id));
          return [...rows, ...localOnly];
        });
      }
      if (!cancelled) setProjectsLoading(false);
    }

    load();

    // Re-run when auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (!cancelled) load();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const setRole = useCallback((r: Role) => {
    setRoleState((prevRole) => {
      if (prevRole !== r) setPage(DEFAULT_PAGE[r]);
      return r;
    });
  }, []);

  const openProject = (id: string) => {
    setProjectId(id);
    setPage("project");
  };

  const getProject = (id: string) => projects.find((p) => p.id === id);

  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    // Persist patch to Supabase asynchronously (fire-and-forget)
    patchProject(id, patch).catch(() => {/* silent — in-memory already updated */});
  }, []);

  const addProject = useCallback((input: NewProjectInput): Project => {
    const project = createProjectFromInput(input);
    setProjects((prev) => [project, ...prev]);
    setProjectId(project.id);
    setPage("project");

    // Persist the skeleton row immediately
    insertProject(project).catch(() => {/* silent fallback to in-memory */});

    // Fire real AI generation in the background
    generateProjectPlan(input.name, input.description)
      .then((aiPlan) => {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + aiPlan.timeline.weeks * 7);

        const aiPatch: Partial<Project> = {
          aiPlan,
          aiPlanStatus:   "ready",
          budgetLow:      aiPlan.budget.low,
          budgetHigh:     aiPlan.budget.high,
          timelineWeeks:  aiPlan.timeline.weeks,
          predictedEnd:   endDate.toISOString().slice(0, 10),
        };

        setProjects((prev) =>
          prev.map((p) =>
            p.id === project.id ? { ...p, ...aiPatch } : p,
          ),
        );

        // Persist AI plan back to Supabase
        patchProject(project.id, aiPatch).catch(() => {});
      })
      .catch(() => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === project.id ? { ...p, aiPlanStatus: "error" as const } : p,
          ),
        );
        patchProject(project.id, { aiPlanStatus: "error" }).catch(() => {});
      });

    return project;
  }, []);

  const updateProjectStatus = (id: string, status: Project["status"]) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    patchProject(id, { status }).catch(() => {});

    const project = projects.find((p) => p.id === id);
    const messages: Partial<Record<Project["status"], string>> = {
      "tm-review":       "Plan returned for Technical Manager review",
      "client-approval": "Plan released for client approval",
      "in-progress":     "Project plan approved and execution started",
    };
    if (messages[status]) {
      addLedgerEntry({
        projectId: id,
        category:  "approval",
        title:     messages[status]!,
        detail:    `${project?.name ?? "Project"} moved to ${status.replace(/-/g, " ")}.`,
        status:    status === "in-progress" ? "approved" : "recorded",
      });
    }
  };

  const actorRole = role === "client" ? "Client" : role === "tm" ? "Technical Manager" : role === "developer" ? "Developer" : "Technical Manager";

  const addLedgerEntry: AppState["addLedgerEntry"] = (entry) => {
    const now = new Date();
    setLedger((prev) => [{
      ...entry,
      id:        `led-${now.getTime()}`,
      timestamp: now.toISOString(),
      actor:     CURRENT_USER[role].name,
      actorRole,
      signature: `SIG-${CURRENT_USER[role].name.split(" ").map((part) => part[0]).join("")}-${now.getTime().toString(16).slice(-4).toUpperCase()}`,
    }, ...prev]);
  };

  const decideLedgerEntry: AppState["decideLedgerEntry"] = (id, decision) => {
    setLedger((prev) => prev.map((entry) => entry.id === id ? { ...entry, status: decision } : entry));
    const original = ledger.find((entry) => entry.id === id);
    if (original) {
      addLedgerEntry({
        projectId: original.projectId,
        category:  "approval",
        title:     `Scope change ${decision}`,
        detail:    `${original.title} was ${decision} after reviewing the predicted impact.`,
        status:    decision,
      });
    }
  };

  return (
    <Ctx.Provider
      value={{
        role, setRole, page, setPage, projectId, openProject,
        projects, getProject, addProject, updateProject, updateProjectStatus,
        ledger, addLedgerEntry, decideLedgerEntry,
        projectsLoading,
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
