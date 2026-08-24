import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Database,
  Trash2,
  FileQuestion,
  Activity,
} from 'lucide-react';
import { OcrProject } from '../types';

interface BaseErrorsModalProps {
  project: OcrProject | null;
  isOpen: boolean;
  onClose: () => void;
  onResetErrors: (projectId: string) => Promise<void>;
  onResetAllLoad: (projectId: string) => Promise<void>;
}

export const BaseErrorsModal: React.FC<BaseErrorsModalProps> = ({
  project,
  isOpen,
  onClose,
  onResetErrors,
  onResetAllLoad,
}) => {
  const [isActionLoading, setIsActionLoading] = useState(false);

  if (!isOpen || !project) return null;

  const total = project.request_count || 0;
  const failures = project.failure_count || 0;
  const successes = project.success_count !== undefined 
    ? project.success_count 
    : Math.max(0, total - failures);

  const successRate = total > 0 ? Math.round((successes / total) * 100) : 100;
  const errorsList = project.recent_errors || [];

  const handleClearErrors = async () => {
    setIsActionLoading(true);
    try {
      await onResetErrors(project.id);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResetCounters = async () => {
    setIsActionLoading(true);
    try {
      await onResetAllLoad(project.id);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs ${
              failures > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {failures > 0 ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  تقرير أداء وطلبات: {project.name}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-semibold">
                  #{project.priority_order}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                إحصائيات تفصيلية لجميع الطلبات الناجحة والفاشلة الموجهة لهذه القاعدة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-3 gap-3.5">
            {/* Total Requests */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-700 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-bold">إجمالي الطلبات</span>
              </div>
              <div className="text-2xl font-black text-blue-950 font-mono">
                {total}
              </div>
              <div className="text-[10px] text-blue-600 font-medium mt-0.5">
                الحد: {project.load_limit}
              </div>
            </div>

            {/* Successful Requests */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-700 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold">طلبات ناجحة</span>
              </div>
              <div className="text-2xl font-black text-emerald-950 font-mono">
                {successes}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                نسبة النجاح: {successRate}%
              </div>
            </div>

            {/* Failed Requests */}
            <div className={`p-4 rounded-2xl text-center border transition-all ${
              failures > 0 
                ? 'bg-rose-50/80 border-rose-300 text-rose-950 ring-2 ring-rose-200' 
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <div className={`flex items-center justify-center gap-1 mb-1 ${
                failures > 0 ? 'text-rose-700 font-bold' : 'text-slate-500'
              }`}>
                <XCircle className="w-4 h-4" />
                <span className="text-xs font-bold">طلبات فاشلة</span>
              </div>
              <div className={`text-2xl font-black font-mono ${
                failures > 0 ? 'text-rose-700' : 'text-slate-800'
              }`}>
                {failures}
              </div>
              <div className="text-[10px] text-rose-600 font-medium mt-0.5">
                {failures > 0 ? 'يتطلب الانتباه' : 'لا توجد أخطاء'}
              </div>
            </div>
          </div>

          {/* Last Failure Alert Banner (if exists) */}
          {project.last_failure_reason && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="font-bold text-rose-950">
                  آخر سبب فشل مسجل:
                </div>
                <div className="font-mono text-rose-800 bg-white/80 p-2 rounded-xl border border-rose-200/80" dir="ltr">
                  {project.last_failure_reason}
                </div>
                {project.last_failure_at && (
                  <div className="text-[11px] text-rose-600 flex items-center gap-1 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>حدث بتاريخ: {new Date(project.last_failure_at).toLocaleString('ar-SA')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detailed Error Logs Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileQuestion className="w-4 h-4 text-slate-600" />
                <span>سجل الطلبات الفاشلة بالتفصيل ({errorsList.length}):</span>
              </h4>

              {failures > 0 && (
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={handleClearErrors}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>مسح سجل الأخطاء فقط</span>
                </button>
              )}
            </div>

            {errorsList.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">
                  سجل الأخطاء نظيف بالكامل
                </p>
                <p className="text-[11px] text-slate-500">
                  لم يتم تسجيل أي طلب فاشل على هذه القاعدة، وتتم معالجة الطلبات بسلاسة.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {errorsList.map((err, i) => (
                  <div
                    key={err.id || i}
                    className="p-3 bg-white rounded-xl border border-rose-100 shadow-2xs space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span className="font-mono text-slate-700 font-semibold" dir="ltr">
                        {err.id}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(err.timestamp).toLocaleTimeString('ar-SA')}
                      </span>
                    </div>

                    {err.question && (
                      <div className="text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 font-medium">
                        <span className="text-slate-400 text-[10px] ml-1">السؤال:</span>
                        {err.question}
                      </div>
                    )}

                    <div className="text-rose-700 font-mono text-[11px] bg-rose-50/70 p-1.5 rounded-lg border border-rose-100" dir="ltr">
                      {err.error}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={isActionLoading}
            onClick={handleResetCounters}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>تصفير جميع عدادات القاعدة</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
