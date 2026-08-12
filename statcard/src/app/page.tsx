'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ProfileAvatar from '@/components/ProfileAvatar';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type Athlete = { first_name: string | null; last_name: string | null; username: string; avatar_url: string | null };

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(Boolean(session));
      if (session) {
        const { data, error: profilesError } = await supabase.from('profiles').select('first_name, last_name, username, avatar_url').order('last_name', { ascending: true });
        if (profilesError) setError('Unable to load athlete profiles right now.');
        else setAthletes((data ?? []).filter((athlete) => athlete.username));
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <main className="grid min-h-[calc(100vh-125px)] place-items-center bg-slate-50 text-sm font-medium text-slate-500">Loading Athlio…</main>;
  if (!isSignedIn) return <main className="flex min-h-[calc(100vh-125px)] items-center justify-center bg-slate-50 p-4"><div className="max-w-xl text-center"><p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Athlete profiles, elevated</p><h1 className="mt-4 text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl">Every stat tells a story.</h1><p className="mx-auto mt-6 max-w-md text-lg leading-8 text-slate-600">Athlio gives athletes one place to build, manage, and share their performance profile.</p><Link href="/login" className="mt-9 inline-flex rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:bg-slate-800">Get started</Link></div></main>;

  return <main className="min-h-[calc(100vh-125px)] bg-slate-50 px-4 py-10 sm:px-6 lg:py-14"><div className="mx-auto max-w-5xl"><header className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Athlete directory</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Explore Athlio</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Browse public athlete profiles and see the accomplishments behind every performance.</p></header>{error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : athletes.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><h2 className="text-lg font-bold text-slate-900">No public Cards yet</h2><p className="mt-2 text-sm text-slate-500">Create and save your profile to become the first athlete in the directory.</p><Link href="/dashboard" className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700">Go to your dashboard →</Link></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{athletes.map((athlete) => { const name = [athlete.first_name, athlete.last_name].filter(Boolean).join(' ') || athlete.username; const { data: { publicUrl: fallbackAvatarUrl } } = supabase.storage.from('avatars').getPublicUrl(`${athlete.username}/profile.png`); return <Link key={athlete.username} href={`/${athlete.username}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50"><ProfileAvatar src={athlete.avatar_url || fallbackAvatarUrl} name={name} size="small" /><h2 className="mt-4 text-lg font-bold text-slate-950 group-hover:text-blue-700">{name}</h2><p className="mt-1 text-sm text-slate-500">@{athlete.username}</p><span className="mt-5 inline-flex text-sm font-semibold text-blue-600">View profile <span aria-hidden="true" className="ml-1 transition group-hover:translate-x-0.5">→</span></span></Link>; })}</div>}</div></main>;
}
