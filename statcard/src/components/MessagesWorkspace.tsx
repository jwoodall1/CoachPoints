'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { OnlineStatus, usePresence } from '@/components/PresenceProvider';
import ProfileAvatar from '@/components/ProfileAvatar';
import { supabase } from '@/lib/supabase';

type AccountType = 'athlete' | 'coach';
type Person = {
  id: string;
  username: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  accountType: AccountType | null;
};
type InboxRow = {
  friend_id: string;
  last_message_id: string | null;
  last_message_body: string | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  unread_count: number;
};
type InboxItem = {
  person: Person;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
  lastMessageSenderId: string | null;
  unreadCount: number;
};
type DirectMessage = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};
type InboxSnapshot = { items: InboxItem[]; error: string | null };

const messageColumns = 'id, sender_id, recipient_id, body, created_at, read_at';

function resolveAvatarUrl(username: string | null, storedUrl: string | null) {
  if (storedUrl) return storedUrl;
  if (!username) return null;
  const { data } = supabase.storage.from('avatars').getPublicUrl(`${username}/profile.png`);
  return data.publicUrl;
}

function displayName(person: Person) {
  return [person.firstName, person.lastName].filter(Boolean).join(' ') || person.username || 'Rosterra member';
}

async function loadInbox(): Promise<InboxSnapshot> {
  const { data, error } = await supabase.rpc('get_direct_message_inbox');
  if (error) return { items: [], error: error.message };

  const rows = (data ?? []) as InboxRow[];
  const friendIds = rows.map((row) => row.friend_id);
  if (!friendIds.length) return { items: [], error: null };

  const [athleteResult, coachResult] = await Promise.all([
    supabase.from('profiles').select('id, username, first_name, last_name, avatar_url').in('id', friendIds),
    supabase.from('coachprofiles').select('id, username, first_name, last_name, avatar_url').in('id', friendIds),
  ]);

  if (athleteResult.error || coachResult.error) {
    return { items: [], error: athleteResult.error?.message ?? coachResult.error?.message ?? 'Unable to load profiles.' };
  }

  const people: Person[] = [
    ...(athleteResult.data ?? []).map((profile) => ({
      id: profile.id,
      username: profile.username,
      firstName: profile.first_name ?? '',
      lastName: profile.last_name ?? '',
      avatarUrl: resolveAvatarUrl(profile.username, profile.avatar_url),
      accountType: 'athlete' as const,
    })),
    ...(coachResult.data ?? []).map((profile) => ({
      id: profile.id,
      username: profile.username,
      firstName: profile.first_name ?? '',
      lastName: profile.last_name ?? '',
      avatarUrl: resolveAvatarUrl(profile.username, profile.avatar_url),
      accountType: 'coach' as const,
    })),
  ];
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const items = rows.map((row): InboxItem => ({
    person: peopleById.get(row.friend_id) ?? {
      id: row.friend_id,
      username: null,
      firstName: '',
      lastName: '',
      avatarUrl: null,
      accountType: null,
    },
    lastMessageBody: row.last_message_body,
    lastMessageAt: row.last_message_at,
    lastMessageSenderId: row.last_message_sender_id,
    unreadCount: Number(row.unread_count) || 0,
  })).sort((left, right) => {
    if (left.lastMessageAt && right.lastMessageAt) return right.lastMessageAt.localeCompare(left.lastMessageAt);
    if (left.lastMessageAt) return -1;
    if (right.lastMessageAt) return 1;
    return displayName(left.person).localeCompare(displayName(right.person));
  });

  return { items, error: null };
}

function addOrReplaceMessage(messages: DirectMessage[], nextMessage: DirectMessage) {
  const existingIndex = messages.findIndex((message) => message.id === nextMessage.id);
  if (existingIndex >= 0) {
    const next = [...messages];
    next[existingIndex] = nextMessage;
    return next;
  }
  return [...messages, nextMessage].sort((left, right) => left.created_at.localeCompare(right.created_at));
}

/** Full inbox and one-to-one conversation experience for accepted connections. */
export default function MessagesWorkspace({ initialRecipientId = null }: { initialRecipientId?: string | null }) {
  const router = useRouter();
  const { ready, user } = useAuth();
  const { connected } = usePresence();
  const userId = user?.id ?? null;
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [inboxError, setInboxError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loadedConversationId, setLoadedConversationId] = useState<string | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [conversationRefreshKey, setConversationRefreshKey] = useState(0);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const selectedRecipientId = initialRecipientId;
  const selectedItem = items.find((item) => item.person.id === selectedRecipientId) ?? null;
  const selectedFriendId = selectedItem?.person.id ?? null;

  const refreshInbox = useCallback(async (showLoading = false) => {
    if (!userId) return;
    if (showLoading) setLoadingInbox(true);
    const snapshot = await loadInbox();
    setItems(snapshot.items);
    setInboxError(snapshot.error);
    setLoadedUserId(userId);
    setLoadingInbox(false);
  }, [userId]);

  useEffect(() => {
    if (!ready) return;
    if (!userId) {
      router.replace('/login');
      return;
    }
    void Promise.resolve().then(() => refreshInbox(true));
  }, [ready, refreshInbox, router, userId]);

  useEffect(() => {
    if (!userId || !selectedRecipientId || !selectedFriendId) {
      return;
    }

    let active = true;

    const loadConversation = async () => {
      await Promise.resolve();
      if (!active) return;
      setLoadingConversation(true);
      setConversationError(null);
      setMessages([]);
      const { data, error } = await supabase
        .from('direct_messages')
        .select(messageColumns)
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${selectedRecipientId}),and(sender_id.eq.${selectedRecipientId},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: false })
        .limit(250);

      if (!active) return;
      if (error) {
        setConversationError(error.message);
        setMessages([]);
      } else {
        setMessages(((data ?? []) as DirectMessage[]).reverse());
        const readAt = new Date().toISOString();
        const { error: readError } = await supabase
          .from('direct_messages')
          .update({ read_at: readAt })
          .eq('sender_id', selectedRecipientId)
          .eq('recipient_id', userId)
          .is('read_at', null);
        if (active && readError) setConversationError(readError.message);
        if (active) void refreshInbox();
      }
      if (active) {
        setLoadedConversationId(selectedRecipientId);
        setLoadingConversation(false);
      }
    };

    void loadConversation();
    return () => {
      active = false;
    };
  }, [conversationRefreshKey, refreshInbox, selectedFriendId, selectedRecipientId, userId]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`direct-messages-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `recipient_id=eq.${userId}` }, (payload) => {
        const message = payload.new as DirectMessage;
        if (message.sender_id === selectedRecipientId) {
          setMessages((current) => addOrReplaceMessage(current, message));
          const readAt = new Date().toISOString();
          void supabase.from('direct_messages').update({ read_at: readAt }).eq('id', message.id);
        }
        void refreshInbox();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `sender_id=eq.${userId}` }, (payload) => {
        const message = payload.new as DirectMessage;
        if (message.recipient_id === selectedRecipientId) setMessages((current) => addOrReplaceMessage(current, message));
        void refreshInbox();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'direct_messages', filter: `sender_id=eq.${userId}` }, (payload) => {
        const message = payload.new as DirectMessage;
        if (message.recipient_id === selectedRecipientId) setMessages((current) => addOrReplaceMessage(current, message));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'direct_messages', filter: `recipient_id=eq.${userId}` }, () => {
        void refreshInbox();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshInbox, selectedRecipientId, userId]);

  useEffect(() => {
    if (loadedConversationId !== selectedRecipientId || !messages.length) return;
    endOfMessagesRef.current?.scrollIntoView({ block: 'end' });
  }, [loadedConversationId, messages.length, selectedRecipientId]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return items;
    return items.filter(({ person }) => `${displayName(person)} ${person.username ?? ''}`.toLocaleLowerCase().includes(query));
  }, [items, search]);

  const sendMessage = async () => {
    const body = draft.trim();
    if (!userId || !selectedItem || !body || sending) return;
    setSending(true);
    setConversationError(null);

    const { data, error } = await supabase
      .from('direct_messages')
      .insert({ sender_id: userId, recipient_id: selectedItem.person.id, body })
      .select(messageColumns)
      .single();

    if (error) {
      setConversationError(error.message.includes('row-level security')
        ? 'You can only send messages while this person is still one of your mutual connections.'
        : error.message);
    } else {
      setDraft('');
      setMessages((current) => addOrReplaceMessage(current, data as DirectMessage));
      void refreshInbox();
    }
    setSending(false);
  };

  if (!ready || !userId || loadingInbox || loadedUserId !== userId) {
    return <main className="loading-shell"><p role="status">Loading messages…</p></main>;
  }

  const invalidRecipient = Boolean(selectedRecipientId && !selectedItem);

  return <main className="px-0 py-0 sm:px-4 sm:py-6 lg:px-6">
    <div className="mx-auto flex h-[calc(100dvh-72px)] min-h-[580px] max-w-6xl overflow-hidden border-slate-200/80 bg-white shadow-card sm:h-[calc(100dvh-120px)] sm:rounded-[2rem] sm:border">
      <aside className={`${selectedItem || invalidRecipient ? 'hidden md:flex' : 'flex'} w-full shrink-0 flex-col border-r border-slate-200 md:w-[340px] lg:w-[390px]`} aria-label="Conversations">
        <div className="border-b border-slate-200 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="flex items-start justify-between gap-3"><div><p className="eyebrow">Your network</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Messages</h1></div><span title={connected ? 'Realtime connected' : 'Realtime connecting'} className={`mt-1 size-2.5 rounded-full ring-4 ${connected ? 'bg-emerald-500 ring-emerald-100' : 'animate-pulse bg-amber-400 ring-amber-100'}`}><span className="sr-only">{connected ? 'Realtime connected' : 'Realtime connecting'}</span></span></div>
          <label className="relative mt-4 block"><span className="sr-only">Search conversations</span><SearchIcon /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search connections" className="input pl-10" /></label>
        </div>

        {inboxError ? <ErrorPanel message={inboxError} retry={() => void refreshInbox(true)} /> : filteredItems.length ? <div className="flex-1 overflow-y-auto">{filteredItems.map((item) => <InboxLink key={item.person.id} item={item} currentUserId={userId} active={item.person.id === selectedRecipientId} />)}</div> : items.length ? <div className="grid flex-1 place-items-center px-6 text-center"><div><p className="font-bold text-slate-800">No connections found</p><p className="mt-1 text-sm text-slate-500">Try a different name or username.</p></div></div> : <div className="grid flex-1 place-items-center px-7 text-center"><div><div aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-full bg-blue-50 text-blue-600"><MessageIcon /></div><h2 className="mt-4 text-lg font-bold text-slate-950">No conversations yet</h2><p className="mt-2 text-sm leading-6 text-slate-500">Once a follow is mutual, that person will appear here and you can start messaging.</p><Link href="/friends" className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">View friends</Link></div></div>}
      </aside>

      <section className={`${selectedItem || invalidRecipient ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col bg-slate-50`} aria-label={selectedItem ? `Conversation with ${displayName(selectedItem.person)}` : 'Message area'}>
        {invalidRecipient ? <InvalidConversation /> : selectedItem ? <>
          <ConversationHeader person={selectedItem.person} />
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
            {loadingConversation || loadedConversationId !== selectedRecipientId ? <div className="grid h-full place-items-center"><p role="status" className="text-sm font-medium text-slate-500">Loading conversation…</p></div> : conversationError && !messages.length ? <ErrorPanel message={conversationError} retry={() => setConversationRefreshKey((current) => current + 1)} /> : messages.length ? <div className="mx-auto flex max-w-3xl flex-col gap-2.5">{messages.map((message, index) => <MessageBubble key={message.id} message={message} own={message.sender_id === userId} showReadReceipt={message.sender_id === userId && !messages.slice(index + 1).some((later) => later.sender_id === userId)} />)}<div ref={endOfMessagesRef} /></div> : <div className="grid h-full place-items-center text-center"><div><div aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-full bg-white text-blue-600 shadow-sm"><MessageIcon /></div><h2 className="mt-4 text-lg font-bold text-slate-950">Start the conversation</h2><p className="mt-1 text-sm text-slate-500">Send a text message to {displayName(selectedItem.person)}.</p></div></div>}
          </div>
          <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
            {conversationError && messages.length > 0 && <p role="alert" className="mx-auto mb-2 max-w-3xl text-sm font-medium text-rose-600">{conversationError}</p>}
            <div className="mx-auto flex max-w-3xl items-end gap-2"><label className="min-w-0 flex-1"><span className="sr-only">Message {displayName(selectedItem.person)}</span><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void sendMessage(); } }} rows={1} maxLength={2000} placeholder={`Message ${displayName(selectedItem.person)}`} className="input max-h-32 min-h-11 resize-none py-3" /></label><button type="button" onClick={() => void sendMessage()} disabled={!draft.trim() || sending} aria-label="Send message" className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/20 transition hover:-translate-y-0.5 hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"><SendIcon /></button></div>
            <p className="mx-auto mt-1.5 max-w-3xl text-xs text-slate-400">Enter to send · Shift+Enter for a new line</p>
          </div>
        </> : <div className="grid flex-1 place-items-center px-8 text-center"><div><div aria-hidden="true" className="mx-auto grid size-16 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm"><MessageIcon /></div><h2 className="mt-5 text-xl font-bold text-slate-950">Select a conversation</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Choose one of your mutual connections to view your messages or start a conversation.</p></div></div>}
      </section>
    </div>
  </main>;
}

function InboxLink({ item, currentUserId, active }: { item: InboxItem; currentUserId: string; active: boolean }) {
  const { onlineUserIds } = usePresence();
  const name = displayName(item.person);
  const isOnline = onlineUserIds.has(item.person.id);
  const preview = item.lastMessageBody
    ? `${item.lastMessageSenderId === currentUserId ? 'You: ' : ''}${item.lastMessageBody.replace(/\s+/g, ' ')}`
    : 'Start a conversation';

  return <Link href={`/messages/${item.person.id}`} aria-current={active ? 'page' : undefined} className={`flex gap-3 border-b border-slate-100 px-5 py-4 outline-none transition hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue-100 sm:px-6 ${active ? 'bg-blue-50 hover:bg-blue-50' : ''}`}>
    <div className="relative shrink-0"><PersonAvatar person={item.person} /><span aria-label={isOnline ? 'Active now' : 'Offline'} title={isOnline ? 'Active now' : 'Offline'} className={`absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} /></div>
    <div className="min-w-0 flex-1"><div className="flex items-baseline justify-between gap-2"><p className={`truncate text-sm text-slate-950 ${item.unreadCount ? 'font-extrabold' : 'font-bold'}`}>{name}</p>{item.lastMessageAt && <time dateTime={item.lastMessageAt} className={`shrink-0 text-xs ${item.unreadCount ? 'font-bold text-blue-700' : 'text-slate-400'}`}>{formatInboxTime(item.lastMessageAt)}</time>}</div><div className="mt-1 flex items-center gap-2"><p className={`min-w-0 flex-1 truncate text-sm ${item.unreadCount ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{preview}</p>{item.unreadCount > 0 && <span aria-label={`${item.unreadCount} unread messages`} className="min-w-5 rounded-full bg-blue-600 px-1.5 py-0.5 text-center text-[11px] font-bold text-white">{item.unreadCount > 99 ? '99+' : item.unreadCount}</span>}</div></div>
  </Link>;
}

function ConversationHeader({ person }: { person: Person }) {
  const name = displayName(person);
  return <header className="flex h-[77px] shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6"><Link href="/messages" className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden" aria-label="Back to conversations"><BackIcon /></Link><div className="relative"><PersonAvatar person={person} /><span className="absolute bottom-0 right-0"><span className="sr-only">Online status is shown next to the name</span></span></div><div className="min-w-0"><p className="truncate font-bold text-slate-950">{name}</p><OnlineStatus userId={person.id} compact /></div>{person.username && <Link href={`/${encodeURIComponent(person.username)}`} className="ml-auto shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">View profile</Link>}</header>;
}

function MessageBubble({ message, own, showReadReceipt }: { message: DirectMessage; own: boolean; showReadReceipt: boolean }) {
  return <div className={`flex ${own ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] sm:max-w-[72%] ${own ? 'text-right' : 'text-left'}`}><div className={`inline-block whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-left text-sm leading-6 shadow-sm ${own ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'}`}>{message.body}</div><div className={`mt-1 flex items-center gap-1.5 px-1 text-[11px] text-slate-400 ${own ? 'justify-end' : 'justify-start'}`}><time dateTime={message.created_at}>{formatMessageTime(message.created_at)}</time>{own && showReadReceipt && message.read_at && <span>· Read</span>}</div></div></div>;
}

function PersonAvatar({ person }: { person: Person }) {
  const name = displayName(person);
  return person.avatarUrl
    ? <ProfileAvatar src={person.avatarUrl} name={name} size="compact" />
    : <div aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-slate-100 text-lg font-bold text-slate-400">{name.charAt(0).toUpperCase()}</div>;
}

function ErrorPanel({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="m-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"><p>{message}</p><button type="button" onClick={retry} className="mt-2 font-bold underline decoration-rose-300 underline-offset-4">Try again</button></div>;
}

function InvalidConversation() {
  return <div className="grid flex-1 place-items-center px-6 text-center"><div><div aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-full bg-amber-50 text-2xl text-amber-600">!</div><h1 className="mt-4 text-xl font-bold text-slate-950">Conversation unavailable</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">You can only message people who are currently mutual connections.</p><Link href="/messages" className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Back to messages</Link></div></div>;
}

function formatInboxTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (date.getFullYear() === now.getFullYear()) return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
}

function formatMessageTime(value: string) {
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
}
function MessageIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-7"><path d="M21 12a8 8 0 0 1-8 8H6l-4 2 1.5-4A9 9 0 1 1 21 12Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" strokeLinecap="round" /></svg>;
}
function SendIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5"><path d="m22 2-7 20-4-9-9-4Z" strokeLinejoin="round" /><path d="M22 2 11 13" /></svg>;
}
function BackIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
