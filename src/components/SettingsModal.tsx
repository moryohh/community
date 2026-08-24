import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Crown,
  Database,
  RotateCcw,
  Check,
  AlertCircle,
  Key,
  ShieldCheck,
  Server,
  Sparkles,
  Zap,
  Cpu,
  Layers,
  Eye,
  EyeOff,
  Copy,
} from 'lucide-react';
import { OcrProject, SystemSettings, SupabaseConnectionStatus } from '../types';
import * as api from '../api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  projects: OcrProject[];
  connectionStatus: SupabaseConnectionStatus | null;
  onSaveSettings: (newSettings: SystemSettings) => void;
  onSaveServiceRoleKey: (key: string) => Promise<void>;
  onSetLeader: (project: OcrProject) => void;
  onBatchReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  projects,
  connectionStatus,
  onSaveSettings,
  onSaveServiceRoleKey,
  onSetLeader,
  onBatchReset,
}) => {
  const [leadershipLimit, setLeadershipLimit] = useState(settings.leadershipHandoverLimit);
  const [defaultLimit, setDefaultLimit] = useState(settings.defaultMaxRequests);
  const [selectedLeaderId, setSelectedLeaderId] = useState(
    projects.find((p) => p.is_current_leader)?.id || ''
  );

  // Key inputs (Only for setting/updating new keys in backend)
  const [serviceRoleKey, setServiceRoleKey] = useState('');
  const [deepseekApiKey, setDeepseekApiKey] = useState('');
  const [hasDeepseekConfigured, setHasDeepseekConfigured] = useState(false);
  const [hasServiceRoleConfigured, setHasServiceRoleConfigured] = useState(false);
  const [isSavingKeys, setIsSavingKeys] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.fetchKeysStatus().then((status) => {
        setHasDeepseekConfigured(Boolean(status.hasDeepseekKey));
        setHasServiceRoleConfigured(Boolean(status.hasServiceKey));
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeProjects = projects.filter((p) => p.status === 'active');

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      leadershipHandoverLimit: Number(leadershipLimit),
      defaultMaxRequests: Number(defaultLimit),
    });

    if (selectedLeaderId) {
      const target = projects.find((p) => p.id === selectedLeaderId);
      if (target && !target.is_current_leader) {
        onSetLeader(target);
      }
    }

    onClose();
  };

  const handleSaveAllKeys = async () => {
    setIsSavingKeys(true);
    setKeyFeedback(null);
    try {
      if (deepseekApiKey.trim()) {
        await api.saveDeepseekKey(deepseekApiKey.trim());
      }
      if (serviceRoleKey.trim()) {
        await onSaveServiceRoleKey(serviceRoleKey.trim());
      }

      setKeyFeedback({
        type: 'success',
        text: 'تم حفظ وتحديث مفاتيح النظام في الخادم الخلفي بنجاح!',
      });
      setDeepseekApiKey('');
      setServiceRoleKey('');
    } catch (err: any) {
      setKeyFeedback({
        type: 'error',
        text: err.message || 'حدث خطأ أثناء حفظ المفاتيح',
      });
    } finally {
      setIsSavingKeys(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">إعدادات النظام والمفاتيح العامة</h3>
              <p className="text-xs text-slate-500">مفتاح DeepSeek العام المشترك ومفتاح السيرفر رول</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-right">
          
          {keyFeedback && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              keyFeedback.type === 'success'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {keyFeedback.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{keyFeedback.text}</span>
            </div>
          )}

          {/* Architecture Pipeline Note */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-900">
            <div className="font-bold flex items-center gap-1.5 text-blue-950">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>معمارية المعالجة المعتمدة:</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              الصورة ← Dashboard / Middleware ← مشروع OCR القائد الحالي ← <strong>OCR API الخاص بالمشروع</strong> ← النص المستخرج ← <strong>DeepSeek API العام المشترك</strong> ← النتيجة النهائية للمنصة التعليمية.
            </p>
          </div>

          {/* Section 1: Keys Configuration */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900">إدارة المفاتيح والأمان (Backend Secrets)</h4>
              </div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                مؤمنة على الخادم الخلفي
              </span>
            </div>

            {/* DeepSeek API Key (Shared for entire system) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>1. تعيين/تحديث مفتاح DeepSeek API (عام ومشترك لجميع مشاريع الـ OCR)</span>
                </label>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  hasDeepseekConfigured ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {hasDeepseekConfigured ? 'مهيأ بالخادم ✅' : 'غير مهيأ ❌'}
                </span>
              </div>
              <input
                type="password"
                dir="ltr"
                placeholder="أدخل مفتاح DeepSeek الجديد (sk-...) لتحديثه في الخادم..."
                value={deepseekApiKey}
                onChange={(e) => setDeepseekApiKey(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              />
              <p className="text-[10px] text-slate-500">
                جميع مشاريع OCR تستخدم نفس مفتاح DeepSeek المشترك لمطابقة وتحليل الأسئلة والأجوبة دلالياً.
              </p>
            </div>

            {/* Supabase Service Role Key */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. تعيين/تحديث مفتاح Supabase Service Role Key الأساسي</span>
                </label>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  hasServiceRoleConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {hasServiceRoleConfigured ? 'مهيأ بالخادم ✅' : 'غير مهيأ ❌'}
                </span>
              </div>
              <input
                type="password"
                dir="ltr"
                placeholder="أدخل مفتاح Service Role الجديد (eyJ...) لتحديثه في الخادم..."
                value={serviceRoleKey}
                onChange={(e) => setServiceRoleKey(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={handleSaveAllKeys}
                disabled={isSavingKeys}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSavingKeys ? 'جاري الحفظ...' : 'حفظ وتحديث المفاتيح'}
              </button>
            </div>
          </div>

          {/* Section 2: Leader Selection */}
          {activeProjects.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>تعيين المشروع القائد الحالي (is_current_leader)</span>
              </label>
              <select
                value={selectedLeaderId}
                onChange={(e) => setSelectedLeaderId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {activeProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (أولوية #{p.priority_order}) — {p.request_count}/{p.load_limit} طلب
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section 3: Limits Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                حد انتقال القيادة التلقائي
              </label>
              <input
                type="number"
                min="10"
                value={leadershipLimit}
                onChange={(e) => setLeadershipLimit(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">الافتراضي: 200 طلب</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                حد الحمل الافتراضي
              </label>
              <input
                type="number"
                min="10"
                value={defaultLimit}
                onChange={(e) => setDefaultLimit(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">للمشاريع الجديدة</p>
            </div>
          </div>

          {/* Section 4: Batch Reset */}
          {projects.length > 0 && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-amber-900">تصفير عدادات جميع مشاريع OCR</div>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  إعادة ضبط request_count إلى 0 لجميع المشاريع النشطة
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('هل تريد بالتأكيد تصفير عدادات الطلبات لجميع المشاريع؟')) {
                    onBatchReset();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                تصفير الكل
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>

      </div>
    </div>
  );
};
