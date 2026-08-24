import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Server,
  Key,
  Eye,
  FileText,
  Sparkles,
  ShieldCheck,
  CheckSquare,
  Square,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { OcrProject, BaseTestReport } from '../types';
import * as api from '../api';

interface BaseTestingModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: OcrProject[];
  initialSelectedProjectId?: string | null;
}

export const BaseTestingModal: React.FC<BaseTestingModalProps> = ({
  isOpen,
  onClose,
  projects,
  initialSelectedProjectId,
}) => {
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(() => {
    if (initialSelectedProjectId) return [initialSelectedProjectId];
    return projects.map((p) => p.id);
  });
  const [isRunning, setIsRunning] = useState(false);
  const [reports, setReports] = useState<Record<string, BaseTestReport>>({});
  const [currentTestingId, setCurrentTestingId] = useState<string | null>(null);

  // Sync initial selection when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (initialSelectedProjectId) {
        setSelectedProjectIds([initialSelectedProjectId]);
      } else if (selectedProjectIds.length === 0 && projects.length > 0) {
        setSelectedProjectIds(projects.map((p) => p.id));
      }
    }
  }, [isOpen, initialSelectedProjectId, projects]);

  if (!isOpen) return null;

  const toggleSelectProject = (id: string) => {
    if (isRunning) return;
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (isRunning) return;
    if (selectedProjectIds.length === projects.length) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(projects.map((p) => p.id));
    }
  };

  const handleRunTests = async () => {
    if (selectedProjectIds.length === 0) return;
    setIsRunning(true);
    const newReports: Record<string, BaseTestReport> = { ...reports };

    for (const pId of selectedProjectIds) {
      setCurrentTestingId(pId);
      try {
        const rep = await api.testProject(pId);
        newReports[pId] = rep;
        setReports({ ...newReports });
      } catch (err: any) {
        const targetProj = projects.find((p) => p.id === pId);
        newReports[pId] = {
          projectId: pId,
          projectName: targetProj?.name || 'قاعدة OCR',
          steps: {
            supabaseConnection: { ok: false, message: 'فشل الاتصال' },
            serviceRole: { ok: false, message: 'فشل مفتاح الصلاحيات' },
            ocrApi: { ok: false, message: 'فشل OCR' },
            textExtraction: { ok: false, message: 'لم يتم استخراج النص' },
            deepseek: { ok: false, message: 'فشل استدعاء DeepSeek' },
          },
          finalVerdict: {
            success: false,
            message: err.message || 'حدث خطأ أثناء فحص القاعدة',
          },
        };
        setReports({ ...newReports });
      }
    }

    setCurrentTestingId(null);
    setIsRunning(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Play className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                اختبار قواعد Supabase والتحقق من سلامة خط المعالجة
              </h2>
              <p className="text-xs text-slate-500">
                فحص اتصال قاعدة Supabase، صلاحية Service Role، مفتاح OCR المخصص للقاعدة، واستجابة DeepSeek العام
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Base Selection Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200/80">
              <span className="text-xs font-bold text-slate-700">
                اختر قواعد Supabase المراد اختبارها ({selectedProjectIds.length} من {projects.length})
              </span>
              <button
                type="button"
                onClick={toggleSelectAll}
                disabled={isRunning || projects.length === 0}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {selectedProjectIds.length === projects.length ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" />
                    إلغاء تحديد الكل
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    تحديد جميع قواعد Supabase
                  </>
                )}
              </button>
            </div>

            {projects.length === 0 ? (
              <p className="text-xs text-slate-500 py-2 text-center">
                لا توجد قواعد Supabase مضافة حالياً لاختبارها. يرجى إضافة قاعدة أولاً.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {projects.map((proj) => {
                  const isSelected = selectedProjectIds.includes(proj.id);
                  const isCurrent = currentTestingId === proj.id;
                  const hasRep = Boolean(reports[proj.id]);
                  const isOk = reports[proj.id]?.finalVerdict.success;

                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => toggleSelectProject(proj.id)}
                      disabled={isRunning}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-right transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-blue-400 shadow-2xs ring-1 ring-blue-100'
                          : 'bg-white/60 border-slate-200 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <CheckSquare className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {proj.name}
                            </p>
                            {proj.is_current_leader && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                👑 القائد
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                            <span>أولوية #{proj.priority_order}</span>
                            <span>•</span>
                            <span className={proj.has_service_role_key ? "text-emerald-600 font-bold" : "text-amber-600 font-medium"}>
                              {proj.has_service_role_key ? "Service Role ✓" : "SR Key"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Icon */}
                      {isCurrent ? (
                        <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                      ) : hasRep ? (
                        isOk ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleRunTests}
              disabled={isRunning || selectedProjectIds.length === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري اختبار القواعد المحددة...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  بدء اختبار القواعد المحددة ({selectedProjectIds.length})
                </>
              )}
            </button>

            {Object.keys(reports).length > 0 && (
              <span className="text-xs text-slate-500 font-medium">
                تم فحص {Object.keys(reports).length} قاعدة
              </span>
            )}
          </div>

          {/* Results List */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              نتائج الفحص التفصيلي:
            </h3>

            {Object.keys(reports).length === 0 && !isRunning && (
              <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                اضغط على زر "بدء اختبار القواعد" لإجراء فحص حي لخط المعالجة واستخراج النصوص.
              </div>
            )}

            {selectedProjectIds.map((pId) => {
              const report = reports[pId];
              const project = projects.find((p) => p.id === pId);
              if (!report && currentTestingId !== pId) return null;

              if (currentTestingId === pId) {
                return (
                  <div
                    key={pId}
                    className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 animate-pulse flex items-center justify-between text-xs font-medium text-blue-900"
                  >
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>جاري فحص وتجربة {project?.name || 'القاعدة'}...</span>
                    </div>
                    <span className="text-[11px] text-blue-700">إرسال عينة صورة إلى OCR وتحليل DeepSeek</span>
                  </div>
                );
              }

              if (!report) return null;

              const { steps, finalVerdict, totalDurationMs } = report;

              return (
                <div
                  key={pId}
                  className={`p-4 rounded-xl border transition-all ${
                    finalVerdict.success
                      ? 'bg-white border-emerald-200 shadow-2xs'
                      : 'bg-white border-rose-200 shadow-2xs'
                  }`}
                >
                  {/* Card Title & Verdict */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          finalVerdict.success
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {report.projectName}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {totalDurationMs ? `${totalDurationMs}ms` : ''}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        finalVerdict.success
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {finalVerdict.success ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>جاهزة وتعمل بنجاح</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>يوجد خطأ في الفحص</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 5-Step Pipeline Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                    
                    {/* 1. Supabase Connection */}
                    <div
                      className={`p-2 rounded-lg border ${
                        steps.supabaseConnection.ok
                          ? 'bg-slate-50/80 border-slate-200 text-slate-800'
                          : 'bg-rose-50/60 border-rose-200 text-rose-800'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold mb-0.5">
                        {steps.supabaseConnection.ok ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                        )}
                        <span>1. الاتصال</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {steps.supabaseConnection.message}
                      </p>
                    </div>

                    {/* 2. Service Role */}
                    <div
                      className={`p-2 rounded-lg border ${
                        steps.serviceRole.ok
                          ? 'bg-slate-50/80 border-slate-200 text-slate-800'
                          : 'bg-rose-50/60 border-rose-200 text-rose-800'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold mb-0.5">
                        {steps.serviceRole.ok ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                        )}
                        <span>2. Service Role</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {steps.serviceRole.message}
                      </p>
                    </div>

                    {/* 3. OCR API */}
                    <div
                      className={`p-2 rounded-lg border ${
                        steps.ocrApi.ok
                          ? 'bg-slate-50/80 border-slate-200 text-slate-800'
                          : 'bg-rose-50/60 border-rose-200 text-rose-800'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold mb-0.5">
                        {steps.ocrApi.ok ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                        )}
                        <span>3. OCR API</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {steps.ocrApi.message}
                      </p>
                    </div>

                    {/* 4. Text Extraction */}
                    <div
                      className={`p-2 rounded-lg border ${
                        steps.textExtraction.ok
                          ? 'bg-slate-50/80 border-slate-200 text-slate-800'
                          : 'bg-rose-50/60 border-rose-200 text-rose-800'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold mb-0.5">
                        {steps.textExtraction.ok ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                        )}
                        <span>4. استخراج النص</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {steps.textExtraction.message}
                      </p>
                    </div>

                    {/* 5. DeepSeek API */}
                    <div
                      className={`p-2 rounded-lg border col-span-2 sm:col-span-1 ${
                        steps.deepseek.ok
                          ? 'bg-slate-50/80 border-slate-200 text-slate-800'
                          : 'bg-rose-50/60 border-rose-200 text-rose-800'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold mb-0.5">
                        {steps.deepseek.ok ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                        )}
                        <span>5. DeepSeek</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {steps.deepseek.message}
                      </p>
                    </div>
                  </div>

                  {/* Summary note if error */}
                  {!finalVerdict.success && finalVerdict.message && (
                    <div className="mt-2.5 p-2 bg-rose-50 border border-rose-100 rounded-lg text-[11px] text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{finalVerdict.message}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
