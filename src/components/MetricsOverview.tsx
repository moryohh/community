import React from 'react';
import {
  Crown,
  Database,
  CheckCircle2,
  XCircle,
  Sparkles,
  Key,
  ShieldCheck,
  Cpu,
  Plus,
  RefreshCw,
  Trash2,
  Zap,
  Play,
  Terminal,
  Layers,
} from 'lucide-react';
import { OcrProject, SupabaseConnectionStatus, SystemKeysStatus } from '../types';

interface MetricsOverviewProps {
  projects: OcrProject[];
  connectionStatus: SupabaseConnectionStatus | null;
  keysStatus: SystemKeysStatus;
  onOpenSettings: () => void;
  onQuickLeaderSwitch: (id: string) => void;
  onManageDeepseekKey: () => void;
  onRemoveDeepseekKey: () => void;
  onOpenAddBaseModal?: () => void;
  onOpenTestModal?: () => void;
  onOpenSqlModal?: () => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  projects,
  connectionStatus,
  keysStatus,
  onOpenSettings,
  onQuickLeaderSwitch,
  onManageDeepseekKey,
  onRemoveDeepseekKey,
  onOpenAddBaseModal,
  onOpenTestModal,
  onOpenSqlModal,
}) => {
  const leaderProject = projects.find((p) => p.is_current_leader);
  const activeProjects = projects.filter((p) => p.status === 'active');
  const totalProjects = projects.length;
  const projectsWithOcrKey = projects.filter((p) => p.has_ocr_api_key).length;

  return (
    <div className="space-y-4">
      
      {/* Top Banner: Supabase Connection Mode */}
      {connectionStatus && (
        <div
          className={`px-4 py-2.5 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
            connectionStatus.mode === 'live_supabase' && connectionStatus.isTableFound
              ? 'bg-blue-50/60 border-blue-200 text-blue-900'
              : connectionStatus.mode === 'live_supabase' && !connectionStatus.isTableFound
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus.mode === 'live_supabase' && connectionStatus.isTableFound
                  ? 'bg-blue-600 animate-pulse'
                  : connectionStatus.mode === 'live_supabase'
                  ? 'bg-amber-500'
                  : 'bg-slate-400'
              }`}
            />
            <span className="font-bold">
              {connectionStatus.mode === 'live_supabase' && connectionStatus.isTableFound
                ? 'قاعدة Supabase متصلة ومباشرة (جدول ocr_projects)'
                : connectionStatus.mode === 'live_supabase'
                ? 'متصل بالـ Service Role (يرجى تنفيذ كود SQL Schema لإنشاء الجدول)'
                : 'الوضع المحلي (In-memory) - يمكنك إدخال مفتاح Service Role للربط المباشر'}
            </span>
            {connectionStatus.supabaseUrl && (
              <span
                className="font-mono text-[11px] text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded truncate max-w-xs"
                dir="ltr"
              >
                {connectionStatus.supabaseUrl}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSettings}
              className="text-xs font-semibold text-blue-800 hover:text-blue-950 underline underline-offset-2 shrink-0 cursor-pointer"
            >
              إعدادات المفاتيح والنظام
            </button>
          </div>
        </div>
      )}

      {/* Main Top Control & Status Grid (Soft Blue & Soft Amber Theme) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Box 1: Real Bases Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                <span>إجمالي القواعد الفعلية</span>
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono font-bold">
                الحد: 10
              </span>
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {totalProjects} <span className="text-slate-400 text-xs font-normal">/ 10 قواعد</span>
              </div>
              <div className="text-xs text-slate-500">
                <strong className="text-blue-600 font-mono">{activeProjects.length}</strong> نشطة
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>مفاتيح OCR المهيأة:</span>
              </span>
              <span className="font-mono font-bold text-slate-800">
                {projectsWithOcrKey} / {totalProjects}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              {totalProjects === 0
                ? 'لا توجد قواعد وهمية.'
                : leaderProject
                ? `القائد: ${leaderProject.name}`
                : 'جاهز للاستخدام'}
            </span>
            <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded text-[10px]">
              1 قاعدة = 1 OCR
            </span>
          </div>
        </div>

        {/* Box 2: Dedicated DeepSeek API Section (Single Shared Instance Across All Bases) */}
        <div className={`rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
          keysStatus.hasDeepseekKey
            ? 'bg-blue-50/30 border-blue-200'
            : 'bg-amber-50/40 border-amber-200'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">DeepSeek API العام</span>
              </div>
              <span className="text-[10px] text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded font-semibold">
                مشترك للنظام كله
              </span>
            </div>

            {/* Status: Connected or Not Configured */}
            <div className="mt-2.5">
              {keysStatus.hasDeepseekKey ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>DeepSeek API: ✓ متصل ومفعل</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>DeepSeek API: ✕ غير مضاف</span>
                </div>
              )}
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                مفتاح عام موحد تستخدمه جميع القواعد لمطابقة وتحليل النصوص المستخرجة من الـ OCR.
              </p>
            </div>
          </div>

          {/* DeepSeek Actions */}
          <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between gap-1">
            {keysStatus.hasDeepseekKey ? (
              <>
                <button
                  type="button"
                  onClick={onManageDeepseekKey}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>استبدال المفتاح</span>
                </button>
                <button
                  type="button"
                  onClick={onRemoveDeepseekKey}
                  title="حذف المفتاح"
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onManageDeepseekKey}
                className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مفتاح DeepSeek API</span>
              </button>
            )}
          </div>
        </div>

        {/* Box 3: Quick Action Center (Add Base, Test Pipeline, SQL Schema) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>العمليات السريعة</span>
              </span>
              <span className="text-[10px] text-slate-400">لوحة التحكم</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              إضافة قواعد جديدة، اختبار سلامة خط المعالجة، ونسخ كود SQL Schema لإنشاء الجداول في Supabase.
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {onOpenAddBaseModal && (
              <button
                type="button"
                onClick={onOpenAddBaseModal}
                disabled={totalProjects >= 10}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ إضافة قاعدة</span>
              </button>
            )}

            {onOpenTestModal && (
              <button
                type="button"
                onClick={onOpenTestModal}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
                <span>اختبار القواعد</span>
              </button>
            )}

            {onOpenSqlModal && (
              <button
                type="button"
                onClick={onOpenSqlModal}
                className="col-span-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>عرض / نسخ SQL Schema لـ Supabase</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
