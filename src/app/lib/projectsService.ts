/**
 * projectsService.ts
 * Supabase CRUD layer for the `projects` table.
 * All operations gracefully return null/empty on auth failure so the app
 * can fall back to in-memory state.
 */
import { supabase } from "./supabase";
import type { Project } from "../data/mock";

// ---------------------------------------------------------------------------
// Shape that goes INTO Supabase (snake_case columns)
// ---------------------------------------------------------------------------
function toRow(p: Project, ownerId: string): Record<string, unknown> {
  return {
    id:              p.id,
    owner_id:        ownerId,
    name:            p.name,
    description:     p.description ?? "",
    domain:          p.domain ?? "",
    complexity:      p.complexity ?? "Medium",
    status:          p.status,
    health:          p.health,
    progress:        p.progress,
    risk_score:      p.riskScore,
    risk_flags:      p.riskFlags,
    budget_low:      p.budgetLow,
    budget_high:     p.budgetHigh,
    spent:           p.spent,
    timeline_weeks:  p.timelineWeeks,
    predicted_start: p.predictedStart ?? null,
    predicted_end:   p.predictedEnd ?? null,
    team:            p.team,
    cover:           p.cover ?? null,
    milestones:      p.milestones,
    invoices:        p.invoices,
    tasks:           p.tasks,
    ai_plan:         p.aiPlan ?? null,
    ai_plan_status:  p.aiPlanStatus ?? "generating",
  };
}

// ---------------------------------------------------------------------------
// Shape that comes OUT of Supabase (snake_case → camelCase)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: Record<string, any>): Project {
  return {
    id:             row.id,
    name:           row.name,
    client:         row.owner_id,        // map owner_id → client field
    domain:         row.domain ?? "",
    description:    row.description ?? "",
    complexity:     row.complexity ?? "Medium",
    status:         row.status,
    health:         row.health,
    progress:       row.progress,
    riskScore:      row.risk_score,
    riskFlags:      row.risk_flags ?? [],
    budgetLow:      row.budget_low,
    budgetHigh:     row.budget_high,
    spent:          row.spent,
    timelineWeeks:  row.timeline_weeks,
    predictedStart: row.predicted_start ?? "",
    predictedEnd:   row.predicted_end ?? "",
    team:           row.team ?? [],
    cover:          row.cover ?? "",
    milestones:     row.milestones ?? [],
    invoices:       row.invoices ?? [],
    tasks:          row.tasks ?? [],
    aiPlan:         row.ai_plan ?? undefined,
    aiPlanStatus:   row.ai_plan_status ?? "generating",
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Fetch all projects the current user can see (owner + TM/admin via RLS) */
export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[projectsService] fetchProjects error:", error.message);
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => fromRow(r));
}

/** Insert a new project row — owner_id is pulled from the current session */
export async function insertProject(project: Project): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData?.session?.user?.id;
  if (!uid) {
    console.warn("[projectsService] insertProject: no authenticated user");
    return false;
  }

  const { error } = await supabase
    .from("projects")
    .insert(toRow(project, uid));

  if (error) {
    console.warn("[projectsService] insertProject error:", error.message);
    return false;
  }
  return true;
}

/** Upsert (update-or-insert) a full project row */
export async function upsertProject(project: Project): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData?.session?.user?.id;
  if (!uid) return false;

  const { error } = await supabase
    .from("projects")
    .upsert(toRow(project, uid), { onConflict: "id" });

  if (error) {
    console.warn("[projectsService] upsertProject error:", error.message);
    return false;
  }
  return true;
}

/** Patch a subset of columns on an existing project */
export async function patchProject(
  id: string,
  patch: Partial<Project>,
): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData?.session?.user?.id;
  if (!uid) return false;

  // Build a minimal row patch (only changed snake_case fields)
  const rowPatch: Record<string, unknown> = {};
  if (patch.status       !== undefined) rowPatch.status        = patch.status;
  if (patch.health       !== undefined) rowPatch.health        = patch.health;
  if (patch.progress     !== undefined) rowPatch.progress      = patch.progress;
  if (patch.riskScore    !== undefined) rowPatch.risk_score    = patch.riskScore;
  if (patch.riskFlags    !== undefined) rowPatch.risk_flags    = patch.riskFlags;
  if (patch.budgetLow    !== undefined) rowPatch.budget_low    = patch.budgetLow;
  if (patch.budgetHigh   !== undefined) rowPatch.budget_high   = patch.budgetHigh;
  if (patch.spent        !== undefined) rowPatch.spent         = patch.spent;
  if (patch.timelineWeeks !== undefined) rowPatch.timeline_weeks = patch.timelineWeeks;
  if (patch.predictedEnd !== undefined) rowPatch.predicted_end = patch.predictedEnd;
  if (patch.milestones   !== undefined) rowPatch.milestones    = patch.milestones;
  if (patch.invoices     !== undefined) rowPatch.invoices      = patch.invoices;
  if (patch.tasks        !== undefined) rowPatch.tasks         = patch.tasks;
  if (patch.aiPlan       !== undefined) rowPatch.ai_plan       = patch.aiPlan;
  if (patch.aiPlanStatus !== undefined) rowPatch.ai_plan_status = patch.aiPlanStatus;

  const { error } = await supabase
    .from("projects")
    .update(rowPatch)
    .eq("id", id);

  if (error) {
    console.warn("[projectsService] patchProject error:", error.message);
    return false;
  }
  return true;
}
