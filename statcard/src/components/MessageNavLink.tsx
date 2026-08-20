'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

/** Navigation link with a live total of unread incoming messages. */
export default function MessageNavLink({ userId }: { userId: string }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    const { count, error } = await supabase
      .from('direct_messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .is('read_at', null);
    if (!error) setUnreadCount(count ?? 0);
  }, [userId]);

  useEffect(() => {
    void Promise.resolve().then(refreshUnreadCount);
    const channel = supabase
      .channel(`nav-unread-messages-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `recipient_id=eq.${userId}` }, refreshUnreadCount)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'direct_messages', filter: `recipient_id=eq.${userId}` }, refreshUnreadCount)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshUnreadCount, userId]);

  return <Link href="/messages" className="relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
    Messages
    {unreadCount > 0 && <span aria-label={`${unreadCount} unread messages`} className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold leading-4 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
  </Link>;
}
