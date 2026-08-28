'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListChecks, Menu, UserRound, UsersRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAuth } from '@/components/AuthProvider';
import MessageNavLink from '@/components/MessageNavLink';
import { supabase } from '@/lib/supabase';

type ProfileIdentity = { userId: string; username: string | null };
type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

/** Responsive application navigation with route state and account context. */
export default function SiteNav() {
  const pathname = usePathname();
  const { ready, user } = useAuth();
  const [profileIdentity, setProfileIdentity] = useState<ProfileIdentity | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userId = user?.id ?? null;
  const accountType = user?.user_metadata.account_type === 'coach' ? 'coach' : 'athlete';
  const username = profileIdentity?.userId === userId ? profileIdentity.username : null;

  useEffect(() => {
    if (!ready || !userId) return;
    let active = true;
    const query = accountType === 'coach'
      ? supabase.from('coachprofiles').select('username').eq('id', userId).maybeSingle()
      : supabase.from('profiles').select('username').eq('id', userId).maybeSingle();
    void query.then(({ data }) => { if (active) setProfileIdentity({ userId, username: data?.username ?? null }); });
    return () => { active = false; };
  }, [accountType, ready, userId]);

  const dashboardHref = accountType === 'coach' ? '/coach-dashboard' : '/dashboard';
  const items: NavItem[] = [
    { href: dashboardHref, label: 'Dashboard', icon: LayoutDashboard },
    ...(accountType === 'coach' ? [{ href: '/coach-lists', label: 'Lists', icon: ListChecks }] : []),
    { href: '/friends', label: 'Network', icon: UsersRound },
  ];
  const signedIn = Boolean(ready && userId && username);

  return <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
    <nav className="page-shell" aria-label="Main navigation" onClick={(event) => { if ((event.target as HTMLElement).closest('a')) setMobileOpen(false); }}>
      <div className="flex h-18 items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4"><Link href="/" aria-label="CoachPoints home" className="group inline-flex shrink-0 items-center rounded-lg"><Image src="/coachpoints-logo.png" alt="CoachPoints" width={132} height={33} className="h-8 w-auto object-contain transition group-hover:opacity-80" priority /></Link>{signedIn && <span className={`hidden items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] sm:inline-flex ${accountType === 'coach' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-brand-200 bg-brand-50 text-brand-700'}`}><span className={`size-1.5 rounded-full ${accountType === 'coach' ? 'bg-emerald-500' : 'bg-brand-500'}`} />{accountType}</span>}</div>
        <div className="hidden items-center gap-1 lg:flex"><NavLink href="/" label="Discover" active={pathname === '/'} />{signedIn && <>{items.map((item) => <NavLink key={item.href} {...item} active={pathname === item.href} />)}<MessageNavLink userId={userId!} />{username && <Link href={`/${username}`} className="ml-2 inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"><UserRound className="size-4" />My profile</Link>}</>}{ready && !userId && <Link href="/login?role=athlete" className="ml-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700">Get started</Link>}</div>
        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden" aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}>{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
      </div>
      {mobileOpen && <div id="mobile-navigation" className="border-t border-slate-100 pb-4 pt-3 lg:hidden"><div className="grid gap-1"><MobileLink href="/" label="Discover" active={pathname === '/'} />{signedIn && <>{items.map((item) => <MobileLink key={item.href} {...item} active={pathname === item.href} />)}<MessageNavLink userId={userId!} mobile />{username && <MobileLink href={`/${username}`} label="My profile" icon={UserRound} active={pathname === `/${username}`} />}</>}{ready && !userId && <div className="mt-2"><Link href="/login?role=athlete" className="btn-primary w-full">Get started</Link></div>}</div></div>}
    </nav>
  </header>;
}

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon?: typeof LayoutDashboard; active: boolean }) {
  return <Link href={href} aria-current={active ? 'page' : undefined} className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>{Icon && <Icon className="size-4" />}{label}</Link>;
}

function MobileLink({ href, label, icon: Icon, active }: { href: string; label: string; icon?: typeof LayoutDashboard; active: boolean }) {
  return <Link href={href} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'}`}>{Icon && <Icon className="size-4.5" />}{label}</Link>;
}
