'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Mode = 'sign-in' | 'sign-up';
type AccountType = 'athlete' | 'coach';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType] = useState<AccountType>(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('role') === 'coach' ? 'coach' : 'athlete');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  const selectMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === 'sign-up') {
      const publicUsername = username.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (publicUsername.length < 3) {
        setError('Choose a username with at least 3 letters or numbers.');
        setLoading(false);
        return;
      }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            username: publicUsername,
            account_type: accountType,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data.session) {
        router.push('/dashboard');
      } else {
        setMessage('Your account is ready. Check your email to confirm it, then sign in.');
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) setError(signInError.message);
      else router.push('/dashboard');
    }

    setLoading(false);
  };

  const isSignUp = mode === 'sign-up';

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_#1d4ed8_0%,_transparent_32%),radial-gradient(circle_at_bottom_right,_#0f766e_0%,_transparent_28%)] opacity-60" />
      <section className="w-full max-w-md rounded-3xl border border-white/15 bg-white p-6 shadow-2xl shadow-slate-950/40 sm:p-8">
        <div className="mb-8 text-center">
          <Image src="/athlio-mark.png" alt="Athlio" width={96} height={64} className="mx-auto mb-5 size-12 rounded-2xl object-cover shadow-lg shadow-blue-600/30" priority />
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Welcome to Athlio</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Manage your {accountType} profile and share your progress with confidence.</p>
        </div>

        <div className="mb-5 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3"><span className="text-sm font-semibold text-slate-700">Account type</span><span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">{accountType}</span></div>

        <div className="mb-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={!isSignUp} onClick={() => selectMode('sign-in')} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${!isSignUp ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Sign in</button>
          <button type="button" role="tab" aria-selected={isSignUp} onClick={() => selectMode('sign-up')} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isSignUp ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Create account</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name"><input value={firstName} onChange={(event) => setFirstName(event.target.value)} className="input" placeholder="John" required /></Field>
              <Field label="Last name"><input value={lastName} onChange={(event) => setLastName(event.target.value)} className="input" placeholder="Doe" required /></Field>
            </div>
          )}
          {isSignUp && <Field label="Username"><input value={username} onChange={(event) => setUsername(event.target.value)} className="input" placeholder="john-doe" autoComplete="username" required /><span className="mt-2 block text-xs text-slate-500">This becomes your permanent public profile handle.</span></Field>}
          <Field label="Email address"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input" placeholder="athlete@example.com" autoComplete="email" required /></Field>
          <Field label="Password"><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="input" placeholder="At least 8 characters" autoComplete={isSignUp ? 'new-password' : 'current-password'} minLength={8} required /></Field>

          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}

          <button disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Please wait…' : isSignUp ? 'Create your account' : 'Sign in to your dashboard'}
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700"><span className="mb-2 block">{label}</span>{children}</label>;
}
