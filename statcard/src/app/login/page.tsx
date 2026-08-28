'use client';

import { FormEvent, Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, AtSign, Check, Dumbbell, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Trophy, UserRound } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';

type Mode = 'sign-in' | 'sign-up';
type AccountType = 'athlete' | 'coach';
const reservedUsernames = new Set(['api', 'coach-dashboard', 'coach-lists', 'dashboard', 'friends', 'login', 'messages']);

export default function LoginPage() {
  return <Suspense fallback={<main className="loading-shell"><p>Preparing secure access…</p></main>}><LoginForm /></Suspense>;
}

/** Handles athlete and coach sign-in or registration against Supabase Auth. */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const accountType: AccountType = searchParams.get('role') === 'coach' ? 'coach' : 'athlete';
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isSignUp = mode === 'sign-up';
  const isCoach = accountType === 'coach';

  const selectMode = (nextMode: Mode) => { setMode(nextMode); setError(null); setMessage(null); };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); setError(null); setMessage(null);
    if (isSignUp) {
      const publicUsername = username.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (publicUsername.length < 3) { setError('Choose a username with at least 3 letters or numbers.'); setLoading(false); return; }
      if (reservedUsernames.has(publicUsername)) { setError('That username is reserved by CoachPoints. Please choose another.'); setLoading(false); return; }
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { first_name: firstName.trim(), last_name: lastName.trim(), username: publicUsername, account_type: accountType }, emailRedirectTo: `${window.location.origin}/${isCoach ? 'coach-dashboard' : 'dashboard'}` } });
      if (signUpError) setError(signUpError.message);
      else if (data.session) {
        trackEvent('auth_completed', { action: 'sign_up', account_type: accountType });
        if (isCoach) await supabase.from('coachprofiles').upsert({ id: data.session.user.id, first_name: firstName.trim(), last_name: lastName.trim(), username: publicUsername }, { onConflict: 'id' });
        router.push(isCoach ? '/coach-dashboard' : '/dashboard');
      } else setMessage('Your account is ready. Check your email to confirm it, then sign in.');
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
      else {
        trackEvent('auth_completed', { action: 'sign_in', account_type: data.user?.user_metadata.account_type === 'coach' ? 'coach' : 'athlete' });
        router.push(data.user?.user_metadata.account_type === 'coach' ? '/coach-dashboard' : '/dashboard');
      }
    }
    setLoading(false);
  };

  return <main className="min-h-[calc(100vh-72px)] bg-slate-950 lg:grid lg:grid-cols-[.9fr_1.1fr]">
    <aside className="athletic-grid relative hidden overflow-hidden border-r border-white/10 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-18"><div className="absolute -left-24 top-12 size-80 rounded-full bg-brand-600/25 blur-3xl" /><div className="absolute -bottom-32 right-0 size-96 rounded-full bg-emerald-500/15 blur-3xl" /><div className="relative"><div className="flex items-center gap-3"><Image src="/coachpoints-mark.png" alt="" width={44} height={44} className="size-11 rounded-2xl object-cover shadow-lg shadow-brand-600/25" /><span className="text-sm font-extrabold uppercase tracking-[0.18em] text-brand-200">CoachPoints access</span></div><p className="mt-16 text-sm font-bold text-brand-300">{isCoach ? 'Recruit with clarity' : 'Own your athletic story'}</p><h1 className="mt-3 max-w-xl text-5xl font-black leading-[1.02] tracking-[-0.04em]">{isCoach ? 'The right athletes deserve your attention.' : 'Your next opportunity starts with being seen.'}</h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-300">{isCoach ? 'Build a focused network, organize prospects, and communicate directly with athletes who fit your program.' : 'Bring your stats, academics, film, and goals together in one professional profile built for what comes next.'}</p></div><div className="relative grid gap-3">{(isCoach ? ['Search complete athlete profiles', 'Build private recruiting lists', 'Message mutual connections'] : ['Create a polished public profile', 'Share performance and Hudl film', 'Connect directly with coaches']).map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-slate-200 backdrop-blur"><span className="grid size-6 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><Check className="size-3.5" /></span>{item}</div>)}</div></aside>

    <section className="flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-8 lg:py-16"><div className="w-full max-w-lg"><div className="lg:hidden"><p className="eyebrow">Secure CoachPoints access</p></div><div className="flex items-start justify-between gap-4"><div><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{isSignUp ? 'Create your account' : 'Welcome back'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{isSignUp ? `Build your ${accountType} presence on CoachPoints.` : `Sign in to your ${accountType} workspace.`}</p></div><div className={`grid size-12 shrink-0 place-items-center rounded-2xl ${isCoach ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-100 text-brand-700'}`}>{isCoach ? <Dumbbell className="size-5" /> : <Trophy className="size-5" />}</div></div>

      <div className="mt-7 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm"><Link href="/login?role=athlete" className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${!isCoach ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}><Trophy className="size-4" />Athlete</Link><Link href="/login?role=coach" className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${isCoach ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}><Dumbbell className="size-4" />Coach</Link></div>
      <div className="mt-5 grid grid-cols-2 rounded-2xl bg-slate-200/60 p-1" role="tablist" aria-label="Account access"><button type="button" role="tab" aria-selected={!isSignUp} onClick={() => selectMode('sign-in')} className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${!isSignUp ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Sign in</button><button type="button" role="tab" aria-selected={isSignUp} onClick={() => selectMode('sign-up')} className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${isSignUp ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Create account</button></div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">{isSignUp && <div className="grid grid-cols-2 gap-4"><Field label="First name" icon={UserRound}><input value={firstName} onChange={(event) => setFirstName(event.target.value)} className="input pl-10" placeholder="Joe" autoComplete="given-name" required /></Field><Field label="Last name"><input value={lastName} onChange={(event) => setLastName(event.target.value)} className="input" placeholder="Random" autoComplete="family-name" required /></Field></div>}{isSignUp && <Field label="Public username" icon={AtSign}><input value={username} onChange={(event) => setUsername(event.target.value)} className="input pl-10" placeholder="joe-random" autoComplete="username" required /><span className="mt-2 block text-xs text-slate-500">This becomes your permanent profile address.</span></Field>}<Field label="Email address" icon={Mail}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input pl-10" placeholder="you@example.com" autoComplete="email" required /></Field><Field label="Password" icon={LockKeyhole}><div className="relative"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="input px-10" placeholder="At least 8 characters" autoComplete={isSignUp ? 'new-password' : 'current-password'} minLength={8} required /><button type="button" onClick={() => setShowPassword((show) => !show)} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></Field>{error && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm font-medium text-rose-700">{error}</p>}{message && <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-700">{message}</p>}<button disabled={loading} className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60 ${isCoach ? 'bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700' : 'bg-brand-600 shadow-brand-600/20 hover:bg-brand-700'}`}>{loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}{!loading && <ArrowRight className="size-4" />}</button><p className="flex items-center justify-center gap-2 text-center text-xs font-medium text-slate-400"><ShieldCheck className="size-3.5" />Your account is protected by secure authentication.</p></form>
    </div></section>
  </main>;
}

function Field({ label, icon: Icon, children }: { label: string; icon?: typeof UserRound; children: React.ReactNode }) {
  return <label className="block text-sm font-bold text-slate-700"><span className="mb-2 block">{label}</span><span className="relative block">{Icon && <Icon className="pointer-events-none absolute left-3.5 top-3.5 z-10 size-4 text-slate-400" />}{children}</span></label>;
}
