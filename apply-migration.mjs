/**
 * apply-migration.mjs
 * Run this ONCE with: node apply-migration.mjs
 * Applies the DevPilot profiles table migration using the Supabase service-role key.
 *
 * WARNING: Never commit the service-role key to git.
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
-- 1. Profiles table
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

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. RLS Policies
do $$ begin
  -- read own
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles: read own') then
    execute 'create policy "profiles: read own" on public.profiles for select using (auth.uid() = id)';
  end if;
  -- update own
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles: update own') then
    execute 'create policy "profiles: update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id)';
  end if;
  -- admin read all
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles: admin read all') then
    execute 'create policy "profiles: admin read all" on public.profiles for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = ''admin''))';
  end if;
  -- admin update all
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles: admin update all') then
    execute 'create policy "profiles: admin update all" on public.profiles for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = ''admin''))';
  end if;
end $$;

-- 4. Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
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

-- 5. Trigger: auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

select 'Migration applied successfully' as result;
`;

async function applyMigration() {
  console.log("🚀 Applying DevPilot profiles migration to Supabase...\n");

  const response = await fetch(`${PROJECT_URL}/rest/v1/`, {
    method: "GET",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });
  console.log(`📡 Project reachable: ${response.status === 200 ? "✅ Yes" : "⚠️  Status " + response.status}`);

  // Use the pg endpoint for raw SQL execution
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
  console.log(`\n📊 SQL Response (${sqlResponse.status}):\n${body}`);

  if (sqlResponse.ok) {
    console.log("\n✅ Migration applied successfully!");
  } else {
    console.log("\n⚠️  Direct SQL endpoint not available (expected for anon key).");
    console.log("\n📋 MANUAL STEP REQUIRED:");
    console.log("   1. Go to: https://supabase.com/dashboard/project/chxqtomltraqbtqpwglk/sql/new");
    console.log("   2. Paste the SQL from: supabase/migrations/20260727_profiles.sql");
    console.log("   3. Click Run ▶");
  }
}

applyMigration().catch(console.error);
