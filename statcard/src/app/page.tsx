'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ProfileAvatar from '@/components/ProfileAvatar';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type Athlete = { first_name: string | null; last_name: string | null; username: string; avatar_url: string | null; sport: string | null; account_type: 'athlete' | 'coach' | null };

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(Boolean(session));
      if (session) {
        const { data, error: profilesError } = await supabase.from('profiles').select('first_name, last_name, username, avatar_url, sport, account_type').order('last_name', { ascending: true });
        if (profilesError) setError('Unable to load athlete profiles right now.');
        else setAthletes((data ?? []).filter((athlete) => athlete.username));
      }
      setLoading(false);
    };
    load();
  }, []);

  const sports = useMemo(() => Array.from(new Set(athletes.map((athlete) => athlete.sport?.trim()).filter((sport): sport is string => Boolean(sport)))).sort((a, b) => a.localeCompare(b)), [athletes]);
  const filteredAthletes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return athletes.filter((athlete) => {
      const name = getName(athlete).toLowerCase();
      return (!query || name.includes(query) || athlete.username.toLowerCase().includes(query)) && (sportFilter === 'all' || athlete.sport === sportFilter);
    });
  }, [athletes, search, sportFilter]);

  if (loading) return <main className="grid min-h-[calc(100vh-125px)] place-items-center bg-slate-50 text-sm font-medium text-slate-500">Loading Athlio…</main>;
  if (!isSignedIn) return <main className="flex min-h-[calc(100vh-125px)] items-center justify-center bg-slate-50 p-4"><div className="max-w-xl text-center"><p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Athlio profiles, elevated</p><h1 className="mt-4 text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl">Every stat tells a story.</h1><p className="mx-auto mt-6 max-w-md text-lg leading-8 text-slate-600">Athlio gives athletes and coaches one place to build, manage, and share a performance profile.</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/login?role=athlete" className="inline-flex rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">Athlete login / register</Link><Link href="/login?role=coach" className="inline-flex rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:bg-slate-800">Coach login / register</Link></div></div></main>;

  return <main className="min-h-[calc(100vh-125px)] bg-slate-50 px-4 py-10 sm:px-6 lg:py-14"><div className="mx-auto max-w-5xl">
    <header className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Athlete directory</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Explore Athlio</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Browse public athlete profiles and see the accomplishments behind every performance.</p></header>
    {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : athletes.length === 0 ? <EmptyState /> : <>
      <section aria-labelledby="featured-heading"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Discover</p><h2 id="featured-heading" className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Featured profiles</h2></div><a href="#all-profiles" className="hidden text-sm font-semibold text-blue-600 hover:text-blue-700 sm:block">View all profiles ↓</a></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{athletes.slice(0, 3).map((athlete) => <AthleteCard key={athlete.username} athlete={athlete} />)}</div></section>
      <section id="all-profiles" aria-labelledby="all-profiles-heading" className="mt-14 scroll-mt-6"><div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">The directory</p><h2 id="all-profiles-heading" className="mt-1 text-2xl font-bold tracking-tight text-slate-950">All profiles</h2><p className="mt-1 text-sm text-slate-500">{filteredAthletes.length} {filteredAthletes.length === 1 ? 'athlete' : 'athletes'} found</p></div><div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"><label className="relative block sm:w-64"><span className="sr-only">Search profiles</span><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or handle" className="input pl-9" /></label><label className="sm:w-48"><span className="sr-only">Filter by sport</span><select value={sportFilter} onChange={(event) => setSportFilter(event.target.value)} className="input"><option value="all">All sports</option>{sports.map((sport) => <option key={sport} value={sport}>{sport}</option>)}</select></label></div></div>{filteredAthletes.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredAthletes.map((athlete) => <AthleteCard key={athlete.username} athlete={athlete} />)}</div> : <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><h3 className="text-lg font-bold text-slate-900">No profiles found</h3><p className="mt-2 text-sm text-slate-500">Try a different name, handle, or sport.</p><button type="button" onClick={() => { setSearch(''); setSportFilter('all'); }} className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700">Clear filters</button></div>}</section>
    </>}
  </div></main>;
}

function getName(athlete: Athlete) { return [athlete.first_name, athlete.last_name].filter(Boolean).join(' ') || athlete.username; }

function AthleteCard({ athlete }: { athlete: Athlete }) {
  const name = getName(athlete);
  const { data: { publicUrl: fallbackAvatarUrl } } = supabase.storage.from('avatars').getPublicUrl(`${athlete.username}/profile.png`);
  return <Link href={`/${athlete.username}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50"><div className="flex items-start justify-between gap-3"><ProfileAvatar src={athlete.avatar_url || fallbackAvatarUrl} name={name} size="small" /><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${athlete.account_type === 'coach' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{athlete.account_type === 'coach' ? 'Coach' : 'Athlete'}</span></div><h3 className="mt-4 text-lg font-bold text-slate-950 group-hover:text-blue-700">{name}</h3><p className="mt-1 text-sm text-slate-500">@{athlete.username}</p>{athlete.sport && <p className="mt-1 text-xs font-medium text-slate-400">{athlete.sport}</p>}<span className="mt-5 inline-flex text-sm font-semibold text-blue-600">View profile <span aria-hidden="true" className="ml-1 transition group-hover:translate-x-0.5">→</span></span></Link>;
}

function EmptyState() { return <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><h2 className="text-lg font-bold text-slate-900">No public Cards yet</h2><p className="mt-2 text-sm text-slate-500">Create and save your profile to become the first athlete in the directory.</p><Link href="/dashboard" className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700">Go to your dashboard →</Link></div>; }
