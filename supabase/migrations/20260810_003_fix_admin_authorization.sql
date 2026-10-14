-- ============================================================
-- MIGRATION 20260810_003_fix_admin_authorization.sql
-- NSN969 MULTIVIEW - Supabase Schema Migration: Admin Authorization Fix
-- IDEMPOTENT & SAFE: Safe to run on existing database without losing data
-- NO DROP TABLE / NO TRUNCATE / NO DATA LOSS
-- ============================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure public.user_profiles schema and columns
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist idempotently
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Safely update constraint on role to include super_admin and streamer
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_role_check 
  CHECK (role IN ('super_admin', 'admin', 'moderator', 'member', 'streamer'));

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- 3. Ensure system_settings has website_settings column
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS website_settings JSONB DEFAULT '{}'::jsonb;

-- 4. Ensure activity_logs table exists
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'Admin',
  status TEXT NOT NULL DEFAULT 'info',
  details TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Hardened, Non-recursive, Security-Definer public.is_admin() function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
  v_uid uuid;
  v_email text;
  v_role text;
BEGIN
  -- 1. Check if auth context exists
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  -- 2. Extract verified email from JWT token (case-insensitive)
  v_email := lower(COALESCE(auth.jwt() ->> 'email', ''));

  -- 3. Check trusted primary owner / admin emails (cryptographically verified in JWT)
  IF v_email IN (
    'admin@nsn969.com',
    'muhammadcandra1140@gmail.com',
    'muhammadcandra1957@gmail.com'
  ) THEN
    RETURN true;
  END IF;

  -- 4. Check server-assigned JWT app_metadata claim (cannot be forged by client)
  IF lower(COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '')) IN ('admin', 'super_admin') THEN
    RETURN true;
  END IF;

  -- 5. Query public.user_profiles table by authenticated user id
  SELECT lower(role) INTO v_role
  FROM public.user_profiles
  WHERE id = v_uid::text
  LIMIT 1;

  IF v_role IN ('admin', 'super_admin') THEN
    RETURN true;
  END IF;

  -- 6. Check legacy admins table if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'admins'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = v_uid::text OR lower(email) = v_email
    ) THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- 6. Configure Safe Non-Recursive Row Level Security (RLS) Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public user profiles read" ON public.user_profiles;
CREATE POLICY "Public user profiles read" ON public.user_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

DROP POLICY IF EXISTS "Admins full management on user_profiles" ON public.user_profiles;
CREATE POLICY "Admins full management on user_profiles" ON public.user_profiles
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read activity_logs" ON public.activity_logs;
CREATE POLICY "Public read activity_logs" ON public.activity_logs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage activity_logs" ON public.activity_logs;
CREATE POLICY "Admin manage activity_logs" ON public.activity_logs
  FOR ALL USING (public.is_admin());

-- 7. Trigger on auth.users for automatic profile synchronisation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, avatar_url, photo_url, role)
  VALUES (
    new.id::text,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'photo_url', ''),
    CASE 
      WHEN lower(COALESCE(new.email, '')) IN ('admin@nsn969.com', 'muhammadcandra1140@gmail.com', 'muhammadcandra1957@gmail.com') THEN 'super_admin'
      ELSE 'member'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = CASE 
      WHEN lower(COALESCE(EXCLUDED.email, '')) IN ('admin@nsn969.com', 'muhammadcandra1140@gmail.com', 'muhammadcandra1957@gmail.com') THEN 'super_admin'
      ELSE public.user_profiles.role
    END,
    updated_at = NOW();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Backfill existing auth.users into public.user_profiles
INSERT INTO public.user_profiles (id, email, display_name, avatar_url, photo_url, role)
SELECT 
  u.id::text,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'avatar_url', ''),
  COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'photo_url', ''),
  CASE 
    WHEN lower(COALESCE(u.email, '')) IN ('admin@nsn969.com', 'muhammadcandra1140@gmail.com', 'muhammadcandra1957@gmail.com') THEN 'super_admin'
    ELSE 'member'
  END
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = CASE 
    WHEN lower(COALESCE(EXCLUDED.email, '')) IN ('admin@nsn969.com', 'muhammadcandra1140@gmail.com', 'muhammadcandra1957@gmail.com') THEN 'super_admin'
    ELSE public.user_profiles.role
  END,
  updated_at = NOW();

-- 9. Secure bootstrap procedure for project owner
CREATE OR REPLACE FUNCTION public.bootstrap_admin(target_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user record;
  v_count integer := 0;
BEGIN
  IF target_email IS NULL OR trim(target_email) = '' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Email cannot be empty.');
  END IF;

  FOR v_user IN 
    SELECT id, email FROM auth.users WHERE lower(email) = lower(trim(target_email))
  LOOP
    INSERT INTO public.user_profiles (id, email, display_name, role)
    VALUES (
      v_user.id::text,
      v_user.email,
      split_part(v_user.email, '@', 1),
      'super_admin'
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'super_admin',
      updated_at = NOW();

    -- Also persist role inside server-trusted app_metadata
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "super_admin"}'::jsonb
    WHERE id = v_user.id;

    v_count := v_count + 1;
  END LOOP;

  IF v_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', format('User dengan email "%s" belum ditemukan di auth.users. Daftarkan akun terlebih dahulu di Supabase Auth.', target_email)
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'message', format('Berhasil memberikan hak akses super_admin ke akun "%s".', target_email)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_admin(text) TO service_role, postgres;
