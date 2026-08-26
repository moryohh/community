import React from 'react';
import {
  ScanText,
  Users,
  Database,
  ArrowLeft,
  Sparkles,
  Shield,
  Layers,
  Globe,
  FlaskConical,
  MessageSquare,
  Share2,
  Cpu,
  Zap,
  TrendingUp,
  BellRing,
  Mail,
  User,
  ExternalLink,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import { OcrProject, SupabaseConnectionStatus, SystemKeysStatus } from '../types';

interface PersonalPortalProps {
  onNavigate: (view: 'ocr' | 'community' | 'admin_login') => void;
  projects: OcrProject[];
  connectionStatus: SupabaseConnectionStatus | null;
  keysStatus: SystemKeysStatus;
  onOpenQuickTest?: () => void;
}

export const PersonalPortal: React.FC<PersonalPortalProps> = ({
  onNavigate,
  projects,
  connectionStatus,
  keysStatus,
  onOpenQuickTest,
}) => {
  const activeBasesCount = projects.filter((p) => p.status === 'active').length;
  const leaderBase = projects.find((p) => p.is_current_leader);
  const totalRequests = projects.reduce((acc, p) => acc + (p.request_count || 0), 0);
  const totalSuccess = projects.reduce((acc, p) => acc + (p.success_count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 text-slate-800 flex flex-col font-sans" dir="rtl">
      
      {/* Top Banner / Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>المساحة الشخصية المركزية</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  لوحة الدخول والتحكم
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                بوابة الوصول لمنظومة OCR والمجتمع وإدارة تذكيرات الدورات التعليمية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>الحالة: النظام متصل وجاهز</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Welcome Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
          <span>اختر المنظومة التي ترغب بالعمل عليها</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          مرحباً بك في لوحة تحكمك الشخصية
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          تم تصميم هذه المساحة كمدخل موحد للوصول إلى أدوات OCR، ومساحة المجتمع، وإدارة اهتمام الطلاب بالدورات التعليمية.
        </p>
      </div>

      {/* Main Two Interactive Cards Grid */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* CARD 1: OCR SYSTEM */}
          <div
            id="card-ocr-system"
            onClick={() => onNavigate('ocr')}
            className="group relative bg-white rounded-3xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 p-7 flex flex-col justify-between cursor-pointer overflow-hidden"
          >
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 group-hover:h-2.5 transition-all"></div>

            <div className="space-y-5">
              {/* Icon & Badge Header */}
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 flex items-center justify-center shadow-inner group-hover:scale-105">
                  <ScanText className="w-8 h-8" />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    <Database className="w-3.5 h-3.5 text-blue-600" />
                    <span>جاهزة للاستخدام</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    {activeBasesCount} قواعد نشطة
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                  <span>OCR</span>
                  <span className="text-xs font-medium text-slate-400 font-mono">(نظام المعالجة والتوزيع)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  منظومة معالجة الصور واستخراج النصوص الذكية، توزيع الحمل التلقائي بنظام الطوابير بين قواعد Supabase، وبوابة الربط البرمجية (API Gateway) والمقارنة الدلالية عبر DeepSeek.
                </p>
              </div>

              {/* Key Features Bullet List */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>توزيع الحمل بالطوابير</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>بوابة الـ API الخارجية</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>مختبر فحص ومقارنة OCR</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>تحويل تلقائي عند التعثر</span>
                </div>
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                إجمالي المعالجات: <strong className="text-slate-800 font-bold font-mono">{totalRequests}</strong>
              </span>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 group-hover:translate-x-[-2px] transition-all">
                <span>الدخول إلى أداة OCR</span>
                <ArrowLeft className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* CARD 2: COMMUNITY HUB */}
          <div
            id="card-community-hub"
            onClick={() => onNavigate('community')}
            className="group relative bg-white rounded-3xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 p-7 flex flex-col justify-between cursor-pointer overflow-hidden"
          >
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 group-hover:h-2.5 transition-all"></div>

            <div className="space-y-5">
              {/* Icon & Badge Header */}
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 flex items-center justify-center shadow-inner group-hover:scale-105">
                  <Users className="w-8 h-8" />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Facebook Feed & Base 1</span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    مخزن في Base 1 (OCR 1)
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                  <span>مجتمع</span>
                  <span className="text-xs font-medium text-slate-400 font-mono">(صفحة الفيسبوك وسحب الـ API)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  بيئة جديدة تشبه صفحة الفيسبوك لسحب المنشورات والتعليقات الحية عبر Facebook API المدفوع، وأرشفتها وتخزينها بالكامل كقاعدة داخل القاعدة الأولى (Base 1 - OCR 1).
                </p>
              </div>

              {/* Key Features Bullet List */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>سحب المنشورات والتعليقات</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>تخزين تلقائي في Base 1 (OCR 1)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>ربط API فيسبوك المدفوع</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>واجهة تفاعلية تشبه الفيسبوك</span>
                </div>
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                الحاضنة: <strong className="text-emerald-700 font-bold">Base 1 (OCR 1)</strong>
              </span>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 group-hover:translate-x-[-2px] transition-all">
                <span>الدخول إلى مجتمع الفيسبوك</span>
                <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* CARD 3: COURSE REMINDERS */}
            <div
              id="card-course-reminders"
              onClick={() => onNavigate('admin_login')}
              className="group relative overflow-hidden rounded-3xl border-2 border-emerald-200 bg-white p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10"
            >
              <div className="absolute left-0 right-0 top-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all group-hover:h-2.5" />
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner transition-all duration-300 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white">
                    <BellRing className="h-8 w-8" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    إدارة خاصة
                  </span>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
                    <span>إدارة الدورات</span>
                    <span className="font-mono text-xs font-medium text-slate-400">(تذكيرات الطلاب)</span>
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    تابع عدد الطلاب المهتمين بدورة شهر تشرين الثاني، واعرض أسماءهم وبريدهم ومعرّفاتهم بعد تسجيل تذكير موثق.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <BellRing className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>تذكيرات التقديم</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>هوية موثقة</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>بريد الطالب</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>سجل منظم</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-xs font-semibold text-slate-500">محمي بصلاحية المشرف</span>
                <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all group-hover:bg-emerald-700 group-hover:translate-x-[-2px]">
                  <span>فتح إدارة الدورات</span>
                  <ArrowLeft className="h-4 w-4" />
                </div>
              </div>
            </div>

          </div>

          {/* Quick System Summary Footer Widget */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Shield className="w-4 h-4 text-slate-700" />
            </div>
            <div>
              <p className="font-bold text-slate-800">بيئة تشغيل آمنة ومتصلة</p>
              <p className="text-slate-500 text-[11px]">
                {connectionStatus?.connected
                  ? `متصل بـ Supabase (${connectionStatus.project_name || 'Active'}) • ${projects.length} قواعد مسجلة`
                  : `الوضع المحلي النشط • ${projects.length} قواعد مسجلة`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={() => onNavigate('ocr')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold transition-colors cursor-pointer"
            >
              فتح لوحة OCR
            </button>
            <button
              onClick={() => onNavigate('community')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold transition-colors cursor-pointer"
            >
              فتح ساحة المجتمع
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          المساحة الشخصية المركزية • نظام OCR & منصة المجتمع التفاعلية
        </div>
      </footer>

    </div>
  );
};
