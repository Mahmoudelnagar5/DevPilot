import { createContext, useContext, useState, type ReactNode } from "react";
import { projects as seedProjects, type Role, type Project } from "./data/mock";

export interface NewProjectInput {
  name: string;
  description: string;
}

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
  };

  return (
    <Ctx.Provider
      value={{
        role, setRole, page, setPage, projectId, openProject,
        projects, getProject, addProject, updateProjectStatus,
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
