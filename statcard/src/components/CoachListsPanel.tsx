'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';

type List = { id: string; name: string; created_at: string };
type Member = { list_id: string; athlete_id: string };
type Athlete = { id: string; username: string; first_name: string | null; last_name: string | null };

type ListSnapshot = {
  athletes: Athlete[];
  error: string | null;
  lists: List[];
  members: Member[];
};

/** Fetches list headers and memberships together, then resolves the referenced athletes. */
async function fetchListSnapshot(): Promise<ListSnapshot> {
  const [{ data: listData, error: listError }, { data: memberData, error: memberError }] = await Promise.all([
    supabase.from('coach_lists').select('id, name, created_at').order('created_at', { ascending: true }),
    supabase.from('coach_list_members').select('list_id, athlete_id'),
  ]);
  if (listError || memberError) return { lists: [], members: [], athletes: [], error: (listError ?? memberError)?.message ?? 'Unable to load lists.' };

  const members = memberData ?? [];
  const athleteIds = Array.from(new Set(members.map((member) => member.athlete_id)));
  if (!athleteIds.length) return { lists: listData ?? [], members, athletes: [], error: null };

  const { data: athleteData, error: athleteError } = await supabase.from('profiles').select('id, username, first_name, last_name').in('id', athleteIds);
  return { lists: listData ?? [], members, athletes: athleteData ?? [], error: athleteError?.message ?? null };
}

/** Provides the compact coach-list interface used when embedded in another page. */
export default function CoachListsPanel() {
  const { user } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applySnapshot = (snapshot: ListSnapshot) => {
    setLists(snapshot.lists);
    setMembers(snapshot.members);
    setAthletes(snapshot.athletes);
    setError(snapshot.error);
  };

  useEffect(() => {
    let active = true;
    void fetchListSnapshot().then((snapshot) => {
      if (!active) return;
      setLists(snapshot.lists);
      setMembers(snapshot.members);
      setAthletes(snapshot.athletes);
      setError(snapshot.error);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const createList = async () => {
    const trimmed = name.trim();
    if (!trimmed || !user) return;
    setSaving(true); setError(null);
    const { error: createError } = await supabase.from('coach_lists').insert({ coach_id: user.id, name: trimmed });
    if (createError) setError(createError.message); else { setName(''); applySnapshot(await fetchListSnapshot()); trackEvent('recruiting_list_action', { action: 'list_created' }); }
    setSaving(false);
  };

  const deleteList = async (list: List) => {
    if (!window.confirm(`Delete the list “${list.name}”?`)) return;
    const { error: deleteError } = await supabase.from('coach_lists').delete().eq('id', list.id);
    if (deleteError) setError(deleteError.message); else { applySnapshot(await fetchListSnapshot()); trackEvent('recruiting_list_action', { action: 'list_deleted' }); }
  };

  // Index relations once instead of repeatedly scanning every athlete for every list.
  const membersByList = useMemo(() => {
    const athleteById = new Map(athletes.map((athlete) => [athlete.id, athlete]));
    const grouped = new Map<string, Athlete[]>();
    members.forEach((member) => {
      const athlete = athleteById.get(member.athlete_id);
      if (!athlete) return;
      const group = grouped.get(member.list_id) ?? [];
      group.push(athlete);
      grouped.set(member.list_id, group);
    });
    return grouped;
  }, [athletes, members]);

  return <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-emerald-600">Recruiting workspace</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Your athlete lists</h2><p className="mt-2 text-sm leading-6 text-slate-500">Organize athletes from their profiles into private lists tied to your coach account.</p></div><div className="flex w-full gap-2 sm:w-auto"><input value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') createList(); }} placeholder="New list name" className="input min-w-0 sm:w-52" maxLength={80} /><button type="button" disabled={!name.trim() || saving} onClick={createList} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{saving ? 'Creating…' : 'Create list'}</button></div></div>
    {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
    {loading ? <p className="mt-6 text-sm text-slate-500">Loading your lists…</p> : lists.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">Create your first list, then add athletes from the directory.</div> : <div className="mt-6 grid gap-4 md:grid-cols-2">{lists.map((list) => { const listMembers = membersByList.get(list.id) ?? []; return <div key={list.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-950">{list.name}</h3><p className="mt-1 text-xs text-slate-500">{listMembers.length} {listMembers.length === 1 ? 'athlete' : 'athletes'}</p></div><button type="button" onClick={() => deleteList(list)} className="text-xs font-semibold text-rose-600 hover:text-rose-700">Delete</button></div>{listMembers.length ? <ul className="mt-4 space-y-2">{listMembers.map((athlete) => <li key={athlete.id}><Link href={`/${athlete.username}`} className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-700"><span>{[athlete.first_name, athlete.last_name].filter(Boolean).join(' ') || athlete.username}</span><span className="text-xs text-slate-400">View →</span></Link></li>)}</ul> : <p className="mt-4 text-sm text-slate-500">No athletes added yet.</p>}</div>; })}</div>}
  </section>;
}
