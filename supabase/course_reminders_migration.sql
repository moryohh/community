-- فعّل هذا الكود مرة واحدة في Supabase B / SQL Editor
CREATE TABLE IF NOT EXISTS public.course_reminders (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  course_title TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_course_reminder_user UNIQUE (course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_course_reminders_course_created
  ON public.course_reminders(course_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_course_reminders_user
  ON public.course_reminders(user_id);

ALTER TABLE public.course_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on course_reminders" ON public.course_reminders;
CREATE POLICY "Service role full access on course_reminders"
  ON public.course_reminders
  FOR ALL
  USING (auth.role() = 'service_role' OR auth.role() = 'postgres');
