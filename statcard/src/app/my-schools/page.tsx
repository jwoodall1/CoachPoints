/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { ArrowUpRight, Bookmark, MapPin, Medal, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { safeHttpsUrl } from '@/lib/safeExternalUrl';

type Institution = { id: string; name: string; slug: string; location: string; logo_url: string | null; primary_color: string; competition_level: string | null };
type School = { institution_id: string; institution: Institution | null };
type Ranking = { institution_id: string; rank: number };

export default function MySchoolsPage() {
  const { ready, user } = useAuth();
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [ranking, setRanking] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRank, setSavingRank] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace('/login?role=athlete'); return; }
    if (user.user_metadata.account_type === 'coach') { router.replace('/coach-dashboard'); return; }
    let active = true;
    void (async () => {
      const [{ data: saved, error: savedError }, { data: existingRanking, error: rankingError }] = await Promise.all([
        supabase.from('athlete_saved_institutions').select('institution_id, created_at').eq('athlete_id', user.id).order('created_at', { ascending: false }),
        supabase.from('athlete_school_rankings').select('institution_id, rank').eq('athlete_id', user.id).order('rank'),
      ]);
      if (!active) return;
      if (savedError || rankingError) { setError((savedError ?? rankingError)?.message ?? 'Unable to load your schools.'); setLoading(false); return; }
      const ids = (saved ?? []).map((row) => row.institution_id);
      const { data: institutions, error: institutionError } = ids.length
        ? await supabase.from('institutions').select('id, name, slug, location, logo_url, primary_color, competition_level').in('id', ids)
        : { data: [], error: null };
      if (!active) return;
      if (institutionError) setError(institutionError.message);
      else {
        const byId = new Map((institutions ?? []).map((institution) => [institution.id, institution as Institution]));
        setSchools(ids.map((id) => ({ institution_id: id, institution: byId.get(id) ?? null })));
        setRanking((existingRanking ?? []) as Ranking[]);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [ready, router, user]);

  const rankedIds = useMemo(() => new Set(ranking.map((item) => item.institution_id)), [ranking]);
  const saveRank = async (institutionId: string, value: string) => {
    if (!user) return;
    setSavingRank(institutionId); setError(null);
    const nextRank = value ? Number(value) : null;
    const result = nextRank
      ? await supabase.from('athlete_school_rankings').upsert({ athlete_id: user.id, institution_id: institutionId, rank: nextRank, updated_at: new Date().toISOString() }, { onConflict: 'athlete_id,institution_id' })
      : await supabase.from('athlete_school_rankings').delete().eq('athlete_id', user.id).eq('institution_id', institutionId);
    if (result.error) setError(result.error.code === '23505' ? 'That ranking position is already used. Choose another position.' : 'Unable to update your ranking.');
    else setRanking((current) => nextRank ? [...current.filter((item) => item.institution_id !== institutionId), { institution_id: institutionId, rank: nextRank }].sort((a, b) => a.rank - b.rank) : current.filter((item) => item.institution_id !== institutionId));
    setSavingRank(null);
  };

  const remove = async (institutionId: string) => {
    if (!user) return;
    const { error: removeError } = await supabase.from('athlete_saved_institutions').delete().eq('athlete_id', user.id).eq('institution_id', institutionId);
    if (removeError) setError('Unable to remove that school.');
    else { setSchools((current) => current.filter((school) => school.institution_id !== institutionId)); setRanking((current) => current.filter((item) => item.institution_id !== institutionId)); }
  };

  const schoolName = (id: string) => schools.find((school) => school.institution_id === id)?.institution?.name ?? 'School';

  return <main className="page-shell py-12 sm:py-16"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Your recruiting shortlist</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">My Schools</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Keep your schools private, then rank up to ten favorites.</p></div><Link href="/?discover=1" className="btn-primary">Explore institutions <ArrowUpRight className="size-4" /></Link></div>{error && <p role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}{loading ? <p className="mt-10 text-sm text-slate-500">Loading your schools…</p> : schools.length === 0 ? <section className="surface-card mt-10 grid place-items-center p-12 text-center"><Bookmark className="size-10 text-brand-500" /><h2 className="mt-4 text-xl font-black text-slate-950">Your list is empty</h2><p className="mt-2 max-w-md text-sm text-slate-500">Browse institutions and select “Add to My Schools” when you find a program you like.</p><Link href="/?discover=1" className="btn-primary mt-6">Find a school</Link></section> : <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]"><section><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black text-slate-950">Saved schools</h2><span className="text-sm font-bold text-slate-500">{schools.length} saved</span></div><div className="grid gap-5 sm:grid-cols-2">{schools.map((school) => { const item = school.institution; if (!item) return null; const logo = safeHttpsUrl(item.logo_url); const currentRank = ranking.find((rank) => rank.institution_id === school.institution_id)?.rank ?? ''; return <article key={school.institution_id} className="surface-card overflow-hidden"><div className="h-2" style={{ backgroundColor: item.primary_color }} /><div className="p-5"><div className="flex items-start justify-between gap-3"><div className="grid size-14 place-items-center rounded-2xl bg-slate-100" style={{ backgroundColor: logo ? undefined : item.primary_color }}>{logo ? <img src={logo} alt="" className="size-12 rounded-xl object-contain" /> : <span className="text-xl font-black text-white">{item.name.charAt(0)}</span>}</div><button type="button" onClick={() => void remove(school.institution_id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${item.name} from My Schools`}><Trash2 className="size-4" /></button></div><h3 className="mt-5 text-xl font-black text-slate-950">{item.name}</h3><p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="size-4" />{item.location}</p>{item.competition_level && <span className="mt-4 inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-extrabold text-brand-700">{item.competition_level}</span>}<Link href={`/institutions/${item.slug}`} className="btn-secondary mt-5 w-full">View institution <ArrowUpRight className="size-4" /></Link><label className="mt-4 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Top 10 position<select className="input mt-2" value={currentRank} disabled={savingRank === school.institution_id} onChange={(event) => void saveRank(school.institution_id, event.target.value)}><option value="">Not ranked</option>{Array.from({ length: 10 }, (_, index) => index + 1).map((rank) => <option key={rank} value={rank}>#{rank}</option>)}</select></label></div></article>; })}</div></section><aside className="surface-card h-fit p-6 lg:sticky lg:top-8"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Medal className="size-5" /></span><div><p className="eyebrow">Your shortlist</p><h2 className="mt-1 text-xl font-black text-slate-950">Top 10 ranking</h2></div></div><p className="mt-3 text-sm leading-6 text-slate-500">Choose a position on any saved school. Each position can only be used once.</p><div className="mt-5 space-y-2">{Array.from({ length: 10 }, (_, index) => index + 1).map((rank) => { const item = ranking.find((entry) => entry.rank === rank); return <div key={rank} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5"><span className="grid size-7 place-items-center rounded-lg bg-slate-950 text-xs font-black text-white">{rank}</span><span className={`truncate text-sm ${item ? 'font-bold text-slate-800' : 'text-slate-400'}`}>{item ? schoolName(item.institution_id) : 'Open position'}</span></div>; })}</div><p className="mt-4 text-xs font-semibold text-slate-400">{rankedIds.size}/10 positions filled</p></aside></div>}</main>;
}
