'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LockKeyhole } from 'lucide-react';

import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setReady(Boolean(session));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN')) setReady(Boolean(session));
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (password.length < 8) return setError('Use at least 8 characters.');
    if (password !== confirmation) return setError('Passwords do not match.');
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError('This reset link is invalid or expired. Request a new one and try again.');
    else {
      setMessage('Your password has been updated. You can now sign in with the new password.');
      await supabase.auth.signOut();
    }
    setSaving(false);
  };

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800"><ArrowLeft className="size-4" /> Back to sign in</Link>
        <h1 className="mt-8 text-3xl font-black tracking-tight text-slate-950">Choose a new password</h1>
        {!ready ? <p className="mt-3 text-sm leading-6 text-slate-500">Open this page from the reset link in your email. If the link expired, request a new one.</p> : (
          <form onSubmit={submit} className="mt-7 space-y-5">
            <PasswordField label="New password" value={password} onChange={setPassword} autoComplete="new-password" />
            <PasswordField label="Confirm new password" value={confirmation} onChange={setConfirmation} autoComplete="new-password" />
            {error && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
            {message && <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
            <button disabled={saving} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60">{saving ? 'Updating…' : 'Update password'}</button>
          </form>
        )}
      </section>
    </main>
  );
}

function PasswordField({ label, value, onChange, autoComplete }: { label: string; value: string; onChange: (value: string) => void; autoComplete: string }) {
  return <label className="block text-sm font-bold text-slate-700"><span className="mb-2 block">{label}</span><span className="relative block"><LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-400" /><input type="password" required minLength={8} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} className="input pl-10" /></span></label>;
}
