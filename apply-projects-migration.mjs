/**
 * apply-projects-migration.mjs
 * Run ONCE with: node apply-projects-migration.mjs
 * Applies the projects table migration to Supabase.
 *
 * IMPORTANT: Add these to your .env file:
 * SUPABASE_PROJECT_REF=your_project_ref
 * SUPABASE_SERVICE_KEY=your_service_key
 */

import { config } from 'dotenv';
config();

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!PROJECT_REF || !SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_PROJECT_REF and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

const PROJECT_URL = `https://${PROJECT_REF}.supabase.co`;

const SQL = `
-- ============================================================
-- DevPilot: Projects Table
-- ============================================================
create table if not exists public.projects (
  id                text        primary key,
  owner_id          uuid        not null references auth.users(id) on delete cascade,
  name              text        not null,
  description       text,
  domain            text,
  complexity        text,
  status            text        not null default 'tm-review'
                      check (status in ('tm-review','client-approval','in-progress','completed','paused')),
  health            int         not null default 70,
  progress          int         not null default 0,
  risk_score        int         not null default 30,
  risk_flags        jsonb       not null default '[]',
  budget_low        int         not null default 0,
  budget_high       int         not null default 0,
  spent             int         not null default 0,
  timeline_weeks    int         not null default 12,
  predicted_start   date,
  predicted_end     date,
  team              jsonb       not null default '[]',
  cover             text,
  milestones        jsonb       not null default '[]',
  invoices          jsonb       not null default '[]',
  tasks             jsonb       not null default '[]',
  ai_plan           jsonb,
  ai_plan_status    text        not null default 'generating'
                      check (ai_plan_status in ('generating','ready','error')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.projects enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='projects' and policyname='projects: owner read') then
    execute 'create policy "projects: owner read" on public.projects for select using (auth.uid() = owner_id)';
  end if;
  if not exists (select 1 from pg_policies where tablename='projects' and policyname='projects: owner insert') then
    execute 'create policy "projects: owner insert" on public.projects for insert with check (auth.uid() = owner_id)';
  end if;
  if not exists (select 1 from pg_policies where tablename='projects' and policyname='projects: owner update') then
    execute 'create policy "projects: owner update" on public.projects for update using (auth.uid() = owner_id)';
  end if;
  if not exists (select 1 from pg_policies where tablename='projects' and policyname='projects: tm/admin read all') then
    execute 'create policy "projects: tm/admin read all" on public.projects for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in (''tm'', ''admin'')))';
  end if;
  if not exists (select 1 from pg_policies where tablename='projects' and policyname='projects: tm/admin update all') then
    execute 'create policy "projects: tm/admin update all" on public.projects for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in (''tm'', ''admin'')))';
  end if;
end $$;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

create index if not exists projects_owner_id_idx on public.projects(owner_id);
create index if not exists projects_status_idx on public.projects(status);

select 'projects table migration complete' as result;
`;

async function applyMigration() {
  console.log("🚀 Applying DevPilot projects table migration...\n");

  const sqlResponse = await fetch(`${PROJECT_URL}/pg/query`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: SQL }),
  });

  const body = await sqlResponse.text();
  console.log(`📊 SQL Response (${sqlResponse.status}):\n${body}`);

  if (sqlResponse.ok) {
    console.log("\n✅ Projects table migration applied successfully!");
  } else {
    console.log("\n⚠️  Direct SQL endpoint not available.");
    console.log("\n📋 MANUAL STEP REQUIRED:");
    console.log("   1. Go to: https://supabase.com/dashboard/project/chxqtomltraqbtqpwglk/sql/new");
    console.log("   2. Paste the SQL from: supabase/migrations/20260728_projects.sql");
    console.log("   3. Click Run ▶");
    console.log("\nThe app will still work — it falls back to in-memory data when Supabase is unavailable.");
  }
}

applyMigration().catch(console.error);
