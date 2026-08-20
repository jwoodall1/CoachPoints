'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/AuthProvider';
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
const tableHeadings = ['Athlete', 'Username', 'Sport', 'Position', 'Class', 'High school', 'Height', 'Weight', 'GPA', 'Bio', 'Stats', 'Measurables', 'Phone', 'Email', 'Hudl', 'Instagram', 'TikTok', 'YouTube', 'X', ''] as const;

type ListSnapshot = { lists: List[]; members: Member[]; athletes: Athlete[]; error: string | null };
type MessageEligibility = {
  listId: string;
  totalAthletes: number;
  connectedAthletes: number;
  canMessage: boolean;
  error: string | null;
};

/** Loads list headers and memberships together, followed by only referenced athletes. */
async function fetchListSnapshot(): Promise<ListSnapshot> {
  const [{ data: listData, error: listError }, { data: memberData, error: memberError }] = await Promise.all([
    supabase.from('coach_lists').select('id, name, created_at').order('created_at', { ascending: true }),
    supabase.from('coach_list_members').select('list_id, athlete_id'),
  ]);
  if (listError || memberError) return { lists: [], members: [], athletes: [], error: (listError ?? memberError)?.message ?? 'Unable to load lists.' };

  const members = memberData ?? [];
  const athleteIds = Array.from(new Set(members.map((member) => member.athlete_id)));
  if (!athleteIds.length) return { lists: listData ?? [], members, athletes: [], error: null };

  const { data: athleteData, error: athleteError } = await supabase.from('profiles').select(athleteColumns).in('id', athleteIds);
  return { lists: listData ?? [], members, athletes: athleteData ?? [], error: athleteError?.message ?? null };
}

async function fetchMessageEligibility(listId: string): Promise<MessageEligibility> {
  const { data, error } = await supabase
    .rpc('get_coach_list_message_eligibility', { target_list_id: listId })
    .single();

  if (error) return { listId, totalAthletes: 0, connectedAthletes: 0, canMessage: false, error: error.message };
  const row = data as { total_athletes: number; connected_athletes: number; can_message: boolean };
  return {
    listId,
    totalAthletes: Number(row.total_athletes) || 0,
    connectedAthletes: Number(row.connected_athletes) || 0,
    canMessage: Boolean(row.can_message),
    error: null,
  };
}

/** Gives coaches a full-width workspace for creating and reviewing athlete lists. */
export default function CoachListsPage() {
  const router = useRouter();
  const { ready, user } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [newListName, setNewListName] = useState('');
  const [editedListName, setEditedListName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageEligibility, setMessageEligibility] = useState<MessageEligibility | null>(null);
  const [messageListOpen, setMessageListOpen] = useState(false);
  const [listMessage, setListMessage] = useState('');
  const [sendingListMessage, setSendingListMessage] = useState(false);
  const [listMessageError, setListMessageError] = useState<string | null>(null);
  const [listMessageSuccess, setListMessageSuccess] = useState<string | null>(null);
  const userId = user?.id ?? null;
  const accountType = user?.user_metadata.account_type === 'coach' ? 'coach' : 'athlete';

  const selectedList = lists.find((list) => list.id === selectedListId) ?? null;
  const selectedAthletes = useMemo(() => {
    const ids = new Set(members.filter((member) => member.list_id === selectedListId).map((member) => member.athlete_id));
    return athletes.filter((athlete) => ids.has(athlete.id));
  }, [athletes, members, selectedListId]);
  const currentMessageEligibility = messageEligibility?.listId === selectedListId ? messageEligibility : null;
  const listMessageAthleteCount = currentMessageEligibility && !currentMessageEligibility.error
    ? currentMessageEligibility.totalAthletes
    : selectedAthletes.length;
  const canMessageSelectedList = Boolean(currentMessageEligibility?.canMessage && listMessageAthleteCount > 0);

  const refreshMessageEligibility = useCallback(async () => {
    if (!selectedListId) return;
    const snapshot = await fetchMessageEligibility(selectedListId);
    setMessageEligibility(snapshot);
  }, [selectedListId]);

  useEffect(() => {
    if (!ready) return;
    if (!userId) {
      router.replace('/login?role=coach');
      return;
    }
    if (accountType !== 'coach') {
      router.replace('/dashboard');
      return;
    }

    let active = true;
    void fetchListSnapshot().then((snapshot) => {
      if (!active) return;
      const firstList = snapshot.lists[0] ?? null;
      setLists(snapshot.lists);
      setMembers(snapshot.members);
      setAthletes(snapshot.athletes);
      setSelectedListId(firstList?.id ?? '');
      setEditedListName(firstList?.name ?? '');
      setError(snapshot.error);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [accountType, ready, router, userId]);

  useEffect(() => {
    if (!selectedListId) return;
    const refresh = () => void refreshMessageEligibility();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    void Promise.resolve().then(refreshMessageEligibility);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [members, refreshMessageEligibility, selectedListId]);

  const chooseList = (id: string) => {
    setSelectedListId(id);
    setEditedListName(lists.find((list) => list.id === id)?.name ?? '');
    setMessageListOpen(false);
    setListMessageError(null);
    setListMessageSuccess(null);
  };

  const createList = async () => {
    const name = newListName.trim();
    if (!name || !userId) return;
    setSaving(true); setError(null);
    const { data, error: createError } = await supabase.from('coach_lists').insert({ coach_id: userId, name }).select('id, name, created_at').single();
    if (createError) setError(createError.message); else {
      setLists((current) => [...current, data]);
      setSelectedListId(data.id);
      setEditedListName(data.name);
      setNewListName('');
    }
    setSaving(false);
  };

  const renameList = async () => {
    if (!selectedList || !editedListName.trim()) return;
    const name = editedListName.trim();
    setSaving(true); setError(null);
    const { error: renameError } = await supabase.from('coach_lists').update({ name, updated_at: new Date().toISOString() }).eq('id', selectedList.id);
    if (renameError) setError(renameError.message); else {
      setLists((current) => current.map((list) => list.id === selectedList.id ? { ...list, name } : list));
      setEditedListName(name);
    }
    setSaving(false);
  };

  const deleteList = async () => {
    if (!selectedList || !window.confirm(`Delete the list “${selectedList.name}”?`)) return;
    setSaving(true); setError(null);
    const { error: deleteError } = await supabase.from('coach_lists').delete().eq('id', selectedList.id);
    if (deleteError) setError(deleteError.message); else {
      const nextLists = lists.filter((list) => list.id !== selectedList.id);
      const nextList = nextLists[0] ?? null;
      setLists(nextLists);
      setMembers((current) => current.filter((member) => member.list_id !== selectedList.id));
      setSelectedListId(nextList?.id ?? '');
      setEditedListName(nextList?.name ?? '');
    }
    setSaving(false);
  };

  const removeAthlete = async (athlete: Athlete) => {
    if (!selectedList) return;
    const { error: removeError } = await supabase.from('coach_list_members').delete().eq('list_id', selectedList.id).eq('athlete_id', athlete.id);
    if (removeError) setError(removeError.message); else setMembers((current) => current.filter((member) => !(member.list_id === selectedList.id && member.athlete_id === athlete.id)));
  };

  const openListMessage = () => {
    setListMessageError(null);
    setMessageListOpen(true);
  };

  const sendListMessage = async () => {
    const body = listMessage.trim();
    if (!selectedList || !canMessageSelectedList || !body || sendingListMessage) return;
    setSendingListMessage(true);
    setListMessageError(null);
    setListMessageSuccess(null);

    const { data, error: sendError } = await supabase.rpc('send_coach_list_message', {
      target_list_id: selectedList.id,
      message_body: body,
    });

    if (sendError) {
      setListMessageError(sendError.message.includes('Every athlete')
        ? 'Every athlete must still be a mutual connection. No messages were sent.'
        : sendError.message);
      await refreshMessageEligibility();
    } else {
      const delivered = Number(data) || listMessageAthleteCount;
      setListMessage('');
      setMessageListOpen(false);
      setListMessageSuccess(`Your message was sent individually to ${delivered} ${delivered === 1 ? 'athlete' : 'athletes'} in ${selectedList.name}.`);
    }
    setSendingListMessage(false);
  };

  if (loading) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-medium text-slate-500">Loading your lists…</main>;

  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-12"><div className="mx-auto max-w-[1600px]">
    <header className="mb-8 rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/coach-dashboard" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">← Coach dashboard</Link><p className="mt-5 text-sm font-medium text-emerald-300">Recruiting workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Athlete lists</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Build, organize, and review your athlete groups in one place.</p></div><div className="flex w-full gap-2 sm:w-auto"><input value={newListName} onChange={(event) => setNewListName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') createList(); }} placeholder="New list name" className="input min-w-0 bg-white text-slate-900 sm:w-56" maxLength={80} /><button type="button" disabled={!newListName.trim() || saving} onClick={createList} className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-400 disabled:opacity-50">Create</button></div></div></header>
    {error && <p role="alert" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</p>}
    {listMessageSuccess && <div role="status" className="mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 sm:flex-row sm:items-center sm:justify-between"><span>{listMessageSuccess}</span><Link href="/messages" className="shrink-0 font-bold text-emerald-800 underline decoration-emerald-300 underline-offset-4">View messages</Link></div>}
    {lists.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><h2 className="text-xl font-bold text-slate-950">No lists yet</h2><p className="mt-2 text-sm text-slate-500">Create a list, then add athletes from the directory.</p></div> : <>
      <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between"><label className="block lg:max-w-sm lg:flex-1"><span className="mb-2 block text-sm font-semibold text-slate-700">Select a list</span><select value={selectedListId} onChange={(event) => chooseList(event.target.value)} className="input">{lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</select></label><div className="flex flex-col gap-2 sm:flex-row"><input value={editedListName} onChange={(event) => setEditedListName(event.target.value)} className="input sm:w-64" maxLength={80} aria-label="Selected list name" /><button type="button" disabled={!editedListName.trim() || saving} onClick={renameList} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Rename list</button><button type="button" disabled={saving} onClick={deleteList} className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">Delete list</button></div></div>
      {listMessageAthleteCount > 0 && currentMessageEligibility && <div className={`mb-5 flex flex-col gap-4 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${canMessageSelectedList ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}><div><p className={`text-sm font-bold ${canMessageSelectedList ? 'text-emerald-900' : 'text-amber-900'}`}>{canMessageSelectedList ? 'This list is ready for messaging' : 'Connect with every athlete to unlock list messaging'}</p><p className={`mt-1 text-sm ${canMessageSelectedList ? 'text-emerald-700' : 'text-amber-700'}`}>{currentMessageEligibility.error ? 'Unable to check mutual connections right now.' : `${currentMessageEligibility.connectedAthletes} of ${currentMessageEligibility.totalAthletes} athletes are mutual connections.`}</p></div>{canMessageSelectedList && <button type="button" onClick={openListMessage} className="shrink-0 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700">Message list</button>}</div>}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6"><div><h2 className="text-xl font-bold text-slate-950">{selectedList?.name}</h2><p className="mt-1 text-sm text-slate-500">{selectedAthletes.length} {selectedAthletes.length === 1 ? 'athlete' : 'athletes'}</p></div><Link href="/#all-profiles" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Browse athletes</Link></div>{selectedAthletes.length === 0 ? <div className="px-6 py-16 text-center text-sm text-slate-500">No athletes in this list yet.</div> : <div className="overflow-x-auto"><table className="min-w-[2200px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{tableHeadings.map((heading) => <th key={heading} className="whitespace-nowrap px-4 py-3 font-bold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{selectedAthletes.map((athlete) => <tr key={athlete.id} className="align-top hover:bg-slate-50"><td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-950"><Link href={`/${athlete.username}`} className="hover:text-blue-700">{[athlete.first_name, athlete.last_name].filter(Boolean).join(' ') || athlete.username}</Link></td><td className="whitespace-nowrap px-4 py-4 text-slate-500">@{athlete.username}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.sport || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.position || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.graduating_class || '—'}</td><td className="max-w-48 px-4 py-4 text-slate-700">{athlete.high_school || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.height || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.weight || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.gpa || '—'}</td><td className="max-w-64 whitespace-pre-wrap px-4 py-4 text-slate-600">{athlete.bio || '—'}</td><td className="max-w-56 whitespace-pre-wrap px-4 py-4 text-slate-600">{formatJson(athlete.stats)}</td><td className="max-w-56 whitespace-pre-wrap px-4 py-4 text-slate-600">{formatJson(athlete.measurables)}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.phone_number || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-slate-700">{athlete.contact_email || '—'}</td>{[athlete.hudl_highlight_url, athlete.instagram_url, athlete.tiktok_url, athlete.youtube_url, athlete.x_url].map((url, index) => <td key={index} className="max-w-48 px-4 py-4">{url ? <a href={url} target="_blank" rel="noreferrer" className="break-all text-blue-600 hover:text-blue-700">{url}</a> : <span className="text-slate-400">—</span>}</td>)}<td className="whitespace-nowrap px-4 py-4"><button type="button" onClick={() => removeAthlete(athlete)} className="font-semibold text-rose-600 hover:text-rose-700">Remove</button></td></tr>)}</tbody></table></div>}</section>
    </>}
  </div>{messageListOpen && selectedList && <ListMessageComposer listName={selectedList.name} athleteCount={listMessageAthleteCount} value={listMessage} sending={sendingListMessage} canSend={canMessageSelectedList} error={listMessageError} onChange={setListMessage} onClose={() => { if (!sendingListMessage) setMessageListOpen(false); }} onSend={() => void sendListMessage()} />}</main>;
}

function ListMessageComposer({ listName, athleteCount, value, sending, canSend, error, onChange, onClose, onSend }: { listName: string; athleteCount: number; value: string; sending: boolean; canSend: boolean; error: string | null; onChange: (value: string) => void; onClose: () => void; onSend: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="list-message-title" className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Individual delivery</p><h2 id="list-message-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Message {listName}</h2><p className="mt-2 text-sm leading-6 text-slate-500">This sends the same private, one-to-one message separately to each of the {athleteCount} {athleteCount === 1 ? 'athlete' : 'athletes'} in this list. Athletes will not see the other recipients.</p></div><button type="button" onClick={onClose} disabled={sending} aria-label="Close list message composer" className="grid size-9 shrink-0 place-items-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50">×</button></div><label className="mt-6 block"><span className="mb-2 block text-sm font-bold text-slate-700">Message</span><textarea autoFocus value={value} onChange={(event) => onChange(event.target.value)} rows={7} maxLength={2000} placeholder="Write your message to the athletes in this list…" className="input resize-y" /></label><div className="mt-2 flex items-center justify-between gap-3"><span className="text-xs text-slate-400">{value.length}/2000</span>{!canSend && <span className="text-xs font-semibold text-amber-700">Connection eligibility changed. Close and try again.</span>}</div>{error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={sending} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button><button type="button" onClick={onSend} disabled={sending || !canSend || !value.trim()} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300">{sending ? 'Sending individually…' : `Send to ${athleteCount} ${athleteCount === 1 ? 'athlete' : 'athletes'}`}</button></div></section></div>;
}

/** Converts stored JSON metrics into compact multi-line table text. */
function formatJson(value: unknown) {
  if (!value || typeof value !== 'object') return '—';
  return Object.entries(value as Record<string, unknown>).map(([key, entry]) => `${key}: ${String(entry)}`).join('\n') || '—';
}
