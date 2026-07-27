-- ===============================================
-- إصلاح جدول profiles وسياسات الأمان
-- DevPilot - Fixed Version (No Infinite Recursion)
-- ===============================================

-- ============================================================
-- Step 1: Helper Functions
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- Step 2: Profiles Table
-- ============================================================

DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'client'
              CHECK (role IN ('client', 'developer', 'tm', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Step 3: Profiles RLS Policies (FIXED - No Recursion!)
-- ============================================================

-- ✅ Everyone can read their own profile (simple, no recursion)
CREATE POLICY "profiles: read own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- ✅ Everyone can update their own profile (but not change role)
CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- ✅ Allow insert for new users (via trigger only)
CREATE POLICY "profiles: insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- Step 4: Auto-create Profile on Sign-up
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Step 5: Auto-update updated_at
-- ============================================================

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Step 6: Projects Table
-- ============================================================

DROP TABLE IF EXISTS public.projects CASCADE;

CREATE TABLE public.projects (
  id                TEXT        PRIMARY KEY,
  owner_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT        NOT NULL,
  description       TEXT,
  domain            TEXT,
  complexity        TEXT,
  status            TEXT        NOT NULL DEFAULT 'tm-review'
                    CHECK (status IN ('tm-review','client-approval','in-progress','completed','paused')),
  health            INT         NOT NULL DEFAULT 70,
  progress          INT         NOT NULL DEFAULT 0,
  risk_score        INT         NOT NULL DEFAULT 30,
  risk_flags        JSONB       NOT NULL DEFAULT '[]',
  budget_low        INT         NOT NULL DEFAULT 0,
  budget_high       INT         NOT NULL DEFAULT 0,
  spent             INT         NOT NULL DEFAULT 0,
  timeline_weeks    INT         NOT NULL DEFAULT 12,
  predicted_start   DATE,
  predicted_end     DATE,
  team              JSONB       NOT NULL DEFAULT '[]',
  cover             TEXT,
  milestones        JSONB       NOT NULL DEFAULT '[]',
  invoices          JSONB       NOT NULL DEFAULT '[]',
  tasks             JSONB       NOT NULL DEFAULT '[]',
  ai_plan           JSONB,
  ai_plan_status    TEXT        NOT NULL DEFAULT 'generating'
                    CHECK (ai_plan_status IN ('generating','ready','error')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Step 7: Projects RLS Policies (FIXED - No Recursion!)
-- ============================================================

-- ✅ Owners can read their own projects
CREATE POLICY "projects: owner read"
  ON public.projects FOR SELECT
  USING (auth.uid() = owner_id);

-- ✅ Owners can insert their own projects
CREATE POLICY "projects: owner insert"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- ✅ Owners can update their own projects
CREATE POLICY "projects: owner update"
  ON public.projects FOR UPDATE
  USING (auth.uid() = owner_id);

-- ============================================================
-- Step 8: Auto-update projects updated_at
-- ============================================================

DROP TRIGGER IF EXISTS projects_updated_at ON public.projects;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Step 9: Performance Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

CREATE INDEX IF NOT EXISTS projects_owner_id_idx ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects(status);

-- ============================================================
-- ✅ SUCCESS!
-- ============================================================

SELECT 'Database setup completed successfully! ✅' AS result;
