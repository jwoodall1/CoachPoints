'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';

import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    // Keep this response deliberately generic so the page does not reveal whether
    // an email address is registered (account enumeration protection).
    if (resetError) setError('We could not send a reset email right now. Please try again shortly.');
    else setMessage('If an account exists for that email, a password reset link is on its way.');
    setLoading(false);
  };

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>
        <h1 className="mt-8 text-3xl font-black tracking-tight text-slate-950">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Enter your account email and we’ll send a secure reset link.</p>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="block text-sm font-bold text-slate-700">
            <span className="mb-2 block">Email address</span>
            <span className="relative block">
              <Mail className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-400" />
              <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input pl-10" placeholder="you@example.com" />
            </span>
          </label>
          {error && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
          {message && <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
          <button disabled={loading} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60">
            {loading ? 'Sending…' : 'Email me a reset link'}
          </button>
          <p className="flex items-center justify-center gap-2 text-center text-xs font-medium text-slate-400"><ShieldCheck className="size-3.5" /> Reset links expire and can only be used once.</p>
        </form>
      </section>
    </main>
  );
}
