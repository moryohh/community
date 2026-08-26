import React, { useState } from 'react';
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { SupabaseAdminLogin } from './SupabaseAdminLogin';

interface AdminLoginPageProps {
  onAuthenticated: () => void;
  onBackToPortal: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAuthenticated, onBackToPortal }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSessionChange = (token: string) => {
    const authenticated = Boolean(token.trim());
    setIsAuthenticated(authenticated);
    if (authenticated) onAuthenticated();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-6 text-white" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col justify-center">
        <button
          type="button"
          onClick={onBackToPortal}
          className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-slate-100 transition-colors hover:bg-white/15"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى البوابة
        </button>

        <section className="overflow-hidden rounded-3xl border border-emerald-400/20 bg-slate-900/85 shadow-2xl shadow-emerald-950/30 backdrop-blur-md">
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />
          <div className="space-y-6 p-5 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300 ring-8 ring-emerald-400/5">
                <LockKeyhole className="h-8 w-8" />
              </div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                صفحة المشرف الشخصية
              </div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">تسجيل دخول لوحة إدارة الدورات</h1>
              <p className="mt-2 max-w-lg text-xs leading-6 text-slate-300 sm:text-sm">
                سجّل الدخول أولًا بحسابك الإداري في Supabase A، وبعد نجاح التحقق ستنتقل تلقائيًا إلى Dashboard B.
              </p>
            </div>

            <SupabaseAdminLogin onSessionChange={handleSessionChange} />

            {isAuthenticated && (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-center text-[11px] font-bold text-emerald-200">
                تم التحقق، جارٍ فتح لوحة الإدارة...
              </div>
            )}

            <p className="text-center text-[10px] leading-5 text-slate-400">
              لا يتم حفظ كلمة المرور هنا. تُستخدم الجلسة الموثقة فقط للتحقق من صلاحية المشرف.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
