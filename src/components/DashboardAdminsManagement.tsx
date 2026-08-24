import React, { useState, useEffect } from 'react';
import {
  Shield,
  UserCheck,
  UserX,
  UserPlus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Key,
  Clock,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  fetchDashboardAdmins,
  addDashboardAdminUser,
  revokeDashboardAdminUser,
  restoreDashboardAdminUser
} from '../api';

export function DashboardAdminsManagement() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{
    maxCapacity: number;
    activeCount: number;
    remainingSeats: number;
    isFull: boolean;
    activeAdmins: any[];
    revokedAdmins: any[];
    currentUserRole: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add modal / form
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newUserId, setNewUserId] = useState<string>('');
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  const loadAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboardAdmins();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'فشل جلب بيانات الحسابات الإدارية');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await addDashboardAdminUser({
        user_id: newUserId.trim(),
        display_name: newDisplayName.trim() || undefined,
        email: newEmail.trim() || undefined,
      });
      setSuccessMsg(res.message);
      setIsAddModalOpen(false);
      setNewUserId('');
      setNewDisplayName('');
      setNewEmail('');
      await loadAdmins();
    } catch (err: any) {
      setError(err.message || 'فشل إضافة المشرف');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (userId: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من إلغاء وتجميد الحساب الإداري للمشرف (${name})؟ سيتم تفريغ مقعد لإضافة حساب جديد.`)) {
      return;
    }
    setActionInProgressId(userId);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await revokeDashboardAdminUser(userId);
      setSuccessMsg(res.message);
      await loadAdmins();
    } catch (err: any) {
      setError(err.message || 'فشل إلغاء الحساب الإداري');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleRestore = async (userId: string, name: string) => {
    if (data?.isFull) {
      setError('تم استخدام الحسابات الإدارية الثلاثة (3/3). يجب إلغاء حساب إداري قديم أولاً قبل إعادة تفعيل هذا الحساب.');
      return;
    }
    setActionInProgressId(userId);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await restoreDashboardAdminUser(userId);
      setSuccessMsg(res.message);
      await loadAdmins();
    } catch (err: any) {
      setError(err.message || 'فشل استعادة الحساب');
    } finally {
      setActionInProgressId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Notification / Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-black cursor-pointer">×</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 font-black cursor-pointer">×</button>
        </div>
      )}

      {/* 1. SEATS STATUS CARD (3 ACTIVE ADMINS CAP) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-black flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                حماية المقاعد الإدارية (Dashboard Seats Security)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                الحد الأقصى: 3 حسابات نشطة
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900">
              إدارة حسابات مشرفي لوحة التحكم (Dashboard Admins)
            </h2>
            <p className="text-xs text-slate-500 max-w-xl">
              تطبيق سياسة الحماية الصارمة: يُسمح بـ 3 حسابات إدارية نشطة كحد أقصى. عند امتلاء المقاعد الثلاثة، يجب تعطيل أو إلغاء حساب إداري قديم أولاً قبل إضافة مشرف جديد.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={loadAdmins}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                if (data?.isFull) {
                  setError('تم استخدام الحسابات الإدارية الثلاثة (3/3). عطّل حساباً إدارياً قديماً أولاً قبل إضافة حساب جديد.');
                  return;
                }
                setIsAddModalOpen(true);
              }}
              disabled={data?.isFull}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm ${
                data?.isFull
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة مشرف جديد</span>
            </button>
          </div>
        </div>

        {/* Seats Visual Progress Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              المقاعد المستخدمة: <span className="text-indigo-700 font-black text-sm">{data?.activeCount || 0}</span> / 3
            </span>
            <span className={data?.isFull ? 'text-amber-700 font-black' : 'text-emerald-700 font-bold'}>
              {data?.isFull ? 'المقاعد ممتلئة بالكامل (3/3)' : `متاح: ${data?.remainingSeats || 0} مقعد`}
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ${
                data?.isFull ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${((data?.activeCount || 0) / 3) * 100}%` }}
            ></div>
          </div>

          {data?.isFull && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium flex items-center gap-2 mt-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>تنبيه:</strong> تم استخدام الحسابات الإدارية الثلاثة. عطّل حساباً إدارياً قديماً أولاً قبل إضافة حساب جديد.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. ACTIVE ADMINS LIST */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            الحسابات الإدارية النشطة حالياً ({data?.activeAdmins.length || 0})
          </h3>
          <span className="text-xs text-slate-400 font-medium">مستخرجة من Supabase A وموثقة في B</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data?.activeAdmins.map((admin) => {
            const isOwner = admin.role === 'owner';
            return (
              <div
                key={admin.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  isOwner
                    ? 'bg-gradient-to-b from-indigo-50/50 to-white border-indigo-200/80 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isOwner ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isOwner ? '👑' : '🛡️'}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          {admin.display_name}
                          {admin.is_current_user && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">أنت</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono" title={admin.user_id}>
                          ID: {admin.user_id_short}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isOwner
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {isOwner ? 'مالك المنظومة (Owner)' : 'مشرف (Admin)'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-0.5 border-t border-slate-100 pt-2 font-medium">
                    <div className="flex items-center justify-between">
                      <span>تاريخ الإضافة:</span>
                      <span className="text-slate-700 font-mono text-[10px]">
                        {new Date(admin.created_at).toLocaleDateString('ar-IQ')}
                      </span>
                    </div>
                    {admin.last_login_at && (
                      <div className="flex items-center justify-between">
                        <span>آخر نشاط:</span>
                        <span className="text-slate-700 font-mono text-[10px]">
                          {new Date(admin.last_login_at).toLocaleDateString('ar-IQ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Revoke / Manage Button */}
                <div className="pt-2 border-t border-slate-100">
                  {isOwner ? (
                    <div className="text-[11px] text-slate-400 italic flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>محمي: المالك الأساسي لا يمكن إلغاؤه من الواجهة</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRevoke(admin.user_id, admin.display_name)}
                      disabled={actionInProgressId === admin.user_id}
                      className="w-full py-1.5 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/60 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {actionInProgressId === admin.user_id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UserX className="w-3.5 h-3.5" />
                      )}
                      <span>تعطيل وإلغاء الحساب (تفريغ مقعد)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. REVOKED / INACTIVE ADMINS (CAN RESTORE IF SEAT AVAILABLE) */}
      {data?.revokedAdmins && data.revokedAdmins.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
            <UserX className="w-4 h-4 text-slate-400" />
            الحسابات الإدارية المعطلة / السابقة ({data.revokedAdmins.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {data.revokedAdmins.map((admin) => (
              <div key={admin.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs">
                    ✕
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 line-through">
                      {admin.display_name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {admin.user_id_short} • تم الإلغاء: {admin.revoked_at ? new Date(admin.revoked_at).toLocaleDateString('ar-IQ') : 'سابقاً'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRestore(admin.user_id, admin.display_name)}
                  disabled={actionInProgressId === admin.user_id || data.isFull}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    data.isFull
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                  title={data.isFull ? 'المقاعد ممتلئة (3/3)' : 'إعادة تفعيل الحساب'}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>إعادة التفعيل</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ADD ADMIN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">إضافة مشرف جديد للوحة التحكم</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  معرف المستخدم في منصة التعليم (User ID من Supabase A) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: e4b2d1c9-7f3a-4a2b-..."
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
                <span className="text-[10px] text-slate-400">
                  المعرف الفريد لحساب المستخدم الصادر من منصة Supabase A.
                </span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  اسم العرض الإداري
                </label>
                <input
                  type="text"
                  placeholder="مثال: أستاذ أحمد (مشرف المحتوى)"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  البريد الإلكتروني (اختياري للتحقق الإضافي)
                </label>
                <input
                  type="email"
                  placeholder="admin@platform.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 space-y-1">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                  <span>تأكيد الصلاحية:</span>
                </div>
                <p>
                  سيتم منح هذا الحساب صلاحيات مراجعة واعتماد المنشورات والبلاغات وإدارة المجتمع كأحد المشرفين الثلاثة المعتمدين.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newUserId.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/30"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الإضافة والتحقق...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تأكيد إضافة المشرف</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
