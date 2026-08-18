'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SiteNav() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<'athlete' | 'coach'>('athlete');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadNavigation = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
      setIsSignedIn(Boolean(session));
      if (!session) {
        setUsername(null);
        setAccountType('athlete');
        setReady(true);
        return;
      }

      const isCoach = session.user.user_metadata.account_type === 'coach';
      const { data } = isCoach
        ? await supabase.from('coachprofiles').select('username').eq('id', session.user.id).maybeSingle()
        : await supabase.from('profiles').select('username').eq('id', session.user.id).maybeSingle();
      setUsername(data?.username ?? session.user.user_metadata.username ?? null);
      setAccountType(isCoach ? 'coach' : 'athlete');
      setReady(true);
    };

    supabase.auth.getSession().then(({ data: { session } }) => loadNavigation(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsSignedIn(false);
        setUsername(null);
        setAccountType('athlete');
        setReady(true);
        return;
      }

      loadNavigation(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <nav className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6" aria-label="Main navigation"><div className="mx-auto flex max-w-5xl items-center justify-between gap-4"><Link href="/" aria-label="Athlio home" className="inline-flex items-center"><Image src="/athlio-logo.png" alt="Athlio" width={132} height={33} className="h-8 w-auto object-contain" priority /></Link><div className="flex items-center gap-1 sm:gap-2"><Link href="/" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Home</Link>{ready && isSignedIn && username ? <><span className={`hidden rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide sm:inline-flex ${accountType === 'coach' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{accountType}</span><Link href={accountType === 'coach' ? '/coach-dashboard' : '/dashboard'} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Dashboard</Link><Link href={`/${username}`} className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">My profile</Link></> : null}</div></div></nav>;
}
