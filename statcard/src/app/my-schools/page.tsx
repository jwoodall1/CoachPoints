/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  GripVertical,
  MapPin,
  Trash2,
  Trophy,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { safeHttpsUrl } from '@/lib/safeExternalUrl';

const PAGE_SIZE = 6;
type Institution = {
  id: string;
  name: string;
  slug: string;
  location: string;
  logo_url: string | null;
  primary_color: string;
  competition_level: string | null;
};
type School = { institution_id: string; institution: Institution | null };
type Ranking = { institution_id: string; rank: number };

export default function MySchoolsPage() {
  const { ready, user } = useAuth();
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [ranking, setRanking] = useState<Ranking[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverRank, setDragOverRank] = useState<number | null>(null);
  const [savingRank, setSavingRank] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/login?role=athlete');
      return;
    }
    if (user.user_metadata.account_type === 'coach') {
      router.replace('/coach-dashboard');
      return;
    }
    let active = true;
    void (async () => {
      const [{ data: saved, error: savedError }, { data: existingRanking, error: rankingError }] =
        await Promise.all([
          supabase
            .from('athlete_saved_institutions')
            .select('institution_id, created_at')
            .eq('athlete_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('athlete_school_rankings')
            .select('institution_id, rank')
            .eq('athlete_id', user.id)
            .order('rank'),
        ]);
      if (!active) return;
      if (savedError || rankingError) {
        setError((savedError ?? rankingError)?.message ?? 'Unable to load your schools.');
        setLoading(false);
        return;
      }
      const ids = (saved ?? []).map((row) => row.institution_id);
      const { data: institutions, error: institutionError } = ids.length
        ? await supabase
            .from('institutions')
            .select('id, name, slug, location, logo_url, primary_color, competition_level')
            .in('id', ids)
        : { data: [], error: null };
      if (!active) return;
      if (institutionError) setError(institutionError.message);
      else {
        const byId = new Map(
          (institutions ?? []).map((institution) => [institution.id, institution as Institution]),
        );
        setSchools(ids.map((id) => ({ institution_id: id, institution: byId.get(id) ?? null })));
        setRanking((existingRanking ?? []) as Ranking[]);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [ready, router, user]);

  const rankedIds = useMemo(() => new Set(ranking.map((item) => item.institution_id)), [ranking]);
  const pageCount = Math.max(1, Math.ceil(schools.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleSchools = schools.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const schoolName = (id: string) =>
    schools.find((school) => school.institution_id === id)?.institution?.name ?? 'School';

  const assignRank = async (institutionId: string, nextRank: number | null) => {
    if (!user || savingRank === institutionId) return;
    const current = ranking.find((item) => item.institution_id === institutionId);
    const occupant = nextRank
      ? ranking.find((item) => item.rank === nextRank && item.institution_id !== institutionId)
      : undefined;
    setSavingRank(institutionId);
    setError(null);
    if (occupant) {
      const { error: deleteError } = await supabase
        .from('athlete_school_rankings')
        .delete()
        .eq('athlete_id', user.id)
        .in('institution_id', [institutionId, occupant.institution_id]);
      if (deleteError) {
        setError('Unable to move that school. Please try again.');
        setSavingRank(null);
        return;
      }
      const rows = [
        { athlete_id: user.id, institution_id: institutionId, rank: nextRank as number },
        ...(current
          ? [{ athlete_id: user.id, institution_id: occupant.institution_id, rank: current.rank }]
          : []),
      ];
      const { error: insertError } = await supabase.from('athlete_school_rankings').insert(rows);
      if (insertError) {
        setError('The ranking could not be saved. Please try again.');
        setSavingRank(null);
        return;
      }
      setRanking((items) =>
        items
          .map((item) =>
            item.institution_id === institutionId
              ? { ...item, rank: nextRank as number }
              : item.institution_id === occupant.institution_id && current
                ? { ...item, rank: current.rank }
                : item,
          )
          .sort((a, b) => a.rank - b.rank),
      );
    } else {
      const result = nextRank
        ? await supabase
            .from('athlete_school_rankings')
            .upsert(
              {
                athlete_id: user.id,
                institution_id: institutionId,
                rank: nextRank,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'athlete_id,institution_id' },
            )
        : await supabase
            .from('athlete_school_rankings')
            .delete()
            .eq('athlete_id', user.id)
            .eq('institution_id', institutionId);
      if (result.error) {
        setError(
          result.error.code === '23505'
            ? 'That ranking position is already used.'
            : 'Unable to update your ranking.',
        );
        setSavingRank(null);
        return;
      }
      setRanking((items) =>
        nextRank !== null
          ? [
              ...items.filter((item) => item.institution_id !== institutionId),
              { institution_id: institutionId, rank: nextRank },
            ].sort((a, b) => a.rank - b.rank)
          : items.filter((item) => item.institution_id !== institutionId),
      );
    }
    setSavingRank(null);
  };

  const remove = async (institutionId: string) => {
    if (!user) return;
    const { error: removeError } = await supabase
      .from('athlete_saved_institutions')
      .delete()
      .eq('athlete_id', user.id)
      .eq('institution_id', institutionId);
    if (removeError) setError('Unable to remove that school.');
    else {
      setSchools((current) => current.filter((school) => school.institution_id !== institutionId));
      setRanking((current) => current.filter((item) => item.institution_id !== institutionId));
    }
  };

  if (!ready || !user || user.user_metadata.account_type === 'coach') return null;
  return (
    <main className="min-h-[calc(100vh-72px)] bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="page-shell py-10 sm:py-14">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.2em] text-brand-700">
                <Bookmark className="size-4" /> Recruiting workspace
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-[-.04em] text-slate-950 sm:text-5xl">
                My Schools
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                A private shortlist for the programs you’re considering. Drag your saved schools
                into your Top 10 priority order.
              </p>
            </div>
            <Link href="/?discover=1" className="btn-primary shrink-0">
              Explore institutions <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Saved schools" value={schools.length} />
            <Stat label="Top 10 filled" value={`${rankedIds.size}/10`} />
            <Stat label="Open positions" value={10 - rankedIds.size} />
          </div>
        </div>
      </div>
      <div className="page-shell py-8 sm:py-10">
        {error && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
          >
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-sm text-slate-500">Loading your schools…</p>
        ) : schools.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.16em] text-brand-700">
                    <Trophy className="size-4" /> Priority board
                  </div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    Top 10 ranking
                  </h2>
                </div>
                <p className="text-xs font-semibold text-slate-400">Drag and drop to reorder</p>
              </div>
              <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
                {Array.from({ length: 10 }, (_, index) => index + 1).map((rank) => {
                  const item = ranking.find((entry) => entry.rank === rank);
                  return (
                    <div
                      key={rank}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverRank(rank);
                      }}
                      onDragLeave={() =>
                        setDragOverRank((current) => (current === rank ? null : current))
                      }
                      onDrop={(event) => {
                        event.preventDefault();
                        if (draggedId) void assignRank(draggedId, rank);
                        setDraggedId(null);
                        setDragOverRank(null);
                      }}
                      className={`flex min-h-24 min-w-44 flex-1 flex-col justify-between rounded-2xl border p-3 transition ${dragOverRank === rank ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-100' : item ? 'border-slate-200 bg-slate-50' : 'border-dashed border-slate-200 bg-white'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`grid size-7 place-items-center rounded-lg text-xs font-black ${item ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-400'}`}
                        >
                          {rank}
                        </span>
                        {item && (
                          <button
                            type="button"
                            onClick={() => void assignRank(item.institution_id, null)}
                            className="text-slate-400 hover:text-rose-600"
                            aria-label={`Remove ${schoolName(item.institution_id)} from ranking`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                      <span
                        className={`truncate text-sm ${item ? 'font-bold text-slate-800' : 'text-slate-400'}`}
                      >
                        {item ? schoolName(item.institution_id) : 'Drop a school here'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="mt-10">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Your shortlist</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">Saved schools</h2>
                </div>
                {pageCount > 1 && (
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Page {currentPage + 1} of {pageCount}
                  </span>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleSchools.map((school) => (
                  <SchoolCard
                    key={school.institution_id}
                    school={school}
                    ranking={ranking}
                    saving={savingRank === school.institution_id}
                    onRemove={remove}
                    onRank={(rank) => void assignRank(school.institution_id, rank)}
                    onDragStart={() => setDraggedId(school.institution_id)}
                    onDragEnd={() => {
                      setDraggedId(null);
                      setDragOverRank(null);
                    }}
                  />
                ))}
              </div>
              {pageCount > 1 && (
                <div className="mt-7 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={currentPage === 0}
                    onClick={() => setPage((current) => current - 1)}
                    className="btn-secondary disabled:opacity-40"
                  >
                    <ArrowLeft className="size-4" /> Previous
                  </button>
                  <div className="flex items-center gap-1.5" aria-label="School pages">
                    {Array.from({ length: pageCount }, (_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setPage(index)}
                        aria-label={`Go to page ${index + 1}`}
                        aria-current={currentPage === index ? 'page' : undefined}
                        className={`size-2.5 rounded-full transition ${currentPage === index ? 'bg-brand-600 ring-4 ring-brand-100' : 'bg-slate-300 hover:bg-slate-400'}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={currentPage === pageCount - 1}
                    onClick={() => setPage((current) => current + 1)}
                    className="btn-secondary disabled:opacity-40"
                  >
                    Next <ArrowRight className="size-4" />
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}
function EmptyState() {
  return (
    <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
      <Bookmark className="mx-auto size-10 text-brand-500" />
      <h2 className="mt-4 text-xl font-black text-slate-950">Build your shortlist</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Browse institutions, save the programs that interest you, and then rank your top choices.
      </p>
      <Link href="/?discover=1" className="btn-primary mt-6">
        Find a school
      </Link>
    </section>
  );
}
function SchoolCard({
  school,
  ranking,
  saving,
  onRemove,
  onRank,
  onDragStart,
  onDragEnd,
}: {
  school: School;
  ranking: Ranking[];
  saving: boolean;
  onRemove: (id: string) => Promise<void>;
  onRank: (rank: number | null) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const item = school.institution;
  if (!item) return null;
  const logo = safeHttpsUrl(item.logo_url);
  const currentRank =
    ranking.find((rank) => rank.institution_id === school.institution_id)?.rank ?? '';
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="h-1" style={{ backgroundColor: item.primary_color }} />
      <div className="flex items-center gap-3 p-4">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: logo ? '#f1f5f9' : item.primary_color }}
        >
          {logo ? (
            <img src={logo} alt="" className="size-9 rounded-lg object-contain" />
          ) : (
            <span className="text-lg font-black text-white">{item.name.charAt(0)}</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
            <GripVertical className="size-3" /> Drag to rank
          </div>
          <h3 className="truncate text-base font-black text-slate-950">{item.name}</h3>
          <p className="flex items-center gap-1 truncate text-xs text-slate-500">
            <MapPin className="size-3" />
            {item.location}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onRemove(school.institution_id)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          aria-label={`Remove ${item.name} from My Schools`}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3">
        {item.competition_level && (
          <span className="truncate rounded-full bg-brand-50 px-2 py-1 text-[10px] font-extrabold text-brand-700">
            {item.competition_level}
          </span>
        )}
        <Link
          href={`/institutions/${item.slug}`}
          className="ml-auto inline-flex items-center gap-1 text-xs font-extrabold text-brand-700"
        >
          View <ArrowUpRight className="size-3.5" />
        </Link>
        <select
          aria-label={`Rank ${item.name}`}
          className="input h-8 w-20 px-2 py-1 text-xs"
          value={currentRank}
          disabled={saving}
          onChange={(event) => onRank(event.target.value ? Number(event.target.value) : null)}
        >
          <option value="">Rank</option>
          {Array.from({ length: 10 }, (_, index) => index + 1).map((rank) => (
            <option key={rank} value={rank}>
              #{rank}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
