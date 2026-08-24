'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ListPlus, Plus, X } from 'lucide-react';

import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

type CoachList = { id: string; name: string };
let closeActivePicker: (() => void) | null = null;

/** Lets a signed-in coach add or remove one athlete from private recruiting lists. */
export default function AddToListButton({ athleteId, prominent = false }: { athleteId: string; prominent?: boolean }) {
  const { ready, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<CoachList[]>([]);
  const [memberListIds, setMemberListIds] = useState<string[]>([]);
  const [newListName, setNewListName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const pickerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closePicker = useCallback(() => setOpen(false), []);
  const isCoach = user?.user_metadata.account_type === 'coach';

  useEffect(() => {
    if (!open) return;

    // Only the open picker needs a document-level listener.
    const handleOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (pickerRef.current && !pickerRef.current.contains(target) && !popoverRef.current?.contains(target)) {
        closePicker();
        if (closeActivePicker === closePicker) closeActivePicker = null;
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [closePicker, open]);

  useEffect(() => {
    if (!open) return;

    const positionPopover = () => {
      const anchor = pickerRef.current;
      const popover = popoverRef.current;
      if (!anchor || !popover) return;

      const anchorRect = anchor.getBoundingClientRect();
      const popoverWidth = Math.min(288, window.innerWidth - 32);
      const gap = 8;
      const edge = 16;
      const left = Math.min(Math.max(edge, anchorRect.right - popoverWidth), window.innerWidth - popoverWidth - edge);
      const below = anchorRect.bottom + gap;
      const above = anchorRect.top - popover.offsetHeight - gap;
      const top = below + popover.offsetHeight <= window.innerHeight - edge || above < edge ? below : above;

      setPopoverPosition({ top: Math.max(edge, top), left });
    };

    positionPopover();
    window.addEventListener('resize', positionPopover);
    window.addEventListener('scroll', positionPopover, true);
    return () => {
      window.removeEventListener('resize', positionPopover);
      window.removeEventListener('scroll', positionPopover, true);
    };
  }, [error, lists, loading, open]);

  const loadLists = async () => {
    setLoading(true);
    setError(null);
    const [{ data: listsData, error: listsError }, { data: memberData, error: memberError }] = await Promise.all([
      supabase.from('coach_lists').select('id, name').order('created_at', { ascending: true }),
      supabase.from('coach_list_members').select('list_id').eq('athlete_id', athleteId),
    ]);
    if (listsError || memberError) setError('Unable to load your lists.');
    else {
      setLists(listsData ?? []);
      setMemberListIds((memberData ?? []).map((entry) => entry.list_id));
    }
    setLoading(false);
  };

  const openPicker = async () => {
    if (open) {
      setOpen(false);
      if (closeActivePicker === closePicker) closeActivePicker = null;
      return;
    }
    closeActivePicker?.();
    closeActivePicker = closePicker;
    setError(null);
    setOpen(true);
    await loadLists();
  };

  useEffect(() => () => {
    if (closeActivePicker === closePicker) closeActivePicker = null;
  }, [closePicker]);

  const toggleMembership = async (list: CoachList) => {
    const isMember = memberListIds.includes(list.id);
    setSaving(list.id);
    setError(null);
    const result = isMember
      ? await supabase.from('coach_list_members').delete().eq('list_id', list.id).eq('athlete_id', athleteId)
      : await supabase.from('coach_list_members').insert({ list_id: list.id, athlete_id: athleteId });
    if (result.error) setError(result.error.message);
    else setMemberListIds((current) => isMember ? current.filter((id) => id !== list.id) : [...current, list.id]);
    setSaving(null);
  };

  const createList = async () => {
    const name = newListName.trim();
    if (!name) return;
    if (!user) return setError('Sign in as a coach to create lists.');
    setSaving('new');
    setError(null);
    const { data: list, error: createError } = await supabase.from('coach_lists').insert({ coach_id: user.id, name }).select('id, name').single();
    if (createError || !list) setError(createError?.message ?? 'Unable to create list.');
    else {
      const { error: memberError } = await supabase.from('coach_list_members').insert({ list_id: list.id, athlete_id: athleteId });
      if (memberError) setError(memberError.message);
      else {
        setLists((current) => [...current, list]);
        setMemberListIds((current) => [...current, list.id]);
        setNewListName('');
      }
    }
    setSaving(null);
  };

  if (!ready || !isCoach) return null;

  return <div ref={pickerRef} className="relative" onClick={(event) => event.stopPropagation()}>
    <button type="button" onClick={openPicker} className={`${prominent ? 'min-h-11 bg-emerald-600 px-4 py-2.5 text-sm text-white shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 hover:bg-emerald-700' : 'border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-100'} inline-flex items-center justify-center gap-2 rounded-xl font-extrabold transition`}>
      {open ? <><X className="size-4" />Close lists</> : <><ListPlus className="size-4" />Add to list</>}
    </button>
    {open && typeof document !== 'undefined' && createPortal(<div ref={popoverRef} style={popoverPosition} className="fixed z-50 max-h-[calc(100vh-2rem)] w-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xl shadow-slate-300/40">
      <p className="text-sm font-bold text-slate-950">Save this athlete</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">Choose an existing list or create a new one.</p>
      {loading ? <p className="mt-4 text-sm text-slate-500">Loading lists…</p> : lists.length ? <div className="mt-4 space-y-2">{lists.map((list) => { const selected = memberListIds.includes(list.id); return <button key={list.id} type="button" disabled={saving !== null} onClick={() => toggleMembership(list)} className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition disabled:opacity-60 ${selected ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}><span className="truncate">{list.name}</span><span className={selected ? 'text-emerald-600' : 'text-slate-300'}>{saving === list.id ? '…' : selected ? <Check className="size-4" /> : <Plus className="size-4" />}</span></button>; })}</div> : <p className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-500">You have not created any lists yet.</p>}
      <div className="mt-4 flex gap-2"><input value={newListName} onChange={(event) => setNewListName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') createList(); }} placeholder="New list name" className="input min-w-0 flex-1 text-sm" maxLength={80} /><button type="button" disabled={!newListName.trim() || saving !== null} onClick={createList} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{saving === 'new' ? '…' : 'Create'}</button></div>
      {error && <p role="alert" className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
    </div>, document.body)}
  </div>;
}
