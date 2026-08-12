'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function SiteNav() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadNavigation = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
      setIsSignedIn(Boolean(session));
      if (!session) {
        setUsername(null);
        setReady(true);
        return;
      }

      const { data } = await supabase.from('profiles').select('username').eq('id', session.user.id).maybeSingle();
      setUsername(data?.username ?? session.user.user_metadata.username ?? null);
      setReady(true);
    };

    supabase.auth.getSession().then(({ data: { session } }) => loadNavigation(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsSignedIn(false);
        setUsername(null);
        setReady(true);
        return;
      }

      loadNavigation(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <nav className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6" aria-label="Main navigation"><div className="mx-auto flex max-w-5xl items-center justify-between gap-4"><Link href="/" className="text-lg font-bold tracking-tight text-slate-950">Stat<span className="text-blue-600">Card</span></Link><div className="flex items-center gap-1 sm:gap-2"><Link href="/" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Home</Link>{ready && isSignedIn && username ? <><Link href={`/dashboard`} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Dashboard</Link><Link href={`/${username}`} className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">My profile</Link></> : ready && !isSignedIn ? <Link href="/login" className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">Sign in</Link> : null}</div></div></nav>;
}
