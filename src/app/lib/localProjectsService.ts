import type { Project } from "../data/mock";

const STORAGE_KEY = "devpilot_projects";

export function loadLocalProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

export function saveLocalProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn("[localProjectsService] save failed:", e);
  }
}

export function clearLocalProjects(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
