-- ============================================================================
-- SQL Schema: ocr_projects (Supabase / PostgreSQL)
-- Description: إدارة مشاريع OCR وتتبع حالة القيادة وتوزيع الحمل
-- ============================================================================

-- 1. تفعيل الامتداد لتوليد UUID إن لم يكن مفعلاً
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. إنشاء جدول مشاريع OCR
CREATE TABLE IF NOT EXISTS public.ocr_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    project_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    is_current_leader BOOLEAN NOT NULL DEFAULT false,
    request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
    load_limit INTEGER NOT NULL DEFAULT 200 CHECK (load_limit > 0),
    priority_order INTEGER NOT NULL DEFAULT 1 CHECK (priority_order > 0),
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. قيد منع وجود أكثر من قائد حالي واحد في نفس الوقت (Partial Unique Index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_ocr_projects_single_leader
ON public.ocr_projects (is_current_leader)
WHERE is_current_leader = true;

-- 4. الفهارس (Indexes) لتسريع الاستعلامات
-- فهرس للبحث عن المشاريع حسب الحالة
CREATE INDEX IF NOT EXISTS idx_ocr_projects_status
ON public.ocr_projects (status);

-- فهرس مركب للمشاريع النشطة حسب ترتيب الأولوية لدورة التوزيع
CREATE INDEX IF NOT EXISTS idx_ocr_projects_active_priority
ON public.ocr_projects (status, priority_order ASC);

-- فهرس للترتيب حسب الأولوية
CREATE INDEX IF NOT EXISTS idx_ocr_projects_priority_order
ON public.ocr_projects (priority_order ASC);

-- 5. دالة ومشغّل التحديث التلقائي لحقل updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_ocr_projects_updated_at ON public.ocr_projects;
CREATE TRIGGER set_ocr_projects_updated_at
BEFORE UPDATE ON public.ocr_projects
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 6. تفعيل أمان مستوى الصفوف (Row Level Security)
ALTER TABLE public.ocr_projects ENABLE ROW LEVEL SECURITY;

-- 7. سياسات الأمان (RLS Policies) لحماية البيانات من الوصول العام
-- سياسة القراءة للمستخدمين المسجلين فقط
CREATE POLICY "Allow authenticated users to read ocr_projects"
ON public.ocr_projects
FOR SELECT
TO authenticated
USING (true);

-- سياسة التعديل للمستخدمين المسجلين فقط
CREATE POLICY "Allow authenticated users to manage ocr_projects"
ON public.ocr_projects
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- سياسة كاملة للـ service_role (الخادم الخلفي)
CREATE POLICY "Allow service_role full access to ocr_projects"
ON public.ocr_projects
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 8. إدراج 10 مشاريع تجريبية وهمية (OCR-01 إلى OCR-10)
-- OCR-01 هو القائد الحالي، وجميع المشاريع الأخرى نشطة، وحد الحمل 200
INSERT INTO public.ocr_projects (name, project_url, status, is_current_leader, request_count, load_limit, priority_order)
VALUES
    ('OCR-01', 'https://ocr-project-01.supabase.co', 'active', true,  0, 200, 1),
    ('OCR-02', 'https://ocr-project-02.supabase.co', 'active', false, 0, 200, 2),
    ('OCR-03', 'https://ocr-project-03.supabase.co', 'active', false, 0, 200, 3),
    ('OCR-04', 'https://ocr-project-04.supabase.co', 'active', false, 0, 200, 4),
    ('OCR-05', 'https://ocr-project-05.supabase.co', 'active', false, 0, 200, 5),
    ('OCR-06', 'https://ocr-project-06.supabase.co', 'active', false, 0, 200, 6),
    ('OCR-07', 'https://ocr-project-07.supabase.co', 'active', false, 0, 200, 7),
    ('OCR-08', 'https://ocr-project-08.supabase.co', 'active', false, 0, 200, 8),
    ('OCR-09', 'https://ocr-project-09.supabase.co', 'active', false, 0, 200, 9),
    ('OCR-10', 'https://ocr-project-10.supabase.co', 'active', false, 0, 200, 10)
ON CONFLICT (id) DO NOTHING;
