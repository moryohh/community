import React, { useState, useEffect } from 'react';
import { X, Database, Check, AlertCircle, Crown, Copy, Terminal, Key, Zap, FileCode, Eye, EyeOff } from 'lucide-react';
import { OcrProject, ProjectFormData, ProjectStatus } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData & { service_role_key?: string; ocr_api_key?: string }) => Promise<void>;
  editingProject: OcrProject | null;
  defaultMaxRequests: number;
  onOpenSqlSchemaModal?: () => void;
}

export const SQL_SCHEMA_QUERY = `-- ============================================================================
-- SQL Schema: ocr_projects (Supabase / PostgreSQL)
-- Description: إنشاء جدول قواعد OCR الموحد وإدارة الربط ومفاتيح Service Role
-- ============================================================================

-- 1. تفعيل الامتداد لتوليد UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. إنشاء جدول قواعد ومشاريع OCR
CREATE TABLE IF NOT EXISTS public.ocr_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    project_url TEXT NOT NULL,
    ocr_api_key TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    is_current_leader BOOLEAN NOT NULL DEFAULT FALSE,
    request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
    load_limit INTEGER NOT NULL DEFAULT 200 CHECK (load_limit > 0),
    priority_order INTEGER NOT NULL DEFAULT 1,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. فهرس فريد لضمان وجود قائد نشط واحد فقط
CREATE UNIQUE INDEX IF NOT EXISTS single_active_leader_idx 
ON public.ocr_projects (is_current_leader) 
WHERE (is_current_leader = TRUE);

-- 4. فهارس تسريع الأداء
CREATE INDEX IF NOT EXISTS idx_ocr_projects_status ON public.ocr_projects (status);
CREATE INDEX IF NOT EXISTS idx_ocr_projects_priority ON public.ocr_projects (priority_order ASC);

-- 5. تفعيل أمان مستوى الصفوف (Row Level Security)
ALTER TABLE public.ocr_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service_role full access" ON public.ocr_projects
    FOR ALL TO service_role USING (true) WITH CHECK (true);`;

export const DatabaseModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingProject,
  defaultMaxRequests,
  onOpenSqlSchemaModal,
}) => {
  const [name, setName] = useState('');
  const [serviceRoleKey, setServiceRoleKey] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [ocrApiKey, setOcrApiKey] = useState('');
  const [loadLimit, setLoadLimit] = useState(200);
  const [priorityOrder, setPriorityOrder] = useState(1);
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [isLeader, setIsLeader] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showServiceRole, setShowServiceRole] = useState(true);
  const [showOcrKey, setShowOcrKey] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setProjectUrl(editingProject.project_url);
      setLoadLimit(editingProject.load_limit || 200);
      setPriorityOrder(editingProject.priority_order || 1);
      setStatus(editingProject.status);
      setIsLeader(editingProject.is_current_leader);
      setServiceRoleKey('');
      setOcrApiKey('');
    } else {
      setName('');
      setProjectUrl('');
      setServiceRoleKey('');
      setOcrApiKey('');
      setLoadLimit(defaultMaxRequests || 200);
      setPriorityOrder(1);
      setStatus('active');
      setIsLeader(false);
    }
    setError(null);
  }, [editingProject, isOpen, defaultMaxRequests]);

  // Auto-derive project URL if user pastes Service Role Key
  const handleKeyChange = (keyVal: string) => {
    setServiceRoleKey(keyVal);
    try {
      const parts = keyVal.trim().split('.');
      if (parts.length >= 2) {
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        const payload = JSON.parse(atob(base64));
        if (payload.ref) {
          setProjectUrl(`https://${payload.ref}.supabase.co`);
          if (!name) setName(`قاعدة OCR ${payload.ref.slice(0, 6)}`);
        }
      }
    } catch (e) {
      // Ignored
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_QUERY);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('يرجى إدخال اسم القاعدة');
      return;
    }

    if (!editingProject && !serviceRoleKey.trim() && !projectUrl.trim()) {
      setError('يرجى إدخال مفتاح Service Role Key أو رابط مشروع Supabase');
      return;
    }

    if (loadLimit <= 0) {
      setError('حد الحمل يجب أن يكون أكبر من صفر');
      return;
    }

    if (isLeader && status === 'disabled') {
      setError('لا يمكن تعيين قاعدة معطلة كقائد');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        project_url: projectUrl.trim() || 'https://supabase.co',
        ocr_api_key: ocrApiKey.trim() || undefined,
        load_limit: Number(loadLimit),
        priority_order: Number(priorityOrder),
        status,
        is_current_leader: isLeader,
        service_role_key: serviceRoleKey.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إضافة وربط القاعدة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {editingProject ? 'تعديل بيانات القاعدة' : 'إضافة قاعدة جديدة'}
              </h3>
              <p className="text-xs text-slate-500">
                ربط قاعدة Supabase جديدة وتعيين مفتاح OCR API المستقل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-right overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Base Name & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم القاعدة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: قاعدة 01 أو OCR-Project-Alpha"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ترتيب الأولوية (1 - 10) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={priorityOrder}
                onChange={(e) => setPriorityOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* 2. Supabase Project URL & Service Role Key */}
          <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-xl space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>رابط مشروع Supabase (Project URL)</span>
              </label>
              <input
                type="url"
                dir="ltr"
                placeholder="https://xyzproject.supabase.co"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>مفتاح السيرفر رول (Service Role Key)</span>
                  {!editingProject && <span className="text-rose-500">*</span>}
                </label>
                <button
                  type="button"
                  onClick={() => setShowServiceRole(!showServiceRole)}
                  className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {showServiceRole ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showServiceRole ? 'إخفاء' : 'كشف'}</span>
                </button>
              </div>
              <input
                type={showServiceRole ? "text" : "password"}
                dir="ltr"
                placeholder="أدخل مفتاح Service Role من Supabase هنا"
                value={serviceRoleKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* 3. Project-Specific OCR API Key */}
          <div className="p-4 bg-amber-50/40 border border-amber-200/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>مفتاح OCR API المستقل (خاص بهذه القاعدة فقط)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowOcrKey(!showOcrKey)}
                className="text-[11px] text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {showOcrKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showOcrKey ? 'إخفاء' : 'كشف'}</span>
              </button>
            </div>
            <input
              type={showOcrKey ? "text" : "password"}
              dir="ltr"
              placeholder="أدخل مفتاح OCR API المخصص لهذه القاعدة..."
              value={ocrApiKey}
              onChange={(e) => setOcrApiKey(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
            />
            <p className="text-[11px] text-slate-500 leading-normal">
              كل قاعدة تمتلك OCR API خاص بها ومستقل لمعالجة واستخراج النصوص.
            </p>
          </div>

          {/* 4. Unified SQL Schema Copy Box */}
          <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl space-y-2 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>SQL Schema الموحد لإنشاء الجداول في Supabase</span>
              </div>
              <div className="flex items-center gap-2">
                {onOpenSqlSchemaModal && (
                  <button
                    type="button"
                    onClick={onOpenSqlSchemaModal}
                    className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer"
                  >
                    عرض الكود بالكامل
                  </button>
                )}
                <button
                  type="button"
                  onClick={copySql}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ SQL Schema</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              انسخ الكود ثم الصقه في <strong className="text-white">Supabase &gt; SQL Editor &gt; New Query</strong> ثم اضغط <strong className="text-blue-300">Run</strong> لبناء نفس الهيكل فوراً.
            </p>
          </div>

          {/* 5. Load limit & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                حد الحمل (عدد الطلبات)
              </label>
              <input
                type="number"
                min="1"
                required
                value={loadLimit}
                onChange={(e) => setLoadLimit(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                حالة القاعدة
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    status === 'active'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-200'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  متصلة (Active)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatus('disabled');
                    setIsLeader(false);
                  }}
                  className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    status === 'disabled'
                      ? 'bg-slate-100 border-slate-500 text-slate-800 ring-2 ring-slate-200'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  معطلة (Disabled)
                </button>
              </div>
            </div>
          </div>

          {/* Leader Selection */}
          <div className="pt-1">
            <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
              status === 'disabled'
                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                : isLeader
                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                disabled={status === 'disabled'}
                checked={isLeader}
                onChange={(e) => setIsLeader(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-blue-600" />
                  <span>تعيين كقاعدة قائدة حالية (Leader Base)</span>
                </div>
                <p className="text-slate-500 mt-0.5 text-[11px]">
                  سيتم توجيه طلبات الـ OCR الواردة إليها أولاً حتى بلوغ حد الحمل المحدد.
                </p>
              </div>
            </label>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <span>جاري الحفظ والربط...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editingProject ? 'حفظ التعديلات' : 'إضافة القاعدة'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
