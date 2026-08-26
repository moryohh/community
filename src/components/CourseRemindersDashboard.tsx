import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BellRing, CalendarDays, Mail, RefreshCw, ShieldCheck, UserRound } from 'lucide-react';
import { CourseReminder, fetchCourseReminders, getStoredAuthToken } from '../api';

interface CourseRemindersDashboardProps {
  onBackToPortal: () => void;
  showToast?: (text: string, type?: 'success' | 'error') => void;
}

export const CourseRemindersDashboard: React.FC<CourseRemindersDashboardProps> = ({
  onBackToPortal,
  showToast,
}) => {
  const [reminders, setReminders] = useState<CourseReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReminders = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const result = await fetchCourseReminders(getStoredAuthToken());
      setReminders(result.reminders || []);
    } catch (requestError: any) {
      const message = requestError?.message || 'تعذر تحميل تذكيرات الدورات';
      setError(message);
      showToast?.(message, 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadReminders();
  }, [loadReminders]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" dir="rtl">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onBackToPortal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للبوابة
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-4 ring-emerald-50/70">
              <BellRing className="h-5 w-5" />
            </span>
            <div className="text-right">
              <h1 className="text-base font-black tracking-tight text-slate-900 sm:text-lg">إدارة تذكيرات الدورات</h1>
              <p className="text-[11px] text-slate-500">اهتمام الطلاب بالتقديم القادم</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-5 shadow-sm">
          <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/80 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                بيانات من جلسات Supabase A الموثقة
              </div>
              <h2 className="text-xl font-black text-slate-900">المهتمون بدورة شهر تشرين الثاني</h2>
              <p className="mt-1 max-w-2xl text-xs leading-6 text-slate-600">
                يعرض هذا القسم الأشخاص الذين ضغطوا «ذكرني عند فتح الدورة». لا يتم قبول الاسم أو البريد من الواجهة؛ الخادم يستخرجهما من حساب المستخدم الموثق.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-sm">
              <BellRing className="h-5 w-5 text-emerald-600" />
              <div>
                <div className="text-2xl font-black text-emerald-700">{reminders.length}</div>
                <div className="text-[10px] font-bold text-slate-500">إجمالي التذكيرات</div>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={() => void loadReminders(true)}
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              تحديث
            </button>
            <div className="flex items-center gap-2 text-right">
              <CalendarDays className="h-4 w-4 text-emerald-600" />
              <div>
                <h3 className="text-sm font-black text-slate-900">قائمة المهتمين</h3>
                <p className="text-[10px] text-slate-500">مرتبة من الأحدث إلى الأقدم</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-center text-slate-500">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
              <span className="text-xs font-bold">جاري تحميل تذكيرات الدورات...</span>
            </div>
          ) : error ? (
            <div className="m-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-right">
              <p className="text-xs font-bold text-amber-900">{error}</p>
              <p className="mt-1 text-[10px] leading-5 text-amber-800">تأكد من تشغيل جدول course_reminders في Supabase B وأن حسابك مشرف نشط.</p>
              <button
                type="button"
                onClick={() => void loadReminders(true)}
                className="mt-3 rounded-xl bg-amber-600 px-3 py-2 text-[11px] font-black text-white"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
              <BellRing className="h-8 w-8 text-slate-300" />
              <h3 className="text-sm font-black text-slate-700">لا توجد تذكيرات مسجلة بعد</h3>
              <p className="text-xs text-slate-500">ستظهر هنا بيانات الطلاب بعد ضغطهم على «ذكرني» في المنصة.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-right text-xs">
                <thead className="bg-slate-50 text-[11px] font-black text-slate-600">
                  <tr>
                    <th className="px-4 py-3">الطالب</th>
                    <th className="px-4 py-3">البريد الإلكتروني</th>
                    <th className="px-4 py-3">معرّف المستخدم</th>
                    <th className="px-4 py-3">الدورة</th>
                    <th className="px-4 py-3">تاريخ التذكير</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reminders.map((reminder) => (
                    <tr key={reminder.id} className="transition-colors hover:bg-emerald-50/40">
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="inline-flex items-center gap-2 font-bold text-slate-800">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                            <UserRound className="h-4 w-4" />
                          </span>
                          {reminder.user_name}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                          <Mail className="h-3.5 w-3.5 text-emerald-600" />
                          {reminder.user_email}
                        </span>
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3 font-mono text-[10px] text-slate-500" title={reminder.user_id}>
                        {reminder.user_id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-emerald-700">{reminder.course_title}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {new Date(reminder.created_at).toLocaleString('ar-IQ', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
