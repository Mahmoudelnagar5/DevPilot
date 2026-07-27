/**
 * apply-migration-mgmt.mjs
 * Uses the Supabase Management API to run raw SQL on the project.
 * Run: node apply-migration-mgmt.mjs
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

const SQL = `
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  role        text not null default 'client'
                check (role in ('client', 'developer', 'tm', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $do$ begin
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles: read own') then
    execute 'create policy "profiles: read own" on public.profiles for select using (auth.uid() = id)';
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles: update own') then
    execute 'create policy "profiles: update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id)';
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles: admin read all') then
    execute $$create policy "profiles: admin read all" on public.profiles for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))$$;
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles: admin update all') then
    execute $$create policy "profiles: admin update all" on public.profiles for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))$$;
  end if;
end $do$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
`;

async function run() {
  console.log("🚀 Applying migration via Supabase Management API...\n");

  // Try Management API v1 endpoint
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: SQL }),
  });

  const text = await res.text();
  console.log(`Status: ${res.status}`);
  console.log(`Response: ${text}`);

  if (res.ok) {
    console.log("\n✅ Migration applied!");
  } else {
    console.log("\n❌ Management API requires a personal access token.");
    console.log("   The service-role key only works for data operations (REST/GraphQL).");
    console.log("\n📋 Please apply the migration manually:");
    console.log(`   → https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
    console.log("   → Paste: supabase/migrations/20260727_profiles.sql");
  }
}

run().catch(console.error);
