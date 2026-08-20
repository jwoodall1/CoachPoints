'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/components/AuthProvider';
import ProfileAvatar from '@/components/ProfileAvatar';
import { supabase } from '@/lib/supabase';
import { getPositions } from '@/lib/sports';

// Only coaches download the interactive list picker used by directory cards.
const AddToListButton = dynamic(() => import('@/components/AddToListButton'));

type Athlete = { id: string; first_name: string | null; last_name: string | null; username: string; avatar_url: string | null; sport: string | null; position?: string | null; graduating_class?: string | null; high_school?: string | null; college_university?: string | null; account_type: 'athlete' | 'coach' | null };
type DirectoryState = { userId: string; profiles: Athlete[]; error: string | null };

const EMPTY_PROFILES: Athlete[] = [];

/** Shows the landing page to guests and the searchable profile directory to members. */
export default function HomePage() {
  const { ready, user } = useAuth();
  const [directory, setDirectory] = useState<DirectoryState | null>(null);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [highSchoolFilter, setHighSchoolFilter] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const userId = user?.id ?? null;
  const isSignedIn = Boolean(userId);
  const canManageLists = user?.user_metadata.account_type === 'coach';
  const isCurrentDirectory = directory?.userId === userId;
  const athletes = isCurrentDirectory ? directory.profiles : EMPTY_PROFILES;
  const error = isCurrentDirectory ? directory.error : null;
  const loading = !ready || (isSignedIn && !isCurrentDirectory);

  useEffect(() => {
    if (!ready || !userId) return;
    let active = true;

    // Both public profile tables are independent, so fetch them in parallel.
    const load = async () => {
      const [{ data, error: profilesError }, { data: coachData, error: coachesError }] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name, username, avatar_url, sport, position, graduating_class, high_school').order('last_name', { ascending: true }).limit(1000),
        supabase.from('coachprofiles').select('id, first_name, last_name, username, avatar_url, sport, college_university').order('last_name', { ascending: true }).limit(1000),
      ]);
      if (!active) return;

      if (profilesError || coachesError) {
        setDirectory({ userId, profiles: [], error: 'Unable to load athlete and coach profiles right now.' });
        return;
      }

      const profiles = [
        ...(data ?? []).map((athlete) => ({ ...athlete, account_type: 'athlete' as const })),
        ...(coachData ?? []).map((coach) => ({ ...coach, account_type: 'coach' as const })),
      ].filter((profile) => profile.username).sort((a, b) => (a.last_name ?? '').localeCompare(b.last_name ?? ''));
      setDirectory({ userId, profiles, error: null });
    };
    void load();

    return () => {
      active = false;
    };
  }, [ready, userId]);

  const sports = useMemo(() => Array.from(new Set(athletes.map((athlete) => athlete.sport?.trim()).filter((sport): sport is string => Boolean(sport)))).sort((a, b) => a.localeCompare(b)), [athletes]);
  const positions = useMemo(() => Array.from(new Set(athletes.map((athlete) => athlete.position?.trim()).filter((position): position is string => Boolean(position)))).sort((a, b) => a.localeCompare(b)), [athletes]);
  const availablePositions = sportFilter === 'all' ? positions : getPositions(sportFilter);
  const classYears = useMemo(() => Array.from(new Set(athletes.map((athlete) => athlete.graduating_class?.trim()).filter((year): year is string => Boolean(year)))).sort(), [athletes]);
  const highSchools = useMemo(() => Array.from(new Set(athletes.map((athlete) => athlete.high_school?.trim()).filter((school): school is string => Boolean(school)))).sort((a, b) => a.localeCompare(b)), [athletes]);
  const colleges = useMemo(() => Array.from(new Set(athletes.map((athlete) => athlete.college_university?.trim()).filter((college): college is string => Boolean(college)))).sort((a, b) => a.localeCompare(b)), [athletes]);
  // Compute filter results once per filter change and separate the two profile types.
  const { filteredAthletes, filteredCoaches } = useMemo(() => {
    const query = search.trim().toLowerCase();
    const profiles = athletes.filter((athlete) => {
      const name = getName(athlete).toLowerCase();
      return (!query || name.includes(query) || athlete.username.toLowerCase().includes(query)) && (sportFilter === 'all' || athlete.sport === sportFilter) && (positionFilter === 'all' || athlete.position === positionFilter) && (classFilter === 'all' || athlete.graduating_class === classFilter) && (highSchoolFilter === 'all' || athlete.high_school === highSchoolFilter) && (collegeFilter === 'all' || athlete.college_university === collegeFilter);
    });
    return {
      filteredAthletes: profiles.filter((profile) => profile.account_type === 'athlete'),
      filteredCoaches: profiles.filter((profile) => profile.account_type === 'coach'),
    };
  }, [athletes, search, sportFilter, positionFilter, classFilter, highSchoolFilter, collegeFilter]);
  const clearBasicFilters = useCallback(() => {
    setSearch('');
    setSportFilter('all');
    setPositionFilter('all');
  }, []);

  if (loading) return <main className="grid min-h-[calc(100vh-125px)] place-items-center bg-slate-50 text-sm font-medium text-slate-500">Loading Athlio…</main>;
  if (!isSignedIn) return <main className="flex min-h-[calc(100vh-125px)] items-center justify-center bg-slate-50 p-4"><div className="max-w-xl text-center"><p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Athlio profiles, elevated</p><h1 className="mt-4 text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl">Every stat tells a story.</h1><p className="mx-auto mt-6 max-w-md text-lg leading-8 text-slate-600">Athlio gives athletes and coaches one place to build, manage, and share a performance profile.</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/login?role=athlete" className="inline-flex rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">Athlete login / register</Link><Link href="/login?role=coach" className="inline-flex rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:bg-slate-800">Coach login / register</Link></div></div></main>;

  return <main className="min-h-[calc(100vh-125px)] bg-slate-50 px-4 py-10 sm:px-6 lg:py-14"><div className="mx-auto max-w-5xl">
    <header className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Athlete directory</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Explore Athlio</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Browse public athlete profiles and see the accomplishments behind every performance.</p></header>
    {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : athletes.length === 0 ? <EmptyState /> : <>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><label><span className="mb-2 block text-sm font-semibold text-slate-700">Position</span><select value={positionFilter} onChange={(event) => setPositionFilter(event.target.value)} className="input"><option value="all">All positions</option>{availablePositions.map((position) => <option key={position} value={position}>{position}</option>)}</select></label><label><span className="mb-2 block text-sm font-semibold text-slate-700">Class year</span><select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="input"><option value="all">All class years</option>{classYears.map((year) => <option key={year} value={year}>{year}</option>)}</select></label><label><span className="mb-2 block text-sm font-semibold text-slate-700">High school</span><select value={highSchoolFilter} onChange={(event) => setHighSchoolFilter(event.target.value)} className="input"><option value="all">All high schools</option>{highSchools.map((school) => <option key={school} value={school}>{school}</option>)}</select></label><label><span className="mb-2 block text-sm font-semibold text-slate-700">College / university</span><select value={collegeFilter} onChange={(event) => setCollegeFilter(event.target.value)} className="input"><option value="all">All colleges</option>{colleges.map((college) => <option key={college} value={college}>{college}</option>)}</select></label><label><span className="mb-2 block text-sm font-semibold text-slate-700">Sport</span><select value={sportFilter} onChange={(event) => { const nextSport = event.target.value; setSportFilter(nextSport); if (nextSport !== 'all' && positionFilter !== 'all' && !getPositions(nextSport).includes(positionFilter)) setPositionFilter('all'); }} className="input"><option value="all">All sports</option>{sports.map((sport) => <option key={sport} value={sport}>{sport}</option>)}</select></label></div>
      <section id="all-profiles" aria-labelledby="all-profiles-heading" className="mt-14 scroll-mt-6"><div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">The directory</p><h2 id="all-profiles-heading" className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Athletes and coaches</h2><p className="mt-1 text-sm text-slate-500">{filteredAthletes.length} athletes · {filteredCoaches.length} coaches found</p></div><div className="flex w-full sm:w-auto sm:flex-1"><label className="relative block w-full sm:ml-8"><span className="sr-only">Search profiles</span><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or handle" className="input w-full pl-9" /></label></div></div><ProfileGroup title="Athlete profiles" profiles={filteredAthletes} emptyMessage="No athletes match these filters." onClear={clearBasicFilters} showListActions={canManageLists} /><ProfileGroup title="Coach profiles" profiles={filteredCoaches} emptyMessage="No coaches match these filters." onClear={clearBasicFilters} showListActions={false} /></section>
    </>}
  </div></main>;
}

/** Uses a profile's full name when available and falls back to its username. */
function getName(athlete: Athlete) { return [athlete.first_name, athlete.last_name].filter(Boolean).join(' ') || athlete.username; }

/** Renders one profile category and defers off-screen card layout work. */
const ProfileGroup = memo(function ProfileGroup({ title, profiles, emptyMessage, onClear, showListActions }: { title: string; profiles: Athlete[]; emptyMessage: string; onClear: () => void; showListActions: boolean }) {
  return <section className="mt-8"><div className="mb-4 flex items-end justify-between gap-4"><h3 className="text-xl font-bold tracking-tight text-slate-950">{title}</h3><span className="text-sm text-slate-500">{profiles.length}</span></div>{profiles.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{profiles.map((profile) => <AthleteCard key={profile.username} athlete={profile} showListAction={showListActions} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center"><p className="text-sm text-slate-500">{emptyMessage}</p><button type="button" onClick={onClear} className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700">Clear filters</button></div>}</section>;
});

/** Displays a profile summary; memoization prevents unrelated cards from rerendering. */
const AthleteCard = memo(function AthleteCard({ athlete, showListAction }: { athlete: Athlete; showListAction: boolean }) {
  const name = getName(athlete);
  const { data: { publicUrl: fallbackAvatarUrl } } = supabase.storage.from('avatars').getPublicUrl(`${athlete.username}/profile.png`);
  return <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition [content-visibility:auto] [contain-intrinsic-size:auto_320px] hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50"><Link href={`/${athlete.username}`}><div className="flex items-start justify-between gap-3"><ProfileAvatar src={athlete.avatar_url || fallbackAvatarUrl} name={name} size="small" /><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${athlete.account_type === 'coach' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{athlete.account_type === 'coach' ? 'Coach' : 'Athlete'}</span></div><h3 className="mt-4 text-lg font-bold text-slate-950 group-hover:text-blue-700">{name}</h3><p className="mt-1 text-sm text-slate-500">@{athlete.username}</p>{athlete.sport && <p className="mt-1 text-xs font-medium text-slate-400">{athlete.sport}</p>}{athlete.account_type === 'athlete' && (athlete.position || athlete.graduating_class || athlete.high_school) && <div className="mt-3 flex flex-wrap gap-2">{athlete.position && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{athlete.position}</span>}{athlete.graduating_class && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Class of {athlete.graduating_class}</span>}{athlete.high_school && <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">{athlete.high_school}</span>}</div>}{athlete.account_type === 'coach' && athlete.college_university && <div className="mt-3"><span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{athlete.college_university}</span></div>}<span className="mt-5 inline-flex text-sm font-semibold text-blue-600">View profile <span aria-hidden="true" className="ml-1 transition group-hover:translate-x-0.5">→</span></span></Link>{showListAction && <div className="mt-4 border-t border-slate-100 pt-4"><AddToListButton athleteId={athlete.id} /></div>}</div>;
});

/** Guides a signed-in user when no public profiles exist yet. */
function EmptyState() { return <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><h2 className="text-lg font-bold text-slate-900">No public Cards yet</h2><p className="mt-2 text-sm text-slate-500">Create and save your profile to become the first athlete in the directory.</p><Link href="/dashboard" className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700">Go to your dashboard →</Link></div>; }
