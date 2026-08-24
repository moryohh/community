-- =========================================================================
-- SUPABASE B: COMPLETE PRODUCTION SCHEMA FOR COMMUNITY PLATFORM
-- =========================================================================

-- 0. COMMUNITY PROFILES TABLE (Stable Bot & User Profiles)
CREATE TABLE IF NOT EXISTS public.community_profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  author_name_key TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  profile_type TEXT NOT NULL DEFAULT 'bot', -- 'bot', 'user', 'admin'
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1. POSTS TABLE (Main Community Feed)
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  user_id TEXT, -- User ID from Supabase A auth.users (null for bots)
  author_profile_id TEXT REFERENCES public.community_profiles(id) ON DELETE SET NULL,
  author_display_name TEXT NOT NULL DEFAULT 'مستخدم في المجتمع',
  author_avatar_url TEXT,
  content TEXT NOT NULL,
  post_text TEXT, -- Compatibility alias for Facebook scraped text
  post_type TEXT DEFAULT 'general', -- 'general', 'question', 'curriculum', 'exercise', 'announcement'
  status TEXT NOT NULL DEFAULT 'published', -- 'published', 'pending', 'rejected', 'hidden', 'deleted'
  source_type TEXT NOT NULL DEFAULT 'user', -- 'user', 'manual_json_import', 'bot', 'apify'
  source_metadata JSONB DEFAULT '{}'::jsonb,
  media JSONB DEFAULT '[]'::jsonb, -- Array of media objects { url, key, type, width, height }
  media_urls JSONB DEFAULT '[]'::jsonb, -- Compatibility array of string URLs
  media_type TEXT DEFAULT 'none',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reports_count INTEGER DEFAULT 0,
  reactions_count INTEGER DEFAULT 0,
  group_id TEXT,
  group_name TEXT,
  group_url TEXT,
  post_url TEXT,
  source_post_id TEXT,
  source_api TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB,
  moderated_at TIMESTAMPTZ,
  moderated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. COMMENTS TABLE (Hierarchical comments & replies)
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT, -- User ID from Supabase A (null for bots)
  author_profile_id TEXT REFERENCES public.community_profiles(id) ON DELETE SET NULL,
  parent_comment_id TEXT REFERENCES public.comments(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'معلق',
  author_id TEXT,
  author_image_url TEXT,
  author_avatar TEXT,
  comment_text TEXT NOT NULL,
  content TEXT, -- Alias
  status TEXT NOT NULL DEFAULT 'published', -- 'published', 'pending', 'hidden', 'deleted'
  likes_count INTEGER DEFAULT 0,
  source_comment_id TEXT,
  extracted_by_api TEXT,
  raw_data JSONB,
  comment_created_at TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. POST REACTIONS (Likes, Loves, etc. - Idempotent Unique Index)
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like', -- 'like', 'love', 'haha', 'wow', 'sad', 'angry'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_post_reaction UNIQUE (post_id, user_id)
);

-- 4. COMMENT REACTIONS (Idempotent Unique Index)
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id TEXT PRIMARY KEY,
  comment_id TEXT NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_comment_reaction UNIQUE (comment_id, user_id)
);

-- 5. REPORTS TABLE (Moderation queue for reported content)
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  reporter_user_id TEXT,
  reporter_name TEXT,
  target_type TEXT NOT NULL DEFAULT 'post', -- 'post', 'comment', 'user'
  target_id TEXT NOT NULL,
  post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id TEXT REFERENCES public.comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL, -- 'spam', 'inappropriate', 'bullying', 'off_topic', 'other'
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'reviewed', 'dismissed', 'action_taken'
  action_taken TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. MEDIA OBJECTS (Cloudflare R2 Storage Metadata)
CREATE TABLE IF NOT EXISTS public.media (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT,
  post_id TEXT REFERENCES public.posts(id) ON DELETE SET NULL,
  comment_id TEXT REFERENCES public.comments(id) ON DELETE SET NULL,
  object_key TEXT NOT NULL,
  public_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  width INTEGER,
  height INTEGER,
  status TEXT NOT NULL DEFAULT 'uploaded', -- 'presigned', 'uploaded', 'attached', 'deleted'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. MODERATION LOGS (Audit trail for supervisor actions)
CREATE TABLE IF NOT EXISTS public.moderation_logs (
  id TEXT PRIMARY KEY,
  moderator_user_id TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'post', 'comment', 'report', 'bulk'
  target_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'approve', 'reject', 'hide', 'delete', 'dismiss_report'
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. GROUPS TABLE (Facebook groups & targeted communities)
CREATE TABLE IF NOT EXISTS public.groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  posts_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DASHBOARD ADMINS TABLE (STRICT 3 ACTIVE SEATS CONSTRAINT)
CREATE TABLE IF NOT EXISTS public.dashboard_admins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- User ID from Supabase A auth.users
  display_name TEXT NOT NULL DEFAULT 'مشرف معتمد',
  email TEXT,
  role TEXT NOT NULL DEFAULT 'admin', -- 'owner' or 'admin'
  status TEXT NOT NULL DEFAULT 'active', -- 'active' or 'revoked'
  created_by TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- PostgreSQL trigger function enforcing MAX 3 ACTIVE ADMINS atomically
CREATE OR REPLACE FUNCTION public.check_max_three_active_admins()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
BEGIN
  IF NEW.status = 'active' THEN
    SELECT COUNT(*) INTO active_count 
    FROM public.dashboard_admins 
    WHERE status = 'active' AND id != COALESCE(NEW.id, 'none');

    IF active_count >= 3 THEN
      RAISE EXCEPTION 'LIMIT_EXCEEDED: تم الوصول للحد الأقصى المسموح به (3 حسابات إدارية نشطة فقط). يجب إلغاء/تعطيل حساب قديم أولاً.'
        USING ERRCODE = '23514'; -- check_violation
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_three_admins ON public.dashboard_admins;
CREATE TRIGGER trg_enforce_three_admins
  BEFORE INSERT OR UPDATE ON public.dashboard_admins
  FOR EACH ROW
  EXECUTE FUNCTION public.check_max_three_active_admins();

-- =========================================================================
-- OPTIMIZATION INDEXES FOR RAPID COMMUNITY FEED QUERYING
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_posts_status_created ON public.posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_source_type ON public.posts(source_type);
CREATE INDEX IF NOT EXISTS idx_posts_author_profile ON public.posts(author_profile_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_status ON public.comments(post_id, status, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_author_profile ON public.comments(author_profile_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_profiles_key ON public.community_profiles(author_name_key);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.community_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies (Allow students to view published items only)
DROP POLICY IF EXISTS "Public can view community profiles" ON public.community_profiles;
CREATE POLICY "Public can view community profiles" ON public.community_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
CREATE POLICY "Public can view published posts" ON public.posts FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public can view active comments" ON public.comments;
CREATE POLICY "Public can view active comments" ON public.comments FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public can view groups" ON public.groups;
CREATE POLICY "Public can view groups" ON public.groups FOR SELECT USING (true);

-- 2. Service Role Full Access (Backend Express API has full control)
DROP POLICY IF EXISTS "Service role full access on community_profiles" ON public.community_profiles;
CREATE POLICY "Service role full access on community_profiles" ON public.community_profiles FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'postgres');

DROP POLICY IF EXISTS "Service role full access on posts" ON public.posts;
CREATE POLICY "Service role full access on posts" ON public.posts FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'postgres');

DROP POLICY IF EXISTS "Service role full access on comments" ON public.comments;
CREATE POLICY "Service role full access on comments" ON public.comments FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'postgres');

DROP POLICY IF EXISTS "Service role full access on post_reactions" ON public.post_reactions;
CREATE POLICY "Service role full access on post_reactions" ON public.post_reactions FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'postgres');

DROP POLICY IF EXISTS "Service role full access on comment_reactions" ON public.comment_reactions;
CREATE POLICY "Service role full access on comment_reactions" ON public.comment_reactions FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'postgres');

DROP POLICY IF EXISTS "Service role full access on reports" ON public.reports;
CREATE POLICY "Service role full access on reports" ON public.reports FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'postgres');

DROP POLICY IF EXISTS "Service role full access on media" ON public.media;
CREATE POLICY "Service role full access on media" ON public.media FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'postgres');

DROP POLICY IF EXISTS "Service role full access on moderation_logs" ON public.moderation_logs;
CREATE POLICY "Service role full access on moderation_logs" ON public.moderation_logs FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'postgres');

DROP POLICY IF EXISTS "Service role full access on groups" ON public.groups;
CREATE POLICY "Service role full access on groups" ON public.groups FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'postgres');
