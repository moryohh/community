import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, Shield, CheckCircle2 } from 'lucide-react';

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_CONTENT = `-- ============================================================================
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
    service_role_key TEXT,
    ocr_api_key TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    is_current_leader BOOLEAN NOT NULL DEFAULT false,
    request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
    success_count INTEGER NOT NULL DEFAULT 0 CHECK (success_count >= 0),
    failure_count INTEGER NOT NULL DEFAULT 0 CHECK (failure_count >= 0),
    last_failure_reason TEXT,
    last_failure_at TIMESTAMPTZ,
    recent_errors JSONB DEFAULT '[]'::jsonb,
    load_limit INTEGER NOT NULL DEFAULT 200 CHECK (load_limit > 0),
    priority_order INTEGER NOT NULL DEFAULT 1 CHECK (priority_order > 0),
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- تحديث الأعمدة في حال كان الجدول منشأ مسبقاً (Migration Safe)
ALTER TABLE public.ocr_projects ADD COLUMN IF NOT EXISTS service_role_key TEXT;
ALTER TABLE public.ocr_projects ADD COLUMN IF NOT EXISTS ocr_api_key TEXT;
ALTER TABLE public.ocr_projects ADD COLUMN IF NOT EXISTS success_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.ocr_projects ADD COLUMN IF NOT EXISTS failure_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.ocr_projects ADD COLUMN IF NOT EXISTS last_failure_reason TEXT;
ALTER TABLE public.ocr_projects ADD COLUMN IF NOT EXISTS last_failure_at TIMESTAMPTZ;
ALTER TABLE public.ocr_projects ADD COLUMN IF NOT EXISTS recent_errors JSONB DEFAULT '[]'::jsonb;

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
ON CONFLICT (id) DO NOTHING;`;

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SQL_CONTENT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-mono">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                كود SQL لقاعدة بيانات Supabase (جدول ocr_projects)
              </h3>
              <p className="text-xs text-slate-500">
                جاهز للتنفيذ المباشر في Supabase SQL Editor مع قيود القيادة والأمان
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>ملف Schema معتمد لـ PostgreSQL / Supabase</span>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 font-semibold rounded-lg shadow-2xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>تم النسخ للحافظة!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>نسخ كود SQL بالكامل</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed" dir="ltr">
          <pre className="whitespace-pre-wrap selection:bg-emerald-800 selection:text-white">
            {SQL_CONTENT}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>يتضمن قيد القائد الوحيد (Partial Unique Index) وتفعيل Row Level Security</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
