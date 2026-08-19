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
      // Auth metadata can contain a username before the profile row is saved.
      setUsername(data?.username ?? null);
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

  return <nav className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6" aria-label="Main navigation"><div className="mx-auto flex max-w-5xl items-center justify-between gap-4"><div className="flex min-w-0 items-center"><Link href="/" aria-label="Athlio home" className="inline-flex shrink-0 items-center"><Image src="/athlio-logo.png" alt="Athlio" width={132} height={33} className="h-8 w-auto object-contain" priority /></Link>{ready && isSignedIn && username && <span className={`ml-3 inline-flex items-center gap-1.5 border-l border-slate-200 pl-3 text-xs font-bold uppercase tracking-[0.14em] ${accountType === 'coach' ? 'text-emerald-700' : 'text-blue-700'}`}><span className={`size-2 rounded-full ${accountType === 'coach' ? 'bg-emerald-500' : 'bg-blue-500'}`} />{accountType}</span>}</div><div className="flex items-center gap-1 sm:gap-2"><Link href="/" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Home</Link>{ready && isSignedIn && username ? <><Link href={accountType === 'coach' ? '/coach-dashboard' : '/dashboard'} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Dashboard</Link>{accountType === 'coach' && <Link href="/coach-lists" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Lists</Link>}<Link href={`/${username}`} className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">My profile</Link></> : null}</div></div></nav>;
}
