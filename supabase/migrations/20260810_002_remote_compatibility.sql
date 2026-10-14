-- ============================================================
-- MIGRATION 20260810_002_remote_compatibility.sql
-- Compatibility & Schema Update for Existing Remote Supabase DB
-- IDEMPOTENT: Safe to run on existing database without losing data
-- NO DROP TABLE / NO DROP COLUMN / NO TRUNCATE / NO DELETE
-- ============================================================

-- ------------------------------------------------------------
-- 1. EXTEND EXISTING TABLES (SAFE ALTER TABLE ADD COLUMN)
-- ------------------------------------------------------------

-- Extend streamers table with required fields if not present
ALTER TABLE public.streamers ADD COLUMN IF NOT EXISTS platform text DEFAULT 'youtube';
ALTER TABLE public.streamers ADD COLUMN IF NOT EXISTS category text DEFAULT 'Streamer';
ALTER TABLE public.streamers ADD COLUMN IF NOT EXISTS tiktok_id text DEFAULT '';
ALTER TABLE public.streamers ADD COLUMN IF NOT EXISTS photo_url text DEFAULT '';
ALTER TABLE public.streamers ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT true;
ALTER TABLE public.streamers ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ------------------------------------------------------------
-- 2. CREATE MISSING TABLES IF NOT EXISTS
-- ------------------------------------------------------------

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id text PRIMARY KEY,
  email text,
  display_name text,
  photo_url text,
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- System settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id text PRIMARY KEY DEFAULT 'global',
  announcement_id text DEFAULT '',
  announcement_en text DEFAULT '',
  announcement_active boolean DEFAULT false,
  maintenance_mode boolean DEFAULT false,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Music / Backsound tracks
CREATE TABLE IF NOT EXISTS public.tracks (
  id text PRIMARY KEY,
  title text NOT NULL,
  artist text DEFAULT '',
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gallery items
CREATE TABLE IF NOT EXISTS public.gallery (
  id text PRIMARY KEY,
  title text DEFAULT '',
  tag text DEFAULT '',
  src text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- IC Characters
CREATE TABLE IF NOT EXISTS public.ic_characters (
  id text PRIMARY KEY,
  name text NOT NULL,
  player_name text DEFAULT '',
  avatar text DEFAULT '',
  role text DEFAULT 'Civilian',
  occupation text DEFAULT 'Unemployed',
  age integer DEFAULT 21,
  bio text DEFAULT '',
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Community categories
CREATE TABLE IF NOT EXISTS public.community_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  position integer DEFAULT 0,
  is_collapsed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Community channels
CREATE TABLE IF NOT EXISTS public.community_channels (
  id text PRIMARY KEY,
  category_id text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  type text DEFAULT 'text',
  position integer DEFAULT 0,
  admin_only boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Community messages
CREATE TABLE IF NOT EXISTS public.community_messages (
  id text PRIMARY KEY,
  channel_id text NOT NULL,
  user_id text NOT NULL,
  user_name text DEFAULT 'Member',
  user_avatar text DEFAULT '',
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ------------------------------------------------------------
-- 3. HELPER FUNCTIONS & NON-RECURSIVE ADMIN VERIFICATION
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
BEGIN
  -- 1. Check auth.uid() presence
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- 2. Trusted admin emails check via JWT (case-insensitive)
  IF lower(auth.jwt() ->> 'email') IN ('admin@nsn969.com', 'muhammadcandra1140@gmail.com') THEN
    RETURN true;
  END IF;

  -- 3. Check role inside JWT app_metadata claim ONLY (trusted server-assigned claim)
  IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' THEN
    RETURN true;
  END IF;

  -- 4. Direct lookup in user_profiles (SECURITY DEFINER bypasses RLS on user_profiles)
  IF EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()::text AND lower(role) = 'admin'
  ) THEN
    RETURN true;
  END IF;

  -- 5. Check legacy admins table if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'admins'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM public.admins
      WHERE (id = auth.uid()::text) OR (lower(email) = lower(auth.jwt() ->> 'email'))
    ) THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$;

-- ------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ------------------------------------------------------------

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streamers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ic_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 5. RLS POLICIES (IDEMPOTENT CREATION)
-- ------------------------------------------------------------

-- User Profiles
DROP POLICY IF EXISTS "Public user profiles read" ON public.user_profiles;
CREATE POLICY "Public user profiles read" ON public.user_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.user_profiles;
CREATE POLICY "Users update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

DROP POLICY IF EXISTS "Admins full management on user_profiles" ON public.user_profiles;
CREATE POLICY "Admins full management on user_profiles" ON public.user_profiles
  FOR ALL USING (public.is_admin());

-- System Settings
DROP POLICY IF EXISTS "Public read system_settings" ON public.system_settings;
CREATE POLICY "Public read system_settings" ON public.system_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage system_settings" ON public.system_settings;
CREATE POLICY "Admin manage system_settings" ON public.system_settings
  FOR ALL USING (public.is_admin());

-- Streamers
DROP POLICY IF EXISTS "Public read streamers" ON public.streamers;
CREATE POLICY "Public read streamers" ON public.streamers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage streamers" ON public.streamers;
CREATE POLICY "Admin manage streamers" ON public.streamers
  FOR ALL USING (public.is_admin());

-- Tracks
DROP POLICY IF EXISTS "Public read tracks" ON public.tracks;
CREATE POLICY "Public read tracks" ON public.tracks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage tracks" ON public.tracks;
CREATE POLICY "Admin manage tracks" ON public.tracks
  FOR ALL USING (public.is_admin());

-- Gallery
DROP POLICY IF EXISTS "Public read gallery" ON public.gallery;
CREATE POLICY "Public read gallery" ON public.gallery
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage gallery" ON public.gallery;
CREATE POLICY "Admin manage gallery" ON public.gallery
  FOR ALL USING (public.is_admin());

-- IC Characters
DROP POLICY IF EXISTS "Public read ic_characters" ON public.ic_characters;
CREATE POLICY "Public read ic_characters" ON public.ic_characters
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage ic_characters" ON public.ic_characters;
CREATE POLICY "Admin manage ic_characters" ON public.ic_characters
  FOR ALL USING (public.is_admin());

-- Community Categories
DROP POLICY IF EXISTS "Public read community_categories" ON public.community_categories;
CREATE POLICY "Public read community_categories" ON public.community_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage community_categories" ON public.community_categories;
CREATE POLICY "Admin manage community_categories" ON public.community_categories
  FOR ALL USING (public.is_admin());

-- Community Channels
DROP POLICY IF EXISTS "Public read community_channels" ON public.community_channels;
CREATE POLICY "Public read community_channels" ON public.community_channels
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage community_channels" ON public.community_channels;
CREATE POLICY "Admin manage community_channels" ON public.community_channels
  FOR ALL USING (public.is_admin());

-- Community Messages
DROP POLICY IF EXISTS "Public read community_messages" ON public.community_messages;
CREATE POLICY "Public read community_messages" ON public.community_messages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert community_messages" ON public.community_messages;
CREATE POLICY "Users insert community_messages" ON public.community_messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()::text AND
    NOT EXISTS (
      SELECT 1 FROM public.community_channels 
      WHERE id = channel_id AND admin_only = true AND NOT public.is_admin()
    )
  );

DROP POLICY IF EXISTS "Users delete own messages or admin delete" ON public.community_messages;
CREATE POLICY "Users delete own messages or admin delete" ON public.community_messages
  FOR DELETE USING (
    auth.uid()::text = user_id OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admin update messages" ON public.community_messages;
CREATE POLICY "Admin update messages" ON public.community_messages
  FOR UPDATE USING (public.is_admin());

-- ------------------------------------------------------------
-- 6. REALTIME PUBLICATION ENABLEMENT (SAFE & IDEMPOTENT)
-- ------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'community_categories') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.community_categories;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'community_channels') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.community_channels;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'community_messages') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ic_characters') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.ic_characters;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'system_settings') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
    END IF;
  END IF;
END $$;
