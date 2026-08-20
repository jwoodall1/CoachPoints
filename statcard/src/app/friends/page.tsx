'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/AuthProvider';
import ProfileAvatar from '@/components/ProfileAvatar';
import { supabase } from '@/lib/supabase';

type ActiveTab = 'requests' | 'friends';
type AccountType = 'athlete' | 'coach';
type FriendConnection = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  accepted_at: string | null;
};
type Person = {
  id: string;
  username: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  accountType: AccountType | null;
  sport: string | null;
  detail: string | null;
  resolved: boolean;
};
type FriendSnapshot = {
  connections: FriendConnection[];
  people: Person[];
  error: string | null;
};

const connectionColumns = 'id, requester_id, recipient_id, status, created_at, accepted_at';

/** Loads every relevant relationship first, then fetches the referenced people in two batches. */
async function fetchFriendSnapshot(userId: string): Promise<FriendSnapshot> {
  const { data: connectionData, error: connectionError } = await supabase
    .from('friend_connections')
    .select(connectionColumns)
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (connectionError) return { connections: [], people: [], error: connectionError.message };

  const connections = (connectionData ?? []) as FriendConnection[];
  const profileIds = Array.from(new Set(connections.flatMap((connection) => [connection.requester_id, connection.recipient_id])))
    .filter((id) => id !== userId);

  if (!profileIds.length) return { connections, people: [], error: null };

  const [athleteResult, coachResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, first_name, last_name, avatar_url, sport, position, high_school')
      .in('id', profileIds),
    supabase
      .from('coachprofiles')
      .select('id, username, first_name, last_name, avatar_url, sport, college_university')
      .in('id', profileIds),
  ]);

  const athletes: Person[] = (athleteResult.data ?? []).map((profile) => ({
    id: profile.id,
    username: profile.username,
    firstName: profile.first_name ?? '',
    lastName: profile.last_name ?? '',
    avatarUrl: profile.avatar_url,
    accountType: 'athlete',
    sport: profile.sport,
    detail: [profile.position, profile.high_school].filter(Boolean).join(' · ') || null,
    resolved: true,
  }));
  const coaches: Person[] = (coachResult.data ?? []).map((profile) => ({
    id: profile.id,
    username: profile.username,
    firstName: profile.first_name ?? '',
    lastName: profile.last_name ?? '',
    avatarUrl: profile.avatar_url,
    accountType: 'coach',
    sport: profile.sport,
    detail: profile.college_university,
    resolved: true,
  }));
  const profileError = athleteResult.error ?? coachResult.error;

  return { connections, people: [...athletes, ...coaches], error: profileError?.message ?? null };
}

async function loadFriendSnapshot(userId: string): Promise<FriendSnapshot> {
  try {
    return await fetchFriendSnapshot(userId);
  } catch (error) {
    return {
      connections: [],
      people: [],
      error: error instanceof Error ? error.message : 'Unable to load your friends right now.',
    };
  }
}

/** Lets signed-in athletes and coaches review requests and manage mutual friendships. */
export default function FriendsPage() {
  const router = useRouter();
  const { ready, user } = useAuth();
  const userId = user?.id ?? null;
  const dashboardHref = user?.user_metadata.account_type === 'coach' ? '/coach-dashboard' : '/dashboard';
  const [activeTab, setActiveTab] = useState<ActiveTab>('requests');
  const [connections, setConnections] = useState<FriendConnection[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const requestRef = useRef(0);
  const currentUserRef = useRef(userId);

  const reload = useCallback(async (showLoading = true) => {
    if (!userId) return;
    const requestId = ++requestRef.current;
    // Defer updates so an auth-triggered load never synchronously cascades from an effect.
    await Promise.resolve();
    if (!mountedRef.current || currentUserRef.current !== userId || requestId !== requestRef.current) return;
    if (showLoading) setLoading(true);
    setError(null);
    const snapshot = await loadFriendSnapshot(userId);
    if (!mountedRef.current || currentUserRef.current !== userId || requestId !== requestRef.current) return;
    setConnections(snapshot.connections);
    setPeople(snapshot.people);
    setError(snapshot.error);
    setLoadedUserId(userId);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
    };
  }, []);

  useEffect(() => {
    currentUserRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (!ready) return;
    if (!userId) {
      router.replace('/login');
      return;
    }
    const requestId = ++requestRef.current;
    void loadFriendSnapshot(userId).then((snapshot) => {
      if (!mountedRef.current || currentUserRef.current !== userId || requestId !== requestRef.current) return;
      setConnections(snapshot.connections);
      setPeople(snapshot.people);
      setError(snapshot.error);
      setLoadedUserId(userId);
      setLoading(false);
    });
    return () => {
      if (requestRef.current === requestId) requestRef.current += 1;
    };
  }, [ready, router, userId]);

  useEffect(() => {
    if (!ready || !userId) return;
    const refresh = () => void reload(false);
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [ready, reload, userId]);

  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);
  const incoming = connections.filter((connection) => connection.status === 'pending' && connection.recipient_id === userId);
  const sent = connections.filter((connection) => connection.status === 'pending' && connection.requester_id === userId);
  const friends = connections
    .filter((connection) => connection.status === 'accepted')
    .sort((left, right) => (right.accepted_at ?? right.created_at).localeCompare(left.accepted_at ?? left.created_at));
  const requestCount = incoming.length + sent.length;

  const personFor = (connection: FriendConnection): Person => {
    const otherId = connection.requester_id === userId ? connection.recipient_id : connection.requester_id;
    return peopleById.get(otherId) ?? {
      id: otherId,
      username: null,
      firstName: '',
      lastName: '',
      avatarUrl: null,
      accountType: null,
      sport: null,
      detail: null,
      resolved: false,
    };
  };

  const acceptRequest = async (connection: FriendConnection) => {
    if (!personFor(connection).resolved) {
      setError('This profile could not be loaded. Try again before accepting the request.');
      return;
    }
    setActionId(connection.id);
    setError(null);
    try {
      const { error: acceptError } = await supabase.rpc('accept_friend_request', { connection_id: connection.id });
      if (!mountedRef.current || currentUserRef.current !== userId) return;
      if (acceptError) setError(acceptError.message);
      else await reload(false);
    } catch (mutationError) {
      if (mountedRef.current && currentUserRef.current === userId) setError(mutationError instanceof Error ? mutationError.message : 'Unable to accept this request.');
    } finally {
      if (mountedRef.current && currentUserRef.current === userId) setActionId(null);
    }
  };

  const deleteConnection = async (connection: FriendConnection, confirmRemoval = false) => {
    const person = personFor(connection);
    const name = displayName(person);
    if (confirmRemoval && !window.confirm(`Remove ${name} from your friends? You can send each other a new request later.`)) return;
    setActionId(connection.id);
    setError(null);
    try {
      const { data: deleted, error: deleteError } = await supabase.rpc('delete_friend_connection', { connection_id: connection.id, expected_status: connection.status });
      if (!mountedRef.current || currentUserRef.current !== userId) return;
      if (deleteError) setError(deleteError.message);
      else {
        await reload(false);
        if (deleted !== true && mountedRef.current && currentUserRef.current === userId) {
          setError('This connection changed before your action completed. Its current status is shown now.');
        }
      }
    } catch (mutationError) {
      if (mountedRef.current && currentUserRef.current === userId) setError(mutationError instanceof Error ? mutationError.message : 'Unable to update this connection.');
    } finally {
      if (mountedRef.current && currentUserRef.current === userId) setActionId(null);
    }
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextTab: ActiveTab = event.key === 'Home'
      ? 'requests'
      : event.key === 'End'
        ? 'friends'
        : activeTab === 'requests'
          ? 'friends'
          : 'requests';
    setActiveTab(nextTab);
    document.getElementById(`${nextTab}-tab`)?.focus();
  };

  if (!ready || !userId || loading || loadedUserId !== userId) return <main className="grid min-h-screen place-items-center bg-slate-50 px-4"><p role="status" aria-live="polite" className="text-sm font-medium text-slate-500">Loading your friends…</p></main>;

  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-12"><div className="mx-auto max-w-4xl">
    <header className="mb-8 overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl shadow-slate-200 sm:px-8 sm:py-10">
      <Link href={dashboardHref} className="text-sm font-semibold text-blue-300 transition hover:text-blue-200">← Dashboard</Link>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-medium text-blue-300">Your network</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Friends</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Connections are mutual. A request only becomes a friendship after the other person follows back.</p></div>
        <div className="flex gap-3" aria-label="Connection totals"><div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center"><strong className="block text-xl text-white">{friends.length}</strong><span className="text-xs font-medium text-slate-300">Friends</span></div><div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center"><strong className="block text-xl text-white">{requestCount}</strong><span className="text-xs font-medium text-slate-300">Requests</span></div></div>
      </div>
    </header>

    {error && <div role="alert" className="mb-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between"><span>{error}</span><button type="button" onClick={() => void reload()} className="shrink-0 self-start font-bold text-rose-700 underline decoration-rose-300 underline-offset-4 hover:text-rose-900 sm:self-auto">Try again</button></div>}

    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div role="tablist" aria-label="Friends page sections" className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/70 px-3 pt-3 sm:px-6">
        <TabButton id="requests-tab" panelId="requests-panel" active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} onKeyDown={handleTabKeyDown}>Requests <CountBadge count={requestCount} active={activeTab === 'requests'} /></TabButton>
        <TabButton id="friends-tab" panelId="friends-panel" active={activeTab === 'friends'} onClick={() => setActiveTab('friends')} onKeyDown={handleTabKeyDown}>Friends <CountBadge count={friends.length} active={activeTab === 'friends'} /></TabButton>
      </div>

      {activeTab === 'requests' ? <div id="requests-panel" role="tabpanel" aria-labelledby="requests-tab" tabIndex={0} className="outline-none">
        {requestCount === 0 ? <EmptyState title="No requests yet" description="New follow requests and the requests you send will appear here." /> : <div className="divide-y divide-slate-200">
          <RequestGroup title="Follow requests" description="Follow back to make the connection mutual." emptyText="You have no incoming requests.">
            {incoming.map((connection) => {
              const person = personFor(connection);
              return <PersonRow key={connection.id} person={person}>
                <button type="button" disabled={actionId !== null || !person.resolved} title={!person.resolved ? 'Reload this profile before following back' : undefined} onClick={() => void acceptRequest(connection)} className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-50 sm:flex-none">{actionId === connection.id ? 'Updating…' : 'Follow back'}</button>
                <button type="button" disabled={actionId !== null} onClick={() => void deleteConnection(connection)} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50 sm:flex-none">Delete</button>
              </PersonRow>;
            })}
          </RequestGroup>
          <RequestGroup title="Sent requests" description="Waiting for these people to follow you back." emptyText="You have no sent requests.">
            {sent.map((connection) => <PersonRow key={connection.id} person={personFor(connection)}>
              <span className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-center text-sm font-semibold text-slate-500 sm:flex-none" aria-label="Request pending">Requested</span>
              <button type="button" disabled={actionId !== null} onClick={() => void deleteConnection(connection)} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50 sm:flex-none">{actionId === connection.id ? 'Canceling…' : 'Cancel'}</button>
            </PersonRow>)}
          </RequestGroup>
        </div>}
      </div> : <div id="friends-panel" role="tabpanel" aria-labelledby="friends-tab" tabIndex={0} className="outline-none">
        {friends.length === 0 ? <EmptyState title="No friends yet" description="Browse profiles and send a follow request. You’ll become friends when they follow you back." /> : <div className="divide-y divide-slate-100">{friends.map((connection) => <PersonRow key={connection.id} person={personFor(connection)}>
          <button type="button" disabled={actionId !== null} onClick={() => void deleteConnection(connection, true)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-wait disabled:opacity-50 sm:w-auto">{actionId === connection.id ? 'Removing…' : 'Remove'}</button>
        </PersonRow>)}</div>}
      </div>}
    </section>
  </div></main>;
}

function displayName(person: Person) {
  return [person.firstName, person.lastName].filter(Boolean).join(' ') || person.username || 'Athlio member';
}

/** Keeps identity and actions readable from narrow phones through desktop layouts. */
function PersonRow({ person, children }: { person: Person; children: React.ReactNode }) {
  const name = displayName(person);
  const identity = <div className="flex min-w-0 items-center gap-4">
    {person.avatarUrl ? <ProfileAvatar src={person.avatarUrl} name={name} size="compact" /> : <div aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-slate-100 text-lg font-bold text-slate-400">{name.charAt(0).toUpperCase()}</div>}
    <div className="min-w-0"><p className="truncate font-bold text-slate-950">{name}</p>{person.username && <p className="truncate text-sm text-slate-500">@{person.username}</p>}<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">{person.accountType && <span className={`font-bold uppercase tracking-wide ${person.accountType === 'coach' ? 'text-emerald-700' : 'text-blue-700'}`}>{person.accountType}</span>}{person.sport && <span>{person.sport}</span>}{person.detail && <span className="truncate">{person.detail}</span>}</div></div>
  </div>;

  return <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">{person.username ? <Link href={`/${encodeURIComponent(person.username)}`} className="min-w-0 rounded-xl outline-none transition hover:opacity-75 focus-visible:ring-4 focus-visible:ring-blue-100 sm:flex-1" aria-label={`View ${name}'s profile`}>{identity}</Link> : <div className="min-w-0 sm:flex-1">{identity}</div>}<div className="flex w-full gap-2 sm:ml-auto sm:w-auto sm:shrink-0">{children}</div></div>;
}

function RequestGroup({ title, description, emptyText, children }: { title: string; description: string; emptyText: string; children: React.ReactNode[] }) {
  return <section className="p-5 sm:p-6"><div className="mb-4"><h2 className="text-lg font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>{children.length ? <div className="-mx-5 divide-y divide-slate-100 border-y border-slate-100 sm:-mx-6">{children}</div> : <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">{emptyText}</p>}</section>;
}

function TabButton({ id, panelId, active, onClick, onKeyDown, children }: { id: string; panelId: string; active: boolean; onClick: () => void; onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void; children: React.ReactNode }) {
  return <button id={id} type="button" role="tab" aria-selected={active} aria-controls={panelId} tabIndex={active ? 0 : -1} onClick={onClick} onKeyDown={onKeyDown} className={`flex items-center justify-center gap-2 border-b-2 px-3 py-4 text-sm font-bold transition ${active ? 'border-blue-600 text-slate-950' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'}`}>{children}</button>;
}

function CountBadge({ count, active }: { count: number; active: boolean }) {
  return <span className={`min-w-6 rounded-full px-2 py-0.5 text-xs ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>{count}</span>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="px-6 py-16 text-center sm:py-20"><div aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-full bg-blue-50 text-2xl text-blue-600">♡</div><h2 className="mt-4 text-xl font-bold text-slate-950">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p><Link href="/#all-profiles" className="mt-6 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">Browse profiles</Link></div>;
}
