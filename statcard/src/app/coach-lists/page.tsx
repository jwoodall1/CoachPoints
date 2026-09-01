'use client';

import Link from 'next/link';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Bell,
  Download,
  GripVertical,
  ListChecks,
  MessageCircle,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { safeHttpsUrl } from '@/lib/safeExternalUrl';

// ── List, pipeline, and export models ─────────────────────────────────────────

type List = { id: string; name: string; created_at: string };
type Member = { list_id: string; athlete_id: string };
type Stage = 'New' | 'Interested' | 'Contacted' | 'Evaluating' | 'Offer' | 'Archived';
type Pipeline = {
  coach_id: string;
  athlete_id: string;
  stage: Stage;
  notes: string;
  tags: string[];
  reminder: string | null;
  follow_up_date: string | null;
  last_activity_at: string;
  updated_at: string;
};
type Athlete = {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  sport: string | null;
  position: string | null;
  graduating_class: string | null;
  high_school: string | null;
  height: string | null;
  weight: string | null;
  gpa: string | null;
  bio: string | null;
  phone_number: string | null;
  contact_email: string | null;
  hudl_highlight_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  x_url: string | null;
  stats: unknown;
  measurables: unknown;
};

const athleteColumns =
  'id, username, first_name, last_name, sport, position, graduating_class, high_school, height, weight, gpa, bio, hudl_highlight_url, instagram_url, tiktok_url, youtube_url, x_url, stats, measurables';
const tableHeadings = [
  'Athlete',
  'Username',
  'Sport',
  'Position',
  'Class',
  'High school',
  'Height',
  'Weight',
  'GPA',
  'Bio',
  'Stats',
  'Measurables',
  'Phone',
  'Email',
  'Hudl',
  'Instagram',
  'TikTok',
  'YouTube',
  'X',
  '',
] as const;

type ExportColumn = { key: string; label: string; getValue: (athlete: Athlete) => string };
const exportColumns: ExportColumn[] = [
  {
    key: 'athlete',
    label: 'Athlete',
    getValue: (athlete) =>
      [athlete.first_name, athlete.last_name].filter(Boolean).join(' ') || athlete.username,
  },
  { key: 'username', label: 'Username', getValue: (athlete) => `@${athlete.username}` },
  { key: 'sport', label: 'Sport', getValue: (athlete) => athlete.sport ?? '' },
  { key: 'position', label: 'Position', getValue: (athlete) => athlete.position ?? '' },
  {
    key: 'graduating_class',
    label: 'Class',
    getValue: (athlete) => athlete.graduating_class ?? '',
  },
  { key: 'high_school', label: 'High school', getValue: (athlete) => athlete.high_school ?? '' },
  { key: 'height', label: 'Height', getValue: (athlete) => athlete.height ?? '' },
  { key: 'weight', label: 'Weight', getValue: (athlete) => athlete.weight ?? '' },
  { key: 'gpa', label: 'GPA', getValue: (athlete) => athlete.gpa ?? '' },
  { key: 'bio', label: 'Bio', getValue: (athlete) => athlete.bio ?? '' },
  { key: 'stats', label: 'Stats', getValue: (athlete) => formatJson(athlete.stats, '') },
  {
    key: 'measurables',
    label: 'Measurables',
    getValue: (athlete) => formatJson(athlete.measurables, ''),
  },
  { key: 'phone_number', label: 'Phone', getValue: (athlete) => athlete.phone_number ?? '' },
  { key: 'contact_email', label: 'Email', getValue: (athlete) => athlete.contact_email ?? '' },
  {
    key: 'hudl_highlight_url',
    label: 'Hudl',
    getValue: (athlete) => athlete.hudl_highlight_url ?? '',
  },
  { key: 'instagram_url', label: 'Instagram', getValue: (athlete) => athlete.instagram_url ?? '' },
  { key: 'tiktok_url', label: 'TikTok', getValue: (athlete) => athlete.tiktok_url ?? '' },
  { key: 'youtube_url', label: 'YouTube', getValue: (athlete) => athlete.youtube_url ?? '' },
  { key: 'x_url', label: 'X', getValue: (athlete) => athlete.x_url ?? '' },
];

type ListSnapshot = {
  lists: List[];
  members: Member[];
  athletes: Athlete[];
  pipeline: Pipeline[];
  error: string | null;
};
type MessageEligibility = {
  listId: string;
  totalAthletes: number;
  connectedAthletes: number;
  canMessage: boolean;
  error: string | null;
};

/** Loads list headers and memberships together, followed by only referenced athletes. */
async function fetchListSnapshot(): Promise<ListSnapshot> {
  const [
    { data: listData, error: listError },
    { data: memberData, error: memberError },
    { data: pipelineData, error: pipelineError },
  ] = await Promise.all([
    supabase
      .from('coach_lists')
      .select('id, name, created_at')
      .order('created_at', { ascending: true }),
    supabase.from('coach_list_members').select('list_id, athlete_id'),
    supabase
      .from('coach_athlete_pipeline')
      .select(
        'coach_id, athlete_id, stage, notes, tags, reminder, follow_up_date, last_activity_at, updated_at',
      ),
  ]);
  if (listError || memberError || pipelineError)
    return {
      lists: [],
      members: [],
      athletes: [],
      pipeline: [],
      error: (listError ?? memberError ?? pipelineError)?.message ?? 'Unable to load lists.',
    };

  const members = memberData ?? [];
  const athleteIds = Array.from(new Set(members.map((member) => member.athlete_id)));
  if (!athleteIds.length)
    return {
      lists: listData ?? [],
      members,
      athletes: [],
      pipeline: pipelineData ?? [],
      error: null,
    };

  const [athleteResult, contactResult] = await Promise.all([
    supabase.from('public_profile_details').select(athleteColumns).in('id', athleteIds),
    supabase
      .from('profile_contacts')
      .select('user_id, phone_number, contact_email')
      .in('user_id', athleteIds),
  ]);
  const contacts = new Map(
    (contactResult.data ?? []).map((contact) => [contact.user_id, contact] as const),
  );
  const athletes = (athleteResult.data ?? []).map((athlete) => ({
    ...athlete,
    phone_number: contacts.get(athlete.id)?.phone_number ?? null,
    contact_email: contacts.get(athlete.id)?.contact_email ?? null,
  }));
  return {
    lists: listData ?? [],
    members,
    athletes,
    pipeline: pipelineData ?? [],
    error: (athleteResult.error ?? contactResult.error)?.message ?? null,
  };
}

async function fetchMessageEligibility(listId: string): Promise<MessageEligibility> {
  const { data, error } = await supabase
    .rpc('get_coach_list_message_eligibility', { target_list_id: listId })
    .single();

  if (error)
    return {
      listId,
      totalAthletes: 0,
      connectedAthletes: 0,
      canMessage: false,
      error: error.message,
    };
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
  const [pipeline, setPipeline] = useState<Pipeline[]>([]);
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
  const [exportOpen, setExportOpen] = useState(false);
  const [exportOrder, setExportOrder] = useState<string[]>(() =>
    exportColumns.map((column) => column.key),
  );
  const [stageFilter, setStageFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [gpaFilter, setGpaFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('last_activity');
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const userId = user?.id ?? null;
  const accountType = user?.user_metadata.account_type === 'coach' ? 'coach' : 'athlete';

  const selectedList = lists.find((list) => list.id === selectedListId) ?? null;
  const selectedAthletes = useMemo(() => {
    const ids = new Set(
      members
        .filter((member) => member.list_id === selectedListId)
        .map((member) => member.athlete_id),
    );
    const pipelineByAthlete = new Map(pipeline.map((item) => [item.athlete_id, item]));
    const filtered = athletes.filter((athlete) => {
      if (!ids.has(athlete.id)) return false;
      const item = pipelineByAthlete.get(athlete.id);
      const haystack =
        `${athlete.first_name ?? ''} ${athlete.last_name ?? ''} ${athlete.username}`.toLowerCase();
      return (
        (stageFilter === 'All' || (item?.stage ?? 'New') === stageFilter) &&
        (!tagFilter.trim() ||
          (item?.tags ?? []).some((tag) =>
            tag.toLowerCase().includes(tagFilter.trim().toLowerCase()),
          )) &&
        (sportFilter === 'All' || sportFilter === 'All sports' || athlete.sport === sportFilter) &&
        (classFilter === 'All' ||
          classFilter === 'All class years' ||
          athlete.graduating_class === classFilter) &&
        (!gpaFilter || Number(athlete.gpa) >= Number(gpaFilter)) &&
        (!searchFilter.trim() || haystack.includes(searchFilter.trim().toLowerCase()))
      );
    });
    return filtered.sort((a, b) => {
      const pa = pipelineByAthlete.get(a.id);
      const pb = pipelineByAthlete.get(b.id);
      if (sortBy === 'gpa') return Number(b.gpa ?? -Infinity) - Number(a.gpa ?? -Infinity);
      if (sortBy === 'name')
        return `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`);
      return (
        new Date(pb?.last_activity_at ?? 0).getTime() -
        new Date(pa?.last_activity_at ?? 0).getTime()
      );
    });
  }, [
    athletes,
    classFilter,
    gpaFilter,
    members,
    pipeline,
    searchFilter,
    selectedListId,
    sortBy,
    sportFilter,
    stageFilter,
    tagFilter,
  ]);
  const pipelineByAthlete = useMemo(
    () => new Map(pipeline.map((item) => [item.athlete_id, item])),
    [pipeline],
  );
  const sports = useMemo(
    () =>
      Array.from(
        new Set(selectedAthletes.map((athlete) => athlete.sport).filter(Boolean)),
      ) as string[],
    [selectedAthletes],
  );
  const classes = useMemo(
    () =>
      Array.from(
        new Set(selectedAthletes.map((athlete) => athlete.graduating_class).filter(Boolean)),
      ) as string[],
    [selectedAthletes],
  );
  const currentMessageEligibility =
    messageEligibility?.listId === selectedListId ? messageEligibility : null;
  const listMessageAthleteCount =
    currentMessageEligibility && !currentMessageEligibility.error
      ? currentMessageEligibility.totalAthletes
      : selectedAthletes.length;
  const canMessageSelectedList = Boolean(
    currentMessageEligibility?.canMessage && listMessageAthleteCount > 0,
  );

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
      setPipeline(snapshot.pipeline);
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

  // ── List and pipeline actions ───────────────────────────────────────────────

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
    setSaving(true);
    setError(null);
    const { data, error: createError } = await supabase
      .from('coach_lists')
      .insert({ coach_id: userId, name })
      .select('id, name, created_at')
      .single();
    if (createError) setError(createError.message);
    else {
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
    setSaving(true);
    setError(null);
    const { error: renameError } = await supabase
      .from('coach_lists')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', selectedList.id);
    if (renameError) setError(renameError.message);
    else {
      setLists((current) =>
        current.map((list) => (list.id === selectedList.id ? { ...list, name } : list)),
      );
      setEditedListName(name);
    }
    setSaving(false);
  };

  const deleteList = async () => {
    if (!selectedList || !window.confirm(`Delete the list “${selectedList.name}”?`)) return;
    setSaving(true);
    setError(null);
    const { error: deleteError } = await supabase
      .from('coach_lists')
      .delete()
      .eq('id', selectedList.id);
    if (deleteError) setError(deleteError.message);
    else {
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
    const { error: removeError } = await supabase
      .from('coach_list_members')
      .delete()
      .eq('list_id', selectedList.id)
      .eq('athlete_id', athlete.id);
    if (removeError) setError(removeError.message);
    else
      setMembers((current) =>
        current.filter(
          (member) => !(member.list_id === selectedList.id && member.athlete_id === athlete.id),
        ),
      );
  };

  const savePipeline = useCallback(
    async (
      athleteId: string,
      values: Pick<Pipeline, 'stage' | 'notes' | 'tags' | 'reminder' | 'follow_up_date'>,
    ) => {
      if (!userId) return;
      const now = new Date().toISOString();
      const record = {
        coach_id: userId,
        athlete_id: athleteId,
        ...values,
        last_activity_at: now,
        updated_at: now,
      };
      const { data, error: saveError } = await supabase
        .from('coach_athlete_pipeline')
        .upsert(record, { onConflict: 'coach_id,athlete_id' })
        .select()
        .single();
      if (saveError) {
        setError(saveError.message);
        return;
      }
      setPipeline((current) => [
        ...current.filter((item) => item.athlete_id !== athleteId),
        data as Pipeline,
      ]);
      setEditingAthlete(null);
    },
    [userId],
  );

  const moveAthlete = useCallback(
    async (athleteId: string, targetListId: string) => {
      if (!selectedListId || targetListId === selectedListId) return;
      const { error: addError } = await supabase
        .from('coach_list_members')
        .upsert(
          { list_id: targetListId, athlete_id: athleteId },
          { onConflict: 'list_id,athlete_id' },
        );
      if (addError) {
        setError(addError.message);
        return;
      }
      const { error: removeError } = await supabase
        .from('coach_list_members')
        .delete()
        .eq('list_id', selectedListId)
        .eq('athlete_id', athleteId);
      if (removeError) {
        setError(removeError.message);
        return;
      }
      setMembers((current) => [
        ...current.filter(
          (member) => !(member.list_id === selectedListId && member.athlete_id === athleteId),
        ),
        { list_id: targetListId, athlete_id: athleteId },
      ]);
    },
    [selectedListId],
  );

  useEffect(() => {
    if (!editingAthlete) return;
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    root.render(
      <PipelineEditor
        athlete={editingAthlete}
        value={pipelineByAthlete.get(editingAthlete.id)}
        lists={lists}
        members={members}
        currentListId={selectedListId}
        onClose={() => setEditingAthlete(null)}
        onSave={(values) => void savePipeline(editingAthlete.id, values)}
        onMove={(targetListId) => void moveAthlete(editingAthlete.id, targetListId)}
      />,
    );
    return () => {
      root.unmount();
      host.remove();
    };
  }, [
    editingAthlete,
    lists,
    members,
    moveAthlete,
    pipelineByAthlete,
    savePipeline,
    selectedListId,
  ]);

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
      setListMessageError(
        sendError.message.includes('Every athlete')
          ? 'Every athlete must still be a mutual connection. No messages were sent.'
          : sendError.message,
      );
      await refreshMessageEligibility();
    } else {
      const delivered = Number(data) || listMessageAthleteCount;
      setListMessage('');
      setMessageListOpen(false);
      setListMessageSuccess(
        `Your message was sent individually to ${delivered} ${delivered === 1 ? 'athlete' : 'athletes'} in ${selectedList.name}.`,
      );
    }
    setSendingListMessage(false);
  };

  const openExport = () => {
    setExportOrder(exportColumns.map((column) => column.key));
    setExportOpen(true);
  };

  const moveExportColumn = (key: string, direction: -1 | 1) => {
    setExportOrder((current) => {
      const index = current.indexOf(key);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const reorderExportColumns = (fromKey: string, toKey: string) => {
    setExportOrder((current) => {
      const fromIndex = current.indexOf(fromKey);
      const toIndex = current.indexOf(toKey);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return current;
      const next = [...current];
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, fromKey);
      return next;
    });
  };

  const downloadCsv = () => {
    if (!selectedList || !selectedAthletes.length) return;
    const columns = exportOrder
      .map((key) => exportColumns.find((column) => column.key === key))
      .filter((column): column is ExportColumn => Boolean(column));
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [
      columns.map((column) => escapeCsv(column.label)).join(','),
      ...selectedAthletes.map((athlete) =>
        columns.map((column) => escapeCsv(column.getValue(athlete))).join(','),
      ),
    ].join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${
      selectedList.name
        .trim()
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase() || 'athlete-list'
    }.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  if (loading) return <main className="loading-shell">Loading your recruiting lists…</main>;

  return (
    <main className="min-h-screen pb-20 pt-8 sm:pt-10">
      <div className="page-shell max-w-[1600px]">
        <header className="athletic-grid relative mb-8 overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-300/50 sm:px-8 sm:py-10">
          <div className="absolute -right-16 -top-24 size-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                href="/coach-dashboard"
                className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-300 hover:text-emerald-200"
              >
                <ArrowLeft className="size-3.5" />
                Coach dashboard
              </Link>
              <div className="mt-5 flex items-start gap-4">
                <span className="hidden size-12 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-200 sm:grid">
                  <ListChecks className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-300">
                    Recruiting workspace
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                    Athlete lists
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                    Build focused prospect groups, compare athlete details, and message qualified
                    lists.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex w-full gap-2 lg:w-auto">
              <input
                value={newListName}
                onChange={(event) => setNewListName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') createList();
                }}
                placeholder="Name a new list"
                className="input min-w-0 bg-white text-slate-900 lg:w-60"
                maxLength={80}
              />
              <button
                type="button"
                disabled={!newListName.trim() || saving}
                onClick={createList}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                <Plus className="size-4" />
                Create
              </button>
            </div>
          </div>
        </header>
        {error && (
          <p
            role="alert"
            className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"
          >
            {error}
          </p>
        )}
        {listMessageSuccess && (
          <div
            role="status"
            className="mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{listMessageSuccess}</span>
            <Link
              href="/messages"
              className="shrink-0 font-bold text-emerald-800 underline decoration-emerald-300 underline-offset-4"
            >
              View messages
            </Link>
          </div>
        )}
        {lists.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-bold text-slate-950">No lists yet</h2>
            <p className="mt-2 text-sm text-slate-500">
              Create a list, then add athletes from the directory.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
              <label className="block lg:max-w-sm lg:flex-1">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Select a list
                </span>
                <select
                  value={selectedListId}
                  onChange={(event) => chooseList(event.target.value)}
                  className="input"
                >
                  {lists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={editedListName}
                  onChange={(event) => setEditedListName(event.target.value)}
                  className="input sm:w-64"
                  maxLength={80}
                  aria-label="Selected list name"
                />
                <button
                  type="button"
                  disabled={!editedListName.trim() || saving}
                  onClick={renameList}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Rename list
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={deleteList}
                  className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                >
                  Delete list
                </button>
              </div>
            </div>
            {listMessageAthleteCount > 0 && currentMessageEligibility && (
              <div
                className={`mb-5 flex flex-col gap-4 rounded-2xl border px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${canMessageSelectedList ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}
              >
                <div>
                  <p
                    className={`text-sm font-extrabold ${canMessageSelectedList ? 'text-emerald-900' : 'text-amber-900'}`}
                  >
                    {canMessageSelectedList
                      ? 'This list is ready for messaging'
                      : 'Connect with every athlete to unlock list messaging'}
                  </p>
                  <p
                    className={`mt-1 text-sm ${canMessageSelectedList ? 'text-emerald-700' : 'text-amber-700'}`}
                  >
                    {currentMessageEligibility.error
                      ? 'Unable to check mutual connections right now.'
                      : `${currentMessageEligibility.connectedAthletes} of ${currentMessageEligibility.totalAthletes} athletes are mutual connections.`}
                  </p>
                </div>
                {canMessageSelectedList && (
                  <button
                    type="button"
                    onClick={openListMessage}
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/15 transition hover:-translate-y-0.5 hover:bg-emerald-700"
                  >
                    <MessageCircle className="size-4" />
                    Message list
                  </button>
                )}
              </div>
            )}
            <section className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Search className="size-4 text-slate-400" />
                <h2 className="font-bold text-slate-950">Find and organize prospects</h2>
                <span className="ml-auto text-xs font-semibold text-slate-400">
                  Shared across all lists
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  value={searchFilter}
                  onChange={(event) => setSearchFilter(event.target.value)}
                  placeholder="Search athlete"
                  className="input"
                  aria-label="Search athlete"
                />
                <select
                  value={stageFilter}
                  onChange={(event) => setStageFilter(event.target.value)}
                  className="input"
                  aria-label="Filter by stage"
                >
                  <option>All</option>
                  {(
                    ['New', 'Interested', 'Contacted', 'Evaluating', 'Offer', 'Archived'] as Stage[]
                  ).map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
                <input
                  value={tagFilter}
                  onChange={(event) => setTagFilter(event.target.value)}
                  placeholder="Filter by tag"
                  className="input"
                  aria-label="Filter by tag"
                />
                <select
                  value={sportFilter}
                  onChange={(event) => setSportFilter(event.target.value)}
                  className="input"
                  aria-label="Filter by sport"
                >
                  <option>All sports</option>
                  {sports.map((sport) => (
                    <option key={sport}>{sport}</option>
                  ))}
                </select>
                <select
                  value={classFilter}
                  onChange={(event) => setClassFilter(event.target.value)}
                  className="input"
                  aria-label="Filter by class year"
                >
                  <option>All class years</option>
                  {classes.map((year) => (
                    <option key={year}>{year}</option>
                  ))}
                </select>
                <input
                  value={gpaFilter}
                  onChange={(event) => setGpaFilter(event.target.value)}
                  type="number"
                  min="0"
                  max="4"
                  step="0.01"
                  placeholder="Minimum GPA"
                  className="input"
                  aria-label="Minimum GPA"
                />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="input"
                  aria-label="Sort athletes"
                >
                  <option value="last_activity">Sort: last activity</option>
                  <option value="name">Sort: name</option>
                  <option value="gpa">Sort: GPA</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setStageFilter('All');
                    setTagFilter('');
                    setSportFilter('All');
                    setClassFilter('All');
                    setGpaFilter('');
                    setSearchFilter('');
                  }}
                  className="btn-secondary"
                >
                  Clear filters
                </button>
              </div>
            </section>
            <section className="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <h2 className="text-xl font-bold text-slate-950">Pipeline details</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Notes, tags, and follow-ups stay with the athlete across every list.
                </p>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {selectedAthletes.map((athlete) => {
                  const item = pipelineByAthlete.get(athlete.id);
                  return (
                    <article
                      key={athlete.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/${athlete.username}`}
                            className="font-bold text-slate-950 hover:text-blue-700"
                          >
                            {[athlete.first_name, athlete.last_name].filter(Boolean).join(' ') ||
                              athlete.username}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500">
                            {athlete.sport || 'Sport not set'} · Class{' '}
                            {athlete.graduating_class || '—'} · GPA {athlete.gpa || '—'}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          {item?.stage ?? 'New'}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(item?.tags ?? []).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                        {!item?.tags?.length && (
                          <span className="text-xs text-slate-400">No tags yet</span>
                        )}
                      </div>
                      <p className="mt-3 line-clamp-2 text-xs text-slate-500">
                        {item?.notes || 'No private notes'}
                      </p>
                      {item?.follow_up_date && (
                        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-700">
                          <Bell className="size-3" />
                          Follow up {item.follow_up_date}
                          {item.reminder ? ` · ${item.reminder}` : ''}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingAthlete(athlete)}
                        className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-brand-300 hover:text-brand-700"
                      >
                        Manage pipeline
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
            {selectedAthletes.length > 0 && (
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={openExport}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  <Download className="size-4" />
                  Export CSV
                </button>
              </div>
            )}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">{selectedList?.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedAthletes.length}{' '}
                    {selectedAthletes.length === 1 ? 'athlete' : 'athletes'}
                  </p>
                </div>
                <Link
                  href="/#all-profiles"
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Browse athletes
                </Link>
              </div>
              {selectedAthletes.length === 0 ? (
                <div className="px-6 py-16 text-center text-sm text-slate-500">
                  No athletes in this list yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[2200px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        {tableHeadings.map((heading) => (
                          <th key={heading} className="whitespace-nowrap px-4 py-3 font-bold">
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedAthletes.map((athlete) => (
                        <tr key={athlete.id} className="align-top hover:bg-slate-50">
                          <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-950">
                            <Link href={`/${athlete.username}`} className="hover:text-blue-700">
                              {[athlete.first_name, athlete.last_name].filter(Boolean).join(' ') ||
                                athlete.username}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                            @{athlete.username}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                            {athlete.sport || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                            {athlete.position || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                            {athlete.graduating_class || '—'}
                          </td>
                          <td className="max-w-48 px-4 py-4 text-slate-700">
                            {athlete.high_school || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                            {athlete.height || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                            {athlete.weight || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                            {athlete.gpa || '—'}
                          </td>
                          <td className="max-w-64 whitespace-pre-wrap px-4 py-4 text-slate-600">
                            {athlete.bio || '—'}
                          </td>
                          <td className="max-w-56 whitespace-pre-wrap px-4 py-4 text-slate-600">
                            {formatJson(athlete.stats)}
                          </td>
                          <td className="max-w-56 whitespace-pre-wrap px-4 py-4 text-slate-600">
                            {formatJson(athlete.measurables)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                            {athlete.phone_number || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                            {athlete.contact_email || '—'}
                          </td>
                          {[
                            athlete.hudl_highlight_url,
                            athlete.instagram_url,
                            athlete.tiktok_url,
                            athlete.youtube_url,
                            athlete.x_url,
                          ].map((url, index) => (
                            <td key={index} className="max-w-48 px-4 py-4">
                              {safeHttpsUrl(url) ? (
                                <a
                                  href={safeHttpsUrl(url) ?? '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="break-all text-blue-600 hover:text-blue-700"
                                >
                                  {url}
                                </a>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                          ))}
                          <td className="whitespace-nowrap px-4 py-4">
                            <button
                              type="button"
                              onClick={() => removeAthlete(athlete)}
                              className="font-semibold text-rose-600 hover:text-rose-700"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
      {messageListOpen && selectedList && (
        <ListMessageComposer
          listName={selectedList.name}
          athleteCount={listMessageAthleteCount}
          value={listMessage}
          sending={sendingListMessage}
          canSend={canMessageSelectedList}
          error={listMessageError}
          onChange={setListMessage}
          onClose={() => {
            if (!sendingListMessage) setMessageListOpen(false);
          }}
          onSend={() => void sendListMessage()}
        />
      )}
      {exportOpen && selectedList && (
        <ExportColumnDialog
          listName={selectedList.name}
          columns={exportOrder
            .map((key) => exportColumns.find((column) => column.key === key))
            .filter((column): column is ExportColumn => Boolean(column))}
          onMove={moveExportColumn}
          onReorder={reorderExportColumns}
          onClose={() => setExportOpen(false)}
          onExport={downloadCsv}
        />
      )}
    </main>
  );
}

// ── List workspace dialogs and editors ───────────────────────────────────────

function PipelineEditor({
  athlete,
  value,
  lists,
  members,
  currentListId,
  onClose,
  onSave,
  onMove,
}: {
  athlete: Athlete;
  value?: Pipeline;
  lists: List[];
  members: Member[];
  currentListId: string;
  onClose: () => void;
  onSave: (
    values: Pick<Pipeline, 'stage' | 'notes' | 'tags' | 'reminder' | 'follow_up_date'>,
  ) => void;
  onMove: (targetListId: string) => void;
}) {
  const [stage, setStage] = useState<Stage>(value?.stage ?? 'New');
  const [notes, setNotes] = useState(value?.notes ?? '');
  const [tags, setTags] = useState((value?.tags ?? []).join(', '));
  const [reminder, setReminder] = useState(value?.reminder ?? '');
  const [followUp, setFollowUp] = useState(value?.follow_up_date ?? '');
  const [targetListId, setTargetListId] = useState('');
  const otherLists = lists.filter(
    (list) =>
      list.id !== currentListId &&
      !members.some((member) => member.list_id === list.id && member.athlete_id === athlete.id),
  );
  const name =
    [athlete.first_name, athlete.last_name].filter(Boolean).join(' ') || athlete.username;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pipeline-editor-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-600">
              Recruiting pipeline
            </p>
            <h2
              id="pipeline-editor-title"
              className="mt-1 text-2xl font-black tracking-tight text-slate-950"
            >
              {name}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              These details follow the athlete across every list.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close pipeline editor"
            className="grid size-9 shrink-0 place-items-center rounded-xl text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>
        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Stage</span>
          <select
            value={stage}
            onChange={(event) => setStage(event.target.value as Stage)}
            className="input"
          >
            {(['New', 'Interested', 'Contacted', 'Evaluating', 'Offer', 'Archived'] as Stage[]).map(
              (option) => (
                <option key={option}>{option}</option>
              ),
            )}
          </select>
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Private notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            maxLength={4000}
            placeholder="Add context for your staff…"
            className="input resize-y"
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Tags</span>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="needs film, academic fit, priority"
            className="input"
          />
          <span className="mt-1 block text-xs text-slate-400">Separate tags with commas.</span>
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Follow-up date</span>
            <input
              type="date"
              value={followUp}
              onChange={(event) => setFollowUp(event.target.value)}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Reminder</span>
            <input
              value={reminder}
              onChange={(event) => setReminder(event.target.value)}
              placeholder="Call, email, review film…"
              className="input"
            />
          </label>
        </div>
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <p className="text-sm font-bold text-slate-800">Move to another list</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <select
              value={targetListId}
              onChange={(event) => setTargetListId(event.target.value)}
              className="input"
            >
              <option value="">Keep in this list</option>
              {otherLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
            {targetListId && (
              <button
                type="button"
                onClick={() => {
                  onMove(targetListId);
                  onClose();
                }}
                className="btn-secondary whitespace-nowrap"
              >
                Move athlete
              </button>
            )}
          </div>
          {!otherLists.length && (
            <p className="mt-2 text-xs text-slate-500">
              This athlete is already in every other list.
            </p>
          )}
        </div>
        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({
                stage,
                notes,
                tags: tags
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean),
                reminder: reminder || null,
                follow_up_date: followUp || null,
              })
            }
            className="btn-primary"
          >
            Save pipeline
          </button>
        </div>
      </section>
    </div>
  );
}

function ListMessageComposer({
  listName,
  athleteCount,
  value,
  sending,
  canSend,
  error,
  onChange,
  onClose,
  onSend,
}: {
  listName: string;
  athleteCount: number;
  value: string;
  sending: boolean;
  canSend: boolean;
  error: string | null;
  onChange: (value: string) => void;
  onClose: () => void;
  onSend: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="list-message-title"
        className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
              Individual delivery
            </p>
            <h2
              id="list-message-title"
              className="mt-1 text-2xl font-bold tracking-tight text-slate-950"
            >
              Message {listName}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This sends the same private, one-to-one message separately to each of the{' '}
              {athleteCount} {athleteCount === 1 ? 'athlete' : 'athletes'} in this list. Athletes
              will not see the other recipients.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            aria-label="Close list message composer"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            ×
          </button>
        </div>
        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Message</span>
          <textarea
            autoFocus
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={7}
            maxLength={2000}
            placeholder="Write your message to the athletes in this list…"
            className="input resize-y"
          />
        </label>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">{value.length}/2000</span>
          {!canSend && (
            <span className="text-xs font-semibold text-amber-700">
              Connection eligibility changed. Close and try again.
            </span>
          )}
        </div>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={sending || !canSend || !value.trim()}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {sending
              ? 'Sending individually…'
              : `Send to ${athleteCount} ${athleteCount === 1 ? 'athlete' : 'athletes'}`}
          </button>
        </div>
      </section>
    </div>
  );
}

function ExportColumnDialog({
  listName,
  columns,
  onMove,
  onReorder,
  onClose,
  onExport,
}: {
  listName: string;
  columns: ExportColumn[];
  onMove: (key: string, direction: -1 | 1) => void;
  onReorder: (fromKey: string, toKey: string) => void;
  onClose: () => void;
  onExport: () => void;
}) {
  const [draggedKey, setDraggedKey] = useState<string | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-columns-title"
        className="flex max-h-[min(760px,calc(100vh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-600">
              CSV export
            </p>
            <h2
              id="export-columns-title"
              className="mt-1 text-2xl font-black tracking-tight text-slate-950"
            >
              Arrange your columns
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Choose the order for the {listName} export. Drag a field into place or use the arrow
              controls.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close CSV export"
            className="grid size-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </header>
        <div className="overflow-y-auto bg-slate-50/70 px-6 py-5 sm:px-8">
          <div className="grid gap-2">
            {columns.map((column, index) => (
              <div
                key={column.key}
                draggable
                onDragStart={() => setDraggedKey(column.key)}
                onDragEnd={() => setDraggedKey(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedKey) onReorder(draggedKey, column.key);
                  setDraggedKey(null);
                }}
                className={`flex items-center gap-3 rounded-2xl border bg-white px-3 py-3 shadow-sm transition ${draggedKey === column.key ? 'border-brand-400 opacity-60' : 'border-slate-200 hover:border-brand-200 hover:shadow-md'}`}
              >
                <GripVertical
                  className="size-5 shrink-0 cursor-grab text-slate-400"
                  aria-hidden="true"
                />
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-500">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-800">
                  {column.label}
                </span>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => onMove(column.key, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${column.label} up`}
                    className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-25"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(column.key, 1)}
                    disabled={index === columns.length - 1}
                    aria-label={`Move ${column.label} down`}
                    className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-25"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs font-medium text-slate-400">
            {columns.length} columns · CSV format
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={onExport} className="btn-primary">
              <Download className="size-4" />
              Download CSV
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

/** Converts stored JSON metrics into compact multi-line table text. */
function formatJson(value: unknown, emptyValue = '—') {
  if (!value || typeof value !== 'object') return emptyValue;
  return (
    Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => `${key}: ${String(entry)}`)
      .join('\n') || emptyValue
  );
}
