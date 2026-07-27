-- ============================================================
-- DevPilot: Projects Table (idempotent safe version)
-- ============================================================
-- Run in: https://supabase.com/dashboard/project/chxqtomltraqbtqpwglk/sql/new

-- Step 1: Drop the old table if it exists (safe because it's new/empty)
drop table if exists public.projects cascade;

-- Step 2: Create the projects table fresh
create table public.projects (
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

-- Step 3: Enable Row Level Security
alter table public.projects enable row level security;

-- Step 4: RLS Policies (direct — no dynamic SQL needed)

-- Owners can read their own projects
create policy "projects: owner read"
  on public.projects for select
  using (auth.uid() = owner_id);

-- Owners can insert their own projects
create policy "projects: owner insert"
  on public.projects for insert
  with check (auth.uid() = owner_id);

-- Owners can update their own projects
create policy "projects: owner update"
  on public.projects for update
  using (auth.uid() = owner_id);

-- TMs and Admins can read all projects
create policy "projects: tm/admin read all"
  on public.projects for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('tm', 'admin')
    )
  );

-- TMs and Admins can update all projects
create policy "projects: tm/admin update all"
  on public.projects for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('tm', 'admin')
    )
  );

-- Step 5: Auto-update updated_at trigger
drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

-- Step 6: Performance indexes
create index if not exists projects_owner_id_idx on public.projects(owner_id);
create index if not exists projects_status_idx   on public.projects(status);

select 'projects table created successfully' as result;
