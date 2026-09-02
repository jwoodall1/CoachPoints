/* eslint-disable @next/next/no-img-element */

'use client';

import Link from 'next/link';
import { ArrowUpRight, Bookmark, MapPin, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { safeHttpsUrl } from '@/lib/safeExternalUrl';

type School = { institution_id: string; institution: { name: string; slug: string; location: string; logo_url: string | null; primary_color: string; competition_level: string | null } | null };

export default function MySchoolsPage() {
  const { ready, user } = useAuth();
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace('/login?role=athlete'); return; }
    if (user.user_metadata.account_type === 'coach') { router.replace('/coach-dashboard'); return; }
    let active = true;
    void supabase.from('athlete_saved_institutions').select('institution_id, institutions(name, slug, location, logo_url, primary_color, competition_level)').eq('athlete_id', user.id).order('created_at', { ascending: false }).then(({ data, error: loadError }) => {
      if (!active) return;
      if (loadError) setError(loadError.message);
      else setSchools((data ?? []) as unknown as School[]);
      setLoading(false);
    });
    return () => { active = false; };
  }, [ready, router, user]);

  const remove = async (institutionId: string) => {
    if (!user) return;
    const { error: removeError } = await supabase.from('athlete_saved_institutions').delete().eq('athlete_id', user.id).eq('institution_id', institutionId);
    if (removeError) setError('Unable to remove that school.');
    else setSchools((current) => current.filter((school) => school.institution_id !== institutionId));
  };

  return <main className="page-shell py-12 sm:py-16"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Your recruiting shortlist</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">My Schools</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Keep the institutions you’re considering in one private list.</p></div><Link href="/?discover=1" className="btn-primary">Explore institutions <ArrowUpRight className="size-4" /></Link></div>{error && <p role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}{loading ? <p className="mt-10 text-sm text-slate-500">Loading your schools…</p> : schools.length === 0 ? <section className="surface-card mt-10 grid place-items-center p-12 text-center"><Bookmark className="size-10 text-brand-500" /><h2 className="mt-4 text-xl font-black text-slate-950">Your list is empty</h2><p className="mt-2 max-w-md text-sm text-slate-500">Browse institutions and select “Add to My Schools” when you find a program you like.</p><Link href="/?discover=1" className="btn-primary mt-6">Find a school</Link></section> : <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{schools.map((school) => { const item = school.institution; if (!item) return null; const logo = safeHttpsUrl(item.logo_url); return <article key={school.institution_id} className="surface-card overflow-hidden"><div className="h-2" style={{ backgroundColor: item.primary_color }} /><div className="p-5"><div className="flex items-start justify-between gap-3"><div className="grid size-14 place-items-center rounded-2xl bg-slate-100" style={{ backgroundColor: logo ? undefined : item.primary_color }}>{logo ? <img src={logo} alt="" className="size-12 rounded-xl object-contain" /> : <span className="text-xl font-black text-white">{item.name.charAt(0)}</span>}</div><button type="button" onClick={() => void remove(school.institution_id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${item.name} from My Schools`}><Trash2 className="size-4" /></button></div><h2 className="mt-5 text-xl font-black text-slate-950">{item.name}</h2><p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="size-4" />{item.location}</p>{item.competition_level && <span className="mt-4 inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-extrabold text-brand-700">{item.competition_level}</span>}<Link href={`/institutions/${item.slug}`} className="btn-secondary mt-5 w-full">View institution <ArrowUpRight className="size-4" /></Link></div></article>; })}</div>}</main>;
}
