'use client';

import Link from 'next/link';
import { Check, MessageCircle, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { OnlineStatus } from '@/components/PresenceProvider';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';

type FriendConnection = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted';
};

type ConnectionSnapshot = {
  connection: FriendConnection | null;
  error: string | null;
  key: string;
};

async function fetchConnection(userId: string, targetUserId: string) {
  return supabase
    .from('friend_connections')
    .select('id, requester_id, recipient_id, status')
    .or(`and(requester_id.eq.${userId},recipient_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},recipient_id.eq.${userId})`)
    .maybeSingle();
}

/** Manages the request state between the signed-in user and one public profile. */
export default function FriendRequestButton({ targetUserId, targetName }: { targetUserId: string; targetName: string }) {
  const { ready, user } = useAuth();
  const [snapshot, setSnapshot] = useState<ConnectionSnapshot | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const userId = user?.id ?? null;
  const connectionKey = userId ? `${userId}:${targetUserId}` : '';
  const isCurrentSnapshot = snapshot?.key === connectionKey;
  const connection = isCurrentSnapshot ? snapshot.connection : null;
  const loading = Boolean(userId && userId !== targetUserId && !isCurrentSnapshot);
  const unavailable = Boolean(isCurrentSnapshot && snapshot.error);
  const error = actionError ?? (isCurrentSnapshot ? snapshot.error : null);

  useEffect(() => {
    if (!ready || !userId || userId === targetUserId) return;
    let active = true;

    const refresh = () => {
      void fetchConnection(userId, targetUserId).then(({ data, error: loadError }) => {
        if (!active) return;
        setSnapshot({
          connection: (data as FriendConnection | null) ?? null,
          error: loadError ? 'Friend status is unavailable right now.' : null,
          key: `${userId}:${targetUserId}`,
        });
      });
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      active = false;
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [ready, targetUserId, userId]);

  if (!ready) return <button type="button" disabled className="rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300">Loading...</button>;
  if (!userId) return <Link href="/login" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500">Sign in to follow</Link>;
  if (userId === targetUserId) return null;

  const isOutgoing = connection?.status === 'pending' && connection.requester_id === userId;
  const isIncoming = connection?.status === 'pending' && connection.recipient_id === userId;
  const isFriend = connection?.status === 'accepted';

  const updateConnection = async () => {
    if (saving || loading) return;
    setSaving(true);
    setActionError(null);

    let mutationError: { message: string } | null = null;
    let connectionChanged = false;
    if (!connection) {
      ({ error: mutationError } = await supabase.rpc('send_friend_request', { target_user_id: targetUserId }));
    } else if (isIncoming) {
      ({ error: mutationError } = await supabase.rpc('accept_friend_request', { connection_id: connection.id }));
    } else {
      const action = isFriend ? 'Remove' : 'Cancel your request to';
      if (!window.confirm(`${action} ${targetName}${isFriend ? ' from your friends?' : '?'}`)) {
        setSaving(false);
        return;
      }
      const result = await supabase.rpc('delete_friend_connection', { connection_id: connection.id, expected_status: connection.status });
      mutationError = result.error;
      connectionChanged = !result.error && result.data !== true;
    }

    if (mutationError) setActionError(mutationError.message);
    else {
      const { data, error: loadError } = await fetchConnection(userId, targetUserId);
      setSnapshot({
        connection: (data as FriendConnection | null) ?? null,
        error: loadError ? 'Friend status is unavailable right now.' : null,
        key: connectionKey,
      });
      if (connectionChanged) setActionError('This connection changed before your action completed. Its current status is shown now.');
      else trackEvent('connection_action', { action: !connection ? 'request_sent' : isIncoming ? 'request_accepted' : isFriend ? 'connection_removed' : 'request_cancelled' });
    }
    setSaving(false);
  };

  const label = saving
    ? 'Updating...'
    : loading
      ? 'Loading...'
      : unavailable
        ? 'Unavailable'
        : isIncoming
          ? 'Follow back'
          : isOutgoing
            ? 'Requested'
            : isFriend
              ? 'Friends'
              : 'Follow';
  const buttonClass = isIncoming || !connection
    ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30 hover:bg-blue-500'
    : isFriend
      ? 'border border-emerald-300/30 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/25'
      : 'border border-white/20 bg-white/10 text-white hover:bg-white/15';
  const actionLabel = loading
    ? `Loading friend status for ${targetName}`
    : saving
      ? `Updating friend status for ${targetName}`
      : unavailable
        ? `Friend status for ${targetName} is unavailable`
        : isIncoming
          ? `Follow ${targetName} back`
          : isOutgoing
            ? `Cancel friend request to ${targetName}`
            : isFriend
              ? `Remove ${targetName} from friends`
              : `Send a friend request to ${targetName}`;

  return <div className="text-center">
    <div className="flex flex-wrap justify-center gap-2"><button type="button" onClick={updateConnection} disabled={loading || saving || unavailable} className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold transition disabled:cursor-wait disabled:opacity-60 ${buttonClass}`} aria-label={actionLabel} title={isOutgoing || isFriend ? actionLabel : undefined}>
      {isFriend ? <Check className="size-4" /> : <UserPlus className="size-4" />}{label}
    </button>{isFriend && <Link href={`/messages/${targetUserId}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-brand-950/30 transition hover:-translate-y-0.5 hover:bg-brand-500"><MessageCircle className="size-4" />Message</Link>}</div>
    {isFriend && <div className="mt-2"><OnlineStatus userId={targetUserId} compact /></div>}
    {error && <p role="alert" className="mt-2 max-w-56 text-xs font-medium text-rose-200">{error}</p>}
  </div>;
}
