'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

type PresenceContextValue = {
  connected: boolean;
  onlineUserIds: ReadonlySet<string>;
};

const EMPTY_ONLINE_USERS = new Set<string>();
const PresenceContext = createContext<PresenceContextValue>({
  connected: false,
  onlineUserIds: EMPTY_ONLINE_USERS,
});

type PresenceMeta = { user_id?: string };

/** Maintains one private Realtime Presence connection for the signed-in app. */
export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAuth();
  const userId = user?.id ?? null;
  const [onlineUserIds, setOnlineUserIds] = useState<ReadonlySet<string>>(EMPTY_ONLINE_USERS);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!ready || !userId) {
      return;
    }

    let active = true;
    const channel = supabase.channel('online-users', {
      config: {
        private: true,
        presence: { key: userId },
      },
    });

    const syncPresence = () => {
      if (!active) return;
      const state = channel.presenceState<PresenceMeta>();
      const nextOnlineUsers = new Set<string>();

      for (const [presenceKey, metas] of Object.entries(state)) {
        const reportedUserId = metas.find((meta) => meta.user_id)?.user_id;
        nextOnlineUsers.add(reportedUserId ?? presenceKey);
      }

      setOnlineUserIds(nextOnlineUsers);
    };

    channel
      .on('presence', { event: 'sync' }, syncPresence)
      .on('presence', { event: 'join' }, syncPresence)
      .on('presence', { event: 'leave' }, syncPresence)
      .subscribe((status) => {
        if (!active) return;
        if (status === 'SUBSCRIBED') {
          setConnected(true);
          void channel.track({ user_id: userId, online_at: new Date().toISOString() });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setConnected(false);
        }
      });

    return () => {
      active = false;
      setConnected(false);
      setOnlineUserIds(EMPTY_ONLINE_USERS);
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [ready, userId]);

  const value = useMemo(() => ({ connected, onlineUserIds }), [connected, onlineUserIds]);
  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

export function usePresence() {
  return useContext(PresenceContext);
}

/** A shared accessible indicator used in connection and conversation lists. */
export function OnlineStatus({ userId, compact = false }: { userId: string; compact?: boolean }) {
  const { connected, onlineUserIds } = usePresence();
  const isOnline = connected && onlineUserIds.has(userId);

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap ${compact ? 'text-xs' : 'text-sm'} ${isOnline ? 'text-emerald-700' : 'text-slate-400'}`}
    >
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${isOnline ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'}`}
      />
      {isOnline ? 'Active now' : 'Offline'}
    </span>
  );
}
