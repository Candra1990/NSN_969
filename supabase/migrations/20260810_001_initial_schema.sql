-- NSN969 MULTIVIEW - Supabase Migration Schema
-- Version: 1.0.0
-- Created: 2026-08-10

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USER PROFILES / ROLES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY, -- Auth user UUID as TEXT
  email TEXT,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on role
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Helper function to check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN (
    (LOWER(COALESCE(auth.jwt()->>'email', '')) IN ('muhammadcandra1140@gmail.com', 'muhammadcandra1957@gmail.com'))
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 2. SYSTEM SETTINGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.system_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  announcement_id TEXT DEFAULT '',
  announcement_en TEXT DEFAULT '',
  announcement_active BOOLEAN NOT NULL DEFAULT false,
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 3. STREAMERS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.streamers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'tiktok', 'twitch', 'facebook', 'other')),
  channel_id TEXT DEFAULT '',
  youtube_id TEXT DEFAULT '',
  tiktok_id TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL DEFAULT 'Streamer',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_streamers_platform ON public.streamers(platform);
CREATE INDEX IF NOT EXISTS idx_streamers_status ON public.streamers(status);

-- ==========================================
-- 4. TRACKS (BACKSOUND)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.tracks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 5. GALLERY
-- ==========================================
CREATE TABLE IF NOT EXISTS public.gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT '',
  src TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 6. IC CHARACTERS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.ic_characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  player_name TEXT NOT NULL DEFAULT '',
  avatar TEXT DEFAULT '',
  banner TEXT DEFAULT '',
  role TEXT DEFAULT 'Civilian',
  faction TEXT DEFAULT 'Unaffiliated',
  occupation TEXT DEFAULT 'Unemployed',
  age INTEGER DEFAULT 21 CHECK (age >= 0 AND age <= 150),
  bio TEXT DEFAULT '',
  status TEXT DEFAULT 'Active',
  social_links JSONB DEFAULT '{}'::jsonb,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ic_characters_faction ON public.ic_characters(faction);

-- ==========================================
-- 7. COMMUNITY CATEGORIES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.community_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_collapsed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_categories_pos ON public.community_categories(position);

-- ==========================================
-- 8. COMMUNITY CHANNELS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.community_channels (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES public.community_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'announcement', 'voice', 'rules')),
  icon TEXT DEFAULT 'Hash',
  position INTEGER NOT NULL DEFAULT 0,
  admin_only BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_channels_cat ON public.community_channels(category_id);
CREATE INDEX IF NOT EXISTS idx_community_channels_pos ON public.community_channels(position);

-- ==========================================
-- 9. COMMUNITY MESSAGES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.community_messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL REFERENCES public.community_channels(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT DEFAULT '',
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 4000),
  reply_to JSONB DEFAULT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  reactions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crucial composite index for fast real-time chat pagination
CREATE INDEX IF NOT EXISTS idx_community_messages_chan_date 
  ON public.community_messages(channel_id, created_at DESC);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streamers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ic_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- 1. USER PROFILES RLS
-- ------------------------------------------
DROP POLICY IF EXISTS "Public user profiles read" ON public.user_profiles;
CREATE POLICY "Public user profiles read" ON public.user_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid()::text));

DROP POLICY IF EXISTS "Admins full management on user_profiles" ON public.user_profiles;
CREATE POLICY "Admins full management on user_profiles" ON public.user_profiles
  FOR ALL USING (public.is_admin());

-- ------------------------------------------
-- 2. SYSTEM SETTINGS RLS
-- ------------------------------------------
DROP POLICY IF EXISTS "Public read system_settings" ON public.system_settings;
CREATE POLICY "Public read system_settings" ON public.system_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage system_settings" ON public.system_settings;
CREATE POLICY "Admin manage system_settings" ON public.system_settings
  FOR ALL USING (public.is_admin());

-- ------------------------------------------
-- 3. STREAMERS RLS
-- ------------------------------------------
DROP POLICY IF EXISTS "Public read streamers" ON public.streamers;
CREATE POLICY "Public read streamers" ON public.streamers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage streamers" ON public.streamers;
CREATE POLICY "Admin manage streamers" ON public.streamers
  FOR ALL USING (public.is_admin());

-- ------------------------------------------
-- 4. TRACKS RLS
-- ------------------------------------------
DROP POLICY IF EXISTS "Public read tracks" ON public.tracks;
CREATE POLICY "Public read tracks" ON public.tracks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage tracks" ON public.tracks;
CREATE POLICY "Admin manage tracks" ON public.tracks
  FOR ALL USING (public.is_admin());

-- ------------------------------------------
-- 5. GALLERY RLS
-- ------------------------------------------
DROP POLICY IF EXISTS "Public read gallery" ON public.gallery;
CREATE POLICY "Public read gallery" ON public.gallery
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage gallery" ON public.gallery;
CREATE POLICY "Admin manage gallery" ON public.gallery
  FOR ALL USING (public.is_admin());

-- ------------------------------------------
-- 6. IC CHARACTERS RLS
-- ------------------------------------------
DROP POLICY IF EXISTS "Public read ic_characters" ON public.ic_characters;
CREATE POLICY "Public read ic_characters" ON public.ic_characters
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage ic_characters" ON public.ic_characters;
CREATE POLICY "Admin manage ic_characters" ON public.ic_characters
  FOR ALL USING (public.is_admin());

-- ------------------------------------------
-- 7. COMMUNITY CATEGORIES RLS
-- ------------------------------------------
DROP POLICY IF EXISTS "Public read community_categories" ON public.community_categories;
CREATE POLICY "Public read community_categories" ON public.community_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage community_categories" ON public.community_categories;
CREATE POLICY "Admin manage community_categories" ON public.community_categories
  FOR ALL USING (public.is_admin());

-- ------------------------------------------
-- 8. COMMUNITY CHANNELS RLS
-- ------------------------------------------
DROP POLICY IF EXISTS "Public read community_channels" ON public.community_channels;
CREATE POLICY "Public read community_channels" ON public.community_channels
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage community_channels" ON public.community_channels;
CREATE POLICY "Admin manage community_channels" ON public.community_channels
  FOR ALL USING (public.is_admin());

-- ------------------------------------------
-- 9. COMMUNITY MESSAGES RLS
-- ------------------------------------------
DROP POLICY IF EXISTS "Public read community_messages" ON public.community_messages;
CREATE POLICY "Public read community_messages" ON public.community_messages
  FOR SELECT USING (true);

-- Authenticated users sending messages to non-admin-only channels
DROP POLICY IF EXISTS "Users insert community_messages" ON public.community_messages;
CREATE POLICY "Users insert community_messages" ON public.community_messages
  FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
    AND EXISTS (
      SELECT 1 FROM public.community_channels
      WHERE id = channel_id
    )
    AND (
      NOT EXISTS (
        SELECT 1 FROM public.community_channels
        WHERE id = channel_id AND admin_only = true
      ) OR public.is_admin()
    )
  );

DROP POLICY IF EXISTS "Users delete own messages or admin delete" ON public.community_messages;
CREATE POLICY "Users delete own messages or admin delete" ON public.community_messages
  FOR DELETE USING (
    auth.uid()::text = user_id OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admin update messages (pin/moderate)" ON public.community_messages;
CREATE POLICY "Admin update messages (pin/moderate)" ON public.community_messages
  FOR UPDATE USING (public.is_admin());

-- Enable Realtime publication for community tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_categories;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_channels;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore if already added
END $$;

