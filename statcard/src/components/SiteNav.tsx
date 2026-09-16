'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Bookmark,
  Building2,
  LayoutDashboard,
  ListChecks,
  Package,
  Menu,
  MessageCircle,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

type ProfileIdentity = {
  userId: string;
  username: string | null;
  hasCoachProfile: boolean;
  managesInstitutions: boolean;
};
type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

// ── Primary navigation ────────────────────────────────────────────────────────

/** Responsive navigation: desktop sidebar plus an isolated mobile menu. */
export default function SiteNav() {
  const pathname = usePathname();
  return <NavigationForPage key={pathname} pathname={pathname} />;
}

function NavigationForPage({ pathname }: { pathname: string }) {
  const { ready, user } = useAuth();
  const [profileIdentity, setProfileIdentity] = useState<ProfileIdentity | null>(null);
  const [collapsed, setCollapsed] = useState(true);
  const userId = user?.id ?? null;
  const accountType = user?.user_metadata.account_type === 'coach' ? 'coach' : 'athlete';
  const username = profileIdentity?.userId === userId ? profileIdentity.username : null;
  const signedIn = Boolean(ready && userId && username);
  const items: NavItem[] = [
    {
      href: accountType === 'coach' ? '/coach-dashboard' : '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    ...(accountType === 'coach'
      ? [{ href: '/coach-lists', label: 'Lists', icon: ListChecks }]
      : [{ href: '/my-schools', label: 'My Schools', icon: Bookmark }]),
    { href: '/friends', label: 'Network', icon: UsersRound },
    ...(profileIdentity?.userId === userId && profileIdentity?.hasCoachProfile
      ? [{ href: '/equipment', label: 'Equipment', icon: Package }]
      : []),
    ...(profileIdentity?.userId === userId && profileIdentity?.managesInstitutions
      ? [{ href: '/institution-coaches', label: 'Institution coaches', icon: Building2 }]
      : []),
  ];

  useEffect(() => {
    if (!ready || !userId) return;
    let active = true;
    const query =
      accountType === 'coach'
        ? supabase
            .from('public_coach_profile_cards')
            .select('username')
            .eq('id', userId)
            .maybeSingle()
        : supabase.from('public_profile_cards').select('username').eq('id', userId).maybeSingle();
    void Promise.all([
      query,
      supabase.from('coachprofiles').select('id').eq('id', userId).maybeSingle(),
      supabase.rpc('get_coach_admin_institutions'),
    ]).then(([{ data }, coach, institutions]) => {
      if (active)
        setProfileIdentity({
          userId,
          username: data?.username ?? null,
          hasCoachProfile: !coach.error && Boolean(coach.data),
          managesInstitutions: !institutions.error && Boolean(institutions.data?.length),
        });
    });
    return () => {
      active = false;
    };
  }, [accountType, ready, userId]);

  return (
    <>
      <aside
        className={`sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 lg:flex ${collapsed ? 'w-20' : 'w-72'}`}
      >
        <div
          className={`flex h-24 shrink-0 items-center border-b border-slate-100 ${collapsed ? 'justify-center px-3' : 'justify-between px-5'}`}
        >
          <Link
            href="/"
            aria-label="CoachPoints home"
            className="group inline-flex items-center rounded-lg"
          >
            {collapsed ? (
              <Image
                src="/coachpoints-mark.png"
                alt="CoachPoints"
                width={44}
                height={44}
                className="size-11 rounded-2xl object-cover transition group-hover:opacity-80"
                priority
              />
            ) : (
              <Image
                src="/coachpoints-logo.png"
                alt="CoachPoints"
                width={190}
                height={65}
                className="h-20 w-auto object-contain transition group-hover:opacity-80"
                priority
              />
            )}
          </Link>

        </div>
        <button
          type="button"
          onClick={() => setCollapsed(value => !value)}
          aria-expanded={!collapsed}
          aria-controls="desktop-navigation"
          aria-label={collapsed ? 'Open navigation' : 'Close navigation'}
          title={collapsed ? 'Open navigation' : 'Close navigation'}
          className="mx-auto mt-4 grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          {collapsed ? <Menu className="size-4.5" /> : <X className="size-4.5" />}
          <span className="sr-only">{collapsed ? 'Menu' : 'Close menu'}</span>
        </button>
        <div className={`border-b border-slate-100 py-4 ${collapsed ? 'px-3' : 'px-5'}`}>
          {signedIn ? (
            <div
              className={`flex items-center gap-2 rounded-xl border ${accountType === 'coach' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-brand-200 bg-brand-50 text-brand-700'} ${collapsed ? 'justify-center p-2' : 'px-3 py-2'}`}
              title={collapsed ? accountType : undefined}
            >
              <span
                className={`size-2 rounded-full ${accountType === 'coach' ? 'bg-emerald-500' : 'bg-brand-500'}`}
              />
              {!collapsed && (
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em]">
                  {accountType}
                </span>
              )}
            </div>
          ) : (
            !collapsed && (
              <p className="px-3 text-xs font-semibold text-slate-400">
                Performance meets opportunity
              </p>
            )
          )}
        </div>
        <nav
          id="desktop-navigation"
          onClick={(event) => { if ((event.target as HTMLElement).closest('a')) setCollapsed(true); }}
          className={`flex-1 space-y-1 overflow-y-auto py-5 ${collapsed ? 'px-3' : 'px-4'}`}
          aria-label="Main navigation"
        >
          <DesktopLink
            href="/?discover=1"
            label="Discover"
            icon={Compass}
            active={pathname === '/'}
            collapsed={collapsed}
          />
          {signedIn && (
            <>
              {items.map((item) => (
                <DesktopLink
                  key={item.href}
                  {...item}
                  active={
                    pathname === item.href ||
                    (item.href === '/equipment' && pathname.startsWith('/equipment/'))
                  }
                  collapsed={collapsed}
                />
              ))}
              <DesktopLink
                href="/messages"
                label="Messages"
                icon={MessageCircle}
                active={pathname.startsWith('/messages')}
                collapsed={collapsed}
              />
              {username && (
                <DesktopLink
                  href={`/${username}`}
                  label="My profile"
                  icon={UserRound}
                  active={pathname === `/${username}`}
                  collapsed={collapsed}
                />
              )}
            </>
          )}
          {ready && !userId && (
            <Link
              href="/login?role=athlete"
              className={`mt-5 flex items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 ${collapsed ? 'size-11' : 'min-h-11 px-4'}`}
              title={collapsed ? 'Get started' : undefined}
            >
              {collapsed ? <UserRound className="size-4" /> : 'Get started'}
            </Link>
          )}
        </nav>

      </aside>
      <MobileNavigation
        pathname={pathname}
        ready={ready}
        signedIn={signedIn}
        accountType={accountType}
        username={username}
        items={items}
      />
    </>
  );
}

// ── Responsive navigation variants ────────────────────────────────────────────

function MobileNavigation({
  pathname,
  ready,
  signedIn,
  accountType,
  username,
  items,
}: {
  pathname: string;
  ready: boolean;
  signedIn: boolean;
  accountType: 'athlete' | 'coach';
  username: string | null;
  items: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="sticky top-0 z-40 w-full lg:hidden">
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4">
        <Link href="/" aria-label="CoachPoints home">
          <Image
            src="/coachpoints-logo.png"
            alt="CoachPoints"
            width={150}
            height={52}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>
        <div className="flex items-center gap-3">
          {signedIn && (
            <span
              className={`hidden rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider sm:inline-flex ${accountType === 'coach' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-brand-200 bg-brand-50 text-brand-700'}`}
            >
              {accountType}
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 grid size-10 place-items-center rounded-full border border-slate-300 bg-white/95 text-slate-600 shadow-md backdrop-blur transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">{open ? 'Close menu' : 'Menu'}</span>
          </button>
        </div>
      </header>
      {open && (
        <div
          id="mobile-navigation"
          className="fixed inset-x-0 top-16 z-30 max-h-[calc(100dvh-10rem)] overflow-y-auto border-b border-slate-200 bg-white p-4 shadow-xl"
        >
          <nav className="grid gap-1" aria-label="Mobile navigation">
            <MobileLink
              href="/?discover=1"
              label="Discover"
              icon={Compass}
              active={pathname === '/'}
              close={close}
            />
            {signedIn && (
              <>
                {items.map((item) => (
                  <MobileLink
                    key={item.href}
                    {...item}
                    active={
                      pathname === item.href ||
                      (item.href === '/equipment' && pathname.startsWith('/equipment/'))
                    }
                    close={close}
                  />
                ))}
                <MobileLink
                  href="/messages"
                  label="Messages"
                  icon={MessageCircle}
                  active={pathname.startsWith('/messages')}
                  close={close}
                />
                {username && (
                  <MobileLink
                    href={`/${username}`}
                    label="My profile"
                    icon={UserRound}
                    active={pathname === `/${username}`}
                    close={close}
                  />
                )}
              </>
            )}
            {ready && !signedIn && (
              <Link href="/login?role=athlete" onClick={close} className="btn-primary mt-2 w-full">
                Get started
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}

function DesktopLink({
  href,
  label,
  icon: Icon = LayoutDashboard,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon?: typeof LayoutDashboard;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      aria-label={label}
      title={collapsed ? label : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-xl text-sm font-bold transition ${collapsed ? 'justify-center px-2' : 'px-3.5'} ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
    >
      <Icon className="size-4.5 shrink-0" />
      {!collapsed && label}
    </Link>
  );
}
function MobileLink({
  href,
  label,
  icon: Icon = LayoutDashboard,
  active,
  close,
}: {
  href: string;
  label: string;
  icon?: typeof LayoutDashboard;
  active: boolean;
  close: () => void;
}) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      onClick={close}
      className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'}`}
    >
      <Icon className="size-4.5" />
      {label}
    </a>
  );
}
