import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { CURRENT_USER, type Role, type Project } from "./data/mock";
import { generateProjectPlan } from "./lib/groq";
import { fetchProjects, insertProject, patchProject } from "./lib/projectsService";
import { supabase } from "./lib/supabase";

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
  const [projectId,       setProjectId]     = useState<string>("");
  const [projects,        setProjects]      = useState<Project[]>([]);  // ← ابدأ بقائمة فارغة
  const [ledger,          setLedger]        = useState<LedgerEntry[]>([]);
  const [projectsLoading, setProjectsLoading] = useState<boolean>(true);  // ← ابدأ بـ true

  // ✅ لا نحتاج localStorage persistence - Supabase هو المصدر الوحيد
  // Remove localStorage sync completely - we rely on Supabase only

  // -------------------------------------------------------------------------
  // ✅ Load projects from Supabase on mount and auth changes
  // This ensures users always see their saved projects after login
  // -------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setProjectsLoading(true);
      const rows = await fetchProjects();
      if (!cancelled) {
        // ✅ Use ONLY Supabase data - single source of truth
        setProjects(rows);
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
