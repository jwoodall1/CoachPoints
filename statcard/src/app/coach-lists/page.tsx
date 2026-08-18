'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type List = { id: string; name: string; created_at: string };
type Member = { list_id: string; athlete_id: string };
type Athlete = {
  id: string; username: string; first_name: string | null; last_name: string | null;
  sport: string | null; position: string | null; graduating_class: string | null;
  high_school: string | null; height: string | null; weight: string | null; gpa: string | null;
  bio: string | null; phone_number: string | null; contact_email: string | null;
  hudl_highlight_url: string | null; instagram_url: string | null; tiktok_url: string | null;
  youtube_url: string | null; x_url: string | null; stats: unknown; measurables: unknown;
};

const athleteColumns = 'id, username, first_name, last_name, sport, position, graduating_class, high_school, height, weight, gpa, bio, phone_number, contact_email, hudl_highlight_url, instagram_url, tiktok_url, youtube_url, x_url, stats, measurables';

export default function CoachListsPage() {
  const router = useRouter();
  const [lists, setLists] = useState<List[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [newListName, setNewListName] = useState('');
  const [editedListName, setEditedListName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedList = lists.find((list) => list.id === selectedListId) ?? null;
  const selectedAthletes = useMemo(() => {
    const ids = new Set(members.filter((member) => member.list_id === selectedListId).map((member) => member.athlete_id));
    return athletes.filter((athlete) => ids.has(athlete.id));
  }, [athletes, members, selectedListId]);

  const load = async (preferredListId?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.replace('/login?role=coach');
    if (session.user.user_metadata.account_type !== 'coach') return router.replace('/dashboard');
    const { data: listData, error: listError } = await supabase.from('coach_lists').select('id, name, created_at').order('created_at', { ascending: true });
    if (listError) { setError(listError.message); setLoading(false); return; }
    const nextLists = listData ?? [];
    const nextSelectedId = preferredListId ?? selectedListId ?? nextLists[0]?.id ?? '';
    setLists(nextLists); setSelectedListId(nextLists.some((list) => list.id === nextSelectedId) ? nextSelectedId : nextLists[0]?.id ?? '');
    setEditedListName(nextLists.find((list) => list.id === nextSelectedId)?.name ?? '');
    const { data: memberData, error: memberError } = await supabase.from('coach_list_members').select('list_id, athlete_id');
    if (memberError) { setError(memberError.message); setLoading(false); return; }
    const nextMembers = memberData ?? [];
    setMembers(nextMembers);
    const ids = Array.from(new Set(nextMembers.map((member) => member.athlete_id)));
    if (ids.length) {
      const { data: athleteData, error: athleteError } = await supabase.from('profiles').select(athleteColumns).in('id', ids);
      if (athleteError) setError(athleteError.message); else setAthletes(athleteData ?? []);
    } else setAthletes([]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [router]);

  const chooseList = (id: string) => {
    setSelectedListId(id);
    setEditedListName(lists.find((list) => list.id === id)?.name ?? '');
  };

  const createList = async () => {
    const name = newListName.trim();
    if (!name) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setSaving(true); setError(null);
    const { data, error: createError } = await supabase.from('coach_lists').insert({ coach_id: session.user.id, name }).select('id, name, created_at').single();
    if (createError) setError(createError.message); else { setNewListName(''); await load(data.id); }
    setSaving(false);
  };

  const renameList = async () => {
    if (!selectedList || !editedListName.trim()) return;
    setSaving(true); setError(null);
    const { error: renameError } = await supabase.from('coach_lists').update({ name: editedListName.trim(), updated_at: new Date().toISOString() }).eq('id', selectedList.id);
    if (renameError) setError(renameError.message); else await load(selectedList.id);
    setSaving(false);
  };

  const deleteList = async () => {
    if (!selectedList || !window.confirm(`Delete the list “${selectedList.name}”?`)) return;
    setSaving(true); setError(null);
    const { error: deleteError } = await supabase.from('coach_lists').delete().eq('id', selectedList.id);
    if (deleteError) setError(deleteError.message); else await load();
    setSaving(false);
  };

  const removeAthlete = async (athlete: Athlete) => {
    if (!selectedList) return;
    const { error: removeError } = await supabase.from('coach_list_members').delete().eq('list_id', selectedList.id).eq('athlete_id', athlete.id);
    if (removeError) setError(removeError.message); else setMembers((current) => current.filter((member) => !(member.list_id === selectedList.id && member.athlete_id === athlete.id)));
  };

  if (loading) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-medium text-slate-500">Loading your lists…</main>;

  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-12"><div className="mx-auto max-w-[1600px]">
    <header className="mb-8 rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/coach-dashboard" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">← Coach dashboard</Link><p className="mt-5 text-sm font-medium text-emerald-300">Recruiting workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Athlete lists</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Build, organize, and review your athlete groups in one place.</p></div><div className="flex w-full gap-2 sm:w-auto"><input value={newListName} onChange={(event) => setNewListName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') createList(); }} placeholder="New list name" className="input min-w-0 bg-white text-slate-900 sm:w-56" maxLength={80} /><button type="button" disabled={!newListName.trim() || saving} onClick={createList} className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-400 disabled:opacity-50">Create</button></div></div></header>
    {error && <p role="alert" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</p>}
    {lists.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><h2 className="text-xl font-bold text-slate-950">No lists yet</h2><p className="mt-2 text-sm text-slate-500">Create a list, then add athletes from the directory.</p></div> : <>
      <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between"><label className="block lg:max-w-sm lg:flex-1"><span className="mb-2 block text-sm font-semibold text-slate-700">Select a list</span><select value={selectedListId} onChange={(event) => chooseList(event.target.value)} className="input">{lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</select></label><div className="flex flex-col gap-2 sm:flex-row"><input value={editedListName} onChange={(event) => setEditedListName(event.target.value)} className="input sm:w-64" maxLength={80} aria-label="Selected list name" /><button type="button" disabled={!editedListName.trim() || saving} onClick={renameList} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Rename list</button><button type="button" disabled={saving} onClick={deleteList} className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">Delete list</button></div></div>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6"><div><h2 className="text-xl font-bold text-slate-950">{selectedList?.name}</h2><p className="mt-1 text-sm text-slate-500">{selectedAthletes.length} {selectedAthletes.length === 1 ? 'athlete' : 'athletes'}</p></div><Link href="/#all-profiles" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Browse athletes</Link></div>{selectedAthletes.length === 0 ? <div className="px-6 py-16 text-center text-sm text-slate-500">No athletes in this list yet.</div> : <div className="overflow-x-auto"><table className="min-w-[2200px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{['Athlete', 'Username', 'Sport', 'Position', 'Class', 'High school', 'Height', 'Weight', 'GPA', 'Bio', 'Stats', 'Measurables', 'Phone', 'Email', 'Hudl', 'Instagram', 'TikTok', 'YouTube', 'X', ''].map((heading) => <th key={heading} className="whitespace-nowrap px-4 py-3 font-bold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{selectedAthletes.map((athlete) => <tr key={athlete.id} className="align-top hover:bg-slate-50"><td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-950"><Link href={`/${athlete.username}`} className="hover:text-blue-700">{[athlete.first_name, athlete.last_name].filter(Boolean).join(' ') || athlete.username}</Link></td><td className="whitespace-nowrap px-4 py-4 text-slate-500">@{athlete.username}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.sport || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.position || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.graduating_class || '—'}</td><td className="max-w-48 px-4 py-4 text-slate-700">{athlete.high_school || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.height || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.weight || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.gpa || '—'}</td><td className="max-w-64 whitespace-pre-wrap px-4 py-4 text-slate-600">{athlete.bio || '—'}</td><td className="max-w-56 whitespace-pre-wrap px-4 py-4 text-slate-600">{formatJson(athlete.stats)}</td><td className="max-w-56 whitespace-pre-wrap px-4 py-4 text-slate-600">{formatJson(athlete.measurables)}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.phone_number || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.contact_email || '—'}</td>{[athlete.hudl_highlight_url, athlete.instagram_url, athlete.tiktok_url, athlete.youtube_url, athlete.x_url].map((url, index) => <td key={index} className="max-w-48 px-4 py-4">{url ? <a href={url} target="_blank" rel="noreferrer" className="break-all text-blue-600 hover:text-blue-700">{url}</a> : <span className="text-slate-400">—</span>}</td>)}<td className="whitespace-nowrap px-4 py-4"><button type="button" onClick={() => removeAthlete(athlete)} className="font-semibold text-rose-600 hover:text-rose-700">Remove</button></td></tr>)}</tbody></table></div>}</section>
    </>}
  </div></main>;
}

function formatJson(value: unknown) {
  if (!value || typeof value !== 'object') return '—';
  return Object.entries(value as Record<string, unknown>).map(([key, entry]) => `${key}: ${String(entry)}`).join('\n') || '—';
}
