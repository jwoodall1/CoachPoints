'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export default function MessageNavLink({ userId, mobile = false, side = false, collapsed = false }: { userId: string; mobile?: boolean; side?: boolean; collapsed?: boolean }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const active = pathname.startsWith('/messages');
  const refreshUnreadCount = useCallback(async () => {
    const { count, error } = await supabase.from('direct_messages').select('id', { count: 'exact', head: true }).eq('recipient_id', userId).is('read_at', null);
    if (!error) setUnreadCount(count ?? 0);
  }, [userId]);
  useEffect(() => {
    void Promise.resolve().then(refreshUnreadCount);
    const channel = supabase.channel(`nav-unread-messages-${userId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `recipient_id=eq.${userId}` }, refreshUnreadCount).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'direct_messages', filter: `recipient_id=eq.${userId}` }, refreshUnreadCount).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [refreshUnreadCount, userId]);
  return <Link href="/messages" aria-current={active ? 'page' : undefined} title={collapsed ? 'Messages' : undefined} className={`${mobile ? 'flex w-full px-3 py-3' : side ? `relative flex min-h-11 ${collapsed ? 'justify-center px-2' : 'px-3.5'}` : 'inline-flex min-h-10 px-3.5 py-2'} items-center gap-2 rounded-xl text-sm font-bold transition ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}><MessageCircle className="size-4 shrink-0" />{!collapsed && 'Messages'}{unreadCount > 0 && <span aria-label={`${unreadCount} unread messages`} className={`${collapsed ? 'absolute -right-1 -top-1' : 'ml-auto'} inline-flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-extrabold leading-4 text-white`}>{unreadCount > 99 ? '99+' : unreadCount}</span>}</Link>;
}
