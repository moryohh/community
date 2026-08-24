import React, { useState } from 'react';
import {
  Crown,
  Edit2,
  Trash2,
  Power,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Plus,
  Database,
  Key,
  ShieldCheck,
  Zap,
  RefreshCw,
  Play,
  Settings2,
  Cpu,
  Globe,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  Sliders,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  Activity,
  ArrowLeftRight,
} from 'lucide-react';
import { OcrProject, SystemKeysStatus, SupabaseConnectionStatus } from '../types';

interface ProjectTableProps {
  projects: OcrProject[];
  keysStatus?: SystemKeysStatus;
  connectionStatus?: SupabaseConnectionStatus | null;
  onEdit: (project: OcrProject) => void;
  onDelete: (project: OcrProject) => void;
  onToggleStatus: (project: OcrProject) => void;
  onSetLeader: (project: OcrProject) => void;
  onSimulateLoad: (project: OcrProject, count: number) => void;
  onResetLoad: (project: OcrProject) => void;
  onAddProject?: () => void;
  onAddOcrKey: (project: OcrProject) => void;
  onReplaceOcrKey: (project: OcrProject) => void;
  onRemoveOcrKey: (project: OcrProject) => void;
  onAddServiceRoleKey?: (project: OcrProject) => void;
  onReplaceServiceRoleKey?: (project: OcrProject) => void;
  onTestProject?: (project: OcrProject) => void;
  onViewErrors?: (project: OcrProject) => void;
}

export const DatabaseTable: React.FC<ProjectTableProps> = ({
  projects,
  keysStatus = { hasServiceKey: false, hasDeepseekKey: true, hasDefaultOcrKey: true } as SystemKeysStatus,
  connectionStatus,
  onEdit,
  onDelete,
  onToggleStatus,
  onSetLeader,
  onSimulateLoad,
  onResetLoad,
  onAddProject,
  onAddOcrKey,
  onReplaceOcrKey,
  onRemoveOcrKey,
  onAddServiceRoleKey,
  onReplaceServiceRoleKey,
  onTestProject,
  onViewErrors,
}) => {
  // Currently selected database bubble (defaults to first real project or leader)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    if (projects.length === 0) return null;
    const leader = projects.find((p) => p.is_current_leader);
    return leader ? leader.id : projects[0].id;
  });

  const [copiedKeyName, setCopiedKeyName] = useState<string | null>(null);
  const [hiddenKeys, setHiddenKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (keyId: string) => {
    setHiddenKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKeyName(label);
    setTimeout(() => {
      setCopiedKeyName((curr) => (curr === label ? null : curr));
    }, 2000);
  };

  // Keep selection valid if projects change
  React.useEffect(() => {
    if (projects.length === 0) {
      setSelectedProjectId(null);
    } else if (!projects.some((p) => p.id === selectedProjectId)) {
      const leader = projects.find((p) => p.is_current_leader);
      setSelectedProjectId(leader ? leader.id : projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // If zero real projects are stored
  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-5 animate-in fade-in duration-200">
        <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border-2 border-dashed border-blue-200 relative">
          <Database className="w-9 h-9" />
          <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-100 text-slate-600 rounded-full border border-slate-300 text-xs font-bold flex items-center justify-center">
            0
          </span>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900">
            لا توجد أي قواعد بيانات مضافة حالياً (0 / 10)
          </h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            النظام لا يعرض أي بيانات أو قواعد وهمية على الإطلاق. 
            تظهر أيقونات القواعد هنا فقط عندما تقوم بإضافة قاعدة بيانات Supabase حقيقية.
          </p>
        </div>

        {onAddProject && (
          <div className="pt-2">
            <button
              onClick={onAddProject}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة قاعدة بيانات حقيقية الآن</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. MESSENGER CHAT-HEAD STYLE DATABASE BUBBLES BAR */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <h3 className="text-sm font-bold text-slate-900">
              قواعد البيانات المضافة فعلياً ({projects.length} من 10)
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              (اضغط على أيقونة القاعدة لعرض محتوياتها ومفاتيحها)
            </span>
          </div>

          {onAddProject && projects.length < 10 && (
            <button
              onClick={onAddProject}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة قاعدة أخرى</span>
            </button>
          )}
        </div>

        {/* Messenger Bubble Avatars Row */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {projects.map((proj) => {
            const isSelected = proj.id === selectedProject?.id;
            const isLeader = proj.is_current_leader;
            const isActive = proj.status === 'active';
            const hasFailures = (proj.failure_count || 0) > 0;

            return (
              <button
                key={proj.id}
                type="button"
                onClick={() => setSelectedProjectId(proj.id)}
                className={`group relative flex flex-col items-center gap-1.5 focus:outline-none transition-all duration-200 cursor-pointer shrink-0 p-2 rounded-2xl ${
                  isSelected
                    ? 'bg-blue-50/80 scale-105'
                    : 'hover:bg-slate-50 opacity-85 hover:opacity-100'
                }`}
              >
                {/* Outer Circular Avatar Badge */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center relative shadow-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-linear-to-tr from-blue-600 to-indigo-600 text-white ring-4 ring-blue-200 shadow-md'
                      : isActive
                      ? 'bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700 border border-slate-200'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <Database className="w-6 h-6" />

                  {/* Failure / Error Alert Badge (Opens error screen) */}
                  {hasFailures && (
                    <button
                      type="button"
                      title={`يوجد ${proj.failure_count} طلبات فاشلة. اضغط لفتح تقرير الأخطاء`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectId(proj.id);
                        onViewErrors?.(proj);
                      }}
                      className="absolute -top-1.5 -left-1.5 min-w-5 h-5 px-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full border-2 border-white flex items-center justify-center gap-0.5 shadow-md text-[10px] font-black cursor-pointer animate-pulse z-10"
                    >
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>{proj.failure_count}</span>
                    </button>
                  )}

                  {/* Leader Crown Badge */}
                  {isLeader && (
                    <span
                      title="القائد الحالي"
                      className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-amber-950 rounded-full border-2 border-white flex items-center justify-center shadow-xs"
                    >
                      <Crown className="w-3 h-3 fill-amber-950" />
                    </span>
                  )}

                  {/* Status Indicator Dot (Online / Offline) */}
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      isActive ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                </div>

                {/* Database Name Label */}
                <span
                  className={`text-xs font-bold max-w-20 truncate text-center transition-colors ${
                    isSelected ? 'text-blue-700' : 'text-slate-700'
                  }`}
                >
                  {proj.name}
                </span>

                {/* Priority Label & Quick Stats */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">
                    #{proj.priority_order}
                  </span>
                  {hasFailures ? (
                    <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 rounded-sm border border-rose-200">
                      {proj.failure_count} خطأ
                    </span>
                  ) : (
                    <span className="text-[9px] text-emerald-600 font-medium">
                      ✓ {proj.success_count || proj.request_count || 0}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Queue & Automatic Failover Rules Note */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-blue-800 font-medium bg-blue-50/80 px-3 py-1.5 rounded-xl border border-blue-100">
            <ArrowLeftRight className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>نظام الطوابير والتحويل التلقائي:</strong> كل قاعدة تعالج طلباً واحداً وتنتقل لنهاية الطابور. وفي حال فشلت أي قاعدة يُسجّل فشلها في السجل والأخطاء وتوضع في نهاية الطابور وتتحول المعالجة فوراً للقاعدة التالية دون انقطاع.
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
            ✓ معالجة مستمرة ومرنة
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SELECTED DATABASE INSPECTOR (Detailed View Upon Clicking Bubble)       */}
      {/* ========================================================================= */}
      {selectedProject && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Inspector Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    محتويات: {selectedProject.name}
                  </h2>
                  {selectedProject.is_current_leader && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                      القائد الحالي
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedProject.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {selectedProject.status === 'active' ? 'متصلة (Active)' : 'معطلة (Disabled)'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5" dir="ltr">
                  ID: {selectedProject.id}
                </p>
              </div>
            </div>

            {/* Quick Actions for Selected Database */}
            <div className="flex items-center flex-wrap gap-2">
              {/* Errors / Requests Report Button */}
              <button
                type="button"
                onClick={() => onViewErrors?.(selectedProject)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                  (selectedProject.failure_count || 0) > 0
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {(selectedProject.failure_count || 0) > 0 ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>تقرير الطلبات والأخطاء</span>
                {(selectedProject.failure_count || 0) > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                    {selectedProject.failure_count}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onTestProject?.(selectedProject)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>اختبار خط المعالجة</span>
              </button>

              <button
                type="button"
                onClick={() => onEdit(selectedProject)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>تعديل</span>
              </button>

              {!selectedProject.is_current_leader && selectedProject.status === 'active' && (
                <button
                  type="button"
                  onClick={() => onSetLeader(selectedProject)}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>تعيين كقائد</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onDelete(selectedProject)}
                title="حذف هذه القاعدة"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Inspector Body: Keys and Connection Checklist */}
          <div className="p-6 space-y-4">
            
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>فحص المفاتيح والروابط المرتبطة بهذه القاعدة:</span>
              </h4>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                قاعدة Supabase واحدة = مفتاح OCR واحد فقط (1:1)
              </span>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* 1. OCR API Key (R C R) */}
              <div className={`p-4 rounded-2xl border transition-all ${
                selectedProject.has_ocr_api_key
                  ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/40 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold">مفتاح OCR API المخصص:</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {selectedProject.has_ocr_api_key ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>مهيأ ومشفر بالخادم ✅</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>غير مهيأ ❌</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Secure Status Box */}
                <div className="mt-2.5 p-2 bg-white/90 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-2">
                  <div className="font-mono text-xs text-slate-700">
                    {selectedProject.has_ocr_api_key ? '•••••••••••••••• (محمي بالخادم الخلفي)' : 'لا يوجد مفتاح مسجل'}
                  </div>
                  {selectedProject.has_ocr_api_key ? (
                    <button
                      type="button"
                      onClick={() => onReplaceOcrKey(selectedProject)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      استبدال المفتاح
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAddOcrKey(selectedProject)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      + تعيين المفتاح
                    </button>
                  )}
                </div>

                <div className="mt-2 text-xs pt-1.5 border-t border-slate-200/60 text-slate-500 text-[11px]">
                  مفتاح OCR خاص بهذه القاعدة (علاقة 1:1 صارمة، لا يرسل للمتصفح مطلقاً).
                </div>
              </div>

              {/* 2. DeepSeek API (DIPC) - Shared system-level */}
              <div className={`p-4 rounded-2xl border transition-all ${
                keysStatus.hasDeepseekKey
                  ? 'bg-blue-50/40 border-blue-200 text-blue-900'
                  : 'bg-rose-50/40 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold">مفتاح DeepSeek العام (DIPC):</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {keysStatus.hasDeepseekKey ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>مهيأ ومشترك ✅</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>غير مهيأ ❌</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Secure Status Box */}
                <div className="mt-2.5 p-2 bg-white/90 border border-blue-200/80 rounded-xl flex items-center justify-between gap-2">
                  <div className="font-mono text-xs text-slate-700">
                    {keysStatus.hasDeepseekKey ? '•••••••••••••••• (محمي بالخادم الخلفي)' : 'المفتاح غير مضبوط في Secrets'}
                  </div>
                </div>

                <div className="mt-2 text-xs pt-1.5 border-t border-slate-200/60 text-slate-500 text-[11px]">
                  مفتاح ذكاء اصطناعي عام مشترك لجميع القواعد لمطابقة الأسئلة والأجوبة دلالياً.
                </div>
              </div>

              {/* 3. Supabase Project URL */}
              <div className="p-4 rounded-2xl border bg-slate-50/80 border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-800">رابط مشروع Supabase:</span>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>متاح ونشط ✅</span>
                  </span>
                </div>

                {/* URL display box */}
                <div className="mt-2.5 p-2 bg-white/90 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                  <span className="font-mono text-slate-800 text-xs truncate select-all" dir="ltr">
                    {selectedProject.project_url}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedProject.project_url, `url_${selectedProject.id}`)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0"
                  >
                    {copiedKeyName === `url_${selectedProject.id}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-2 text-xs pt-1.5 border-t border-slate-200/60 text-slate-500 text-[11px]">
                  نقطة النهاية الرئيسية (Endpoint) لقاعدة بيانات Supabase هذه.
                </div>
              </div>

              {/* 4. Service Role Key */}
              <div className={`p-4 rounded-2xl border transition-all ${
                selectedProject.has_service_role_key || keysStatus.hasServiceKey
                  ? 'bg-purple-50/40 border-purple-200 text-purple-900'
                  : 'bg-rose-50/40 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold">مفتاح Server Role (يحدد دور القاعدة):</span>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>مهيأ ومشفر بالخادم ✅</span>
                  </span>
                </div>

                {/* Key value display box */}
                <div className="mt-2.5 p-2 bg-white/90 border border-purple-200/80 rounded-xl flex items-center justify-between gap-2">
                  <div className="font-mono text-xs text-slate-700">
                    {selectedProject.has_service_role_key || keysStatus.hasServiceKey ? '•••••••••••••••• (محمي بالخادم)' : 'غير معين'}
                  </div>
                  {onReplaceServiceRoleKey && (
                    <button
                      type="button"
                      onClick={() => onReplaceServiceRoleKey(selectedProject)}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      استبدال المفتاح
                    </button>
                  )}
                </div>

                <div className="mt-2 text-xs pt-1.5 border-t border-slate-200/60 text-slate-500 text-[11px]">
                  يحدد الصلاحيات الإدارية الكاملة والدور القيادي لهذه القاعدة بالخادم حصراً.
                </div>
              </div>

            </div>

            {/* Load Usage, Success/Failure Breakdown & Limits */}
            <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">إحصائيات الطلبات ومعالجة الخط (Round-Robin):</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onViewErrors?.(selectedProject)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <span>عرض التفاصيل الكاملة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onResetLoad(selectedProject)}
                    title="تصفير عدادات القاعدة"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>تصفير</span>
                  </button>
                </div>
              </div>

              {/* Stat Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Total */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600">إجمالي الطلبات:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {selectedProject.request_count || 0} / {selectedProject.load_limit || 200}
                  </span>
                </div>

                {/* Successes */}
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-medium">الطلبات الناجحة:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {selectedProject.success_count !== undefined
                      ? selectedProject.success_count
                      : Math.max(0, (selectedProject.request_count || 0) - (selectedProject.failure_count || 0))}
                  </span>
                </div>

                {/* Failures */}
                <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  (selectedProject.failure_count || 0) > 0
                    ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <span className="text-xs font-medium">الطلبات الفاشلة:</span>
                  <span className={`font-mono font-bold text-sm ${
                    (selectedProject.failure_count || 0) > 0 ? 'text-rose-700 font-black' : 'text-slate-700'
                  }`}>
                    {selectedProject.failure_count || 0}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>معدل الاستهلاك نسبةً للحد الأقصى</span>
                  <span>{Math.round(((selectedProject.request_count || 0) / (selectedProject.load_limit || 200)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(((selectedProject.request_count || 0) / (selectedProject.load_limit || 200)) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
