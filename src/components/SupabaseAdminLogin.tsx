import React, { FormEvent, useEffect, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { LogIn, LogOut, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { getSupabaseAClient } from '../lib/supabaseA';
import { setStoredAuthToken } from '../api';

interface SupabaseAdminLoginProps {
  onSessionChange: (token: string) => void;
}

export function SupabaseAdminLogin({ onSessionChange }: SupabaseAdminLoginProps) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    const initialize = async () => {
      const supabase = await getSupabaseAClient();
      if (!mounted) return;

      if (!supabase) {
        setError('تعذر تهيئة تسجيل الدخول. تأكد من AUTH_SUPABASE_A_URL و AUTH_SUPABASE_A_ANON_KEY في Secrets.');
        setIsChecking(false);
        return;
      }

      setClient(supabase);
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!mounted) return;

      if (sessionError) {
        setError(`تعذر قراءة جلسة Supabase A: ${sessionError.message}`);
      } else if (data.session?.access_token) {
        setSession(data.session);
        setStoredAuthToken(data.session.access_token);
        onSessionChange(data.session.access_token);
      }
      setIsChecking(false);

      const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!mounted) return;
        setSession(nextSession);
        const token = nextSession?.access_token || '';
        setStoredAuthToken(token);
        onSessionChange(token);
        if (nextSession) setError(null);
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    };

    initialize().catch((err: any) => {
      if (!mounted) return;
      setError(err?.message || 'تعذر تهيئة تسجيل الدخول إلى Supabase A.');
      setIsChecking(false);
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [onSessionChange]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!client) {
      setError('خدمة تسجيل الدخول غير جاهزة بعد. أعد المحاولة بعد لحظات.');
      return;
    }
    if (!email.trim() || !password) {
      setError('اكتب البريد الإلكتروني وكلمة المرور لحسابك في Supabase A.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const { data, error: signInError } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      if (!data.session?.access_token) {
        throw new Error('تم تسجيل الدخول دون إنشاء جلسة صالحة.');
      }
      setSession(data.session);
      setStoredAuthToken(data.session.access_token);
      onSessionChange(data.session.access_token);
      setPassword('');
    } catch (err: any) {
      setError(err?.message || 'فشل تسجيل الدخول إلى Supabase A.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    if (client) await client.auth.signOut();
    setSession(null);
    setStoredAuthToken('');
    onSessionChange('');
  };

  if (isChecking) {
    return (
      <div id="supabase-admin-login" className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-slate-200 flex items-center gap-2 text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
        <span>جاري التحقق من جلسة Supabase A...</span>
      </div>
    );
  }

  if (session) {
    return (
      <div id="supabase-admin-login" className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="font-bold text-sm">تم تسجيل الدخول إلى Supabase A</div>
            <div className="text-xs text-emerald-200/80">سيتم التحقق من كون الحساب مشرفاً نشطاً في جدول dashboard_admins داخل B عند تنفيذ الطلب.</div>
          </div>
        </div>
        <button type="button" onClick={handleSignOut} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-bold cursor-pointer">
          <LogOut className="w-3.5 h-3.5" />
          تسجيل الخروج
        </button>
      </div>
    );
  }

  return (
    <form id="supabase-admin-login" onSubmit={handleSubmit} className="rounded-2xl border border-amber-400/30 bg-slate-900 p-4 space-y-3 text-white">
      <div className="flex items-center gap-2">
        <LogIn className="w-5 h-5 text-amber-300" />
        <div>
          <div className="font-bold text-sm">تسجيل دخول المشرف</div>
          <div className="text-xs text-slate-300">استخدم حسابك في Supabase A. لا يتم تخزين كلمة المرور.</div>
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-950/40 p-2.5 text-xs text-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
          <span>{error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="البريد الإلكتروني في Supabase A" autoComplete="username" className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400" dir="ltr" />
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="كلمة المرور" autoComplete="current-password" className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400" dir="ltr" />
      </div>
      <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 px-4 py-2 text-sm font-bold cursor-pointer">
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
        {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول بأمان'}
      </button>
    </form>
  );
}
