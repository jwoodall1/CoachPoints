/* eslint-disable @next/next/no-img-element */
'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  Dumbbell,
  GraduationCap,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { OnlineStatus } from '@/components/PresenceProvider';
import ProfileAvatar from '@/components/ProfileAvatar';
import { supabase } from '@/lib/supabase';
import { coachPositions, getPositions } from '@/lib/sports';

const AddToListButton = dynamic(() => import('@/components/AddToListButton'));

type Athlete = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string;
  avatar_url: string | null;
  sport: string | null;
  position?: string | null;
  graduating_class?: string | null;
  high_school?: string | null;
  college_university?: string | null;
  account_type: 'athlete' | 'coach' | null;
};
type DirectoryType = 'athletes' | 'coaches' | 'institutions';
type Institution = {
  id: string;
  name: string;
  slug: string;
  location: string;
  mascot: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  tagline: string | null;
  city: string | null;
  state_code: string | null;
};
type DirectoryState = {
  userId: string;
  profiles: Athlete[];
  institutions: Institution[];
  error: string | null;
};
const EMPTY_PROFILES: Athlete[] = [];

// ── Signed-in directory ──────────────────────────────────────────────────────

/** Marketing home for guests and professional discovery workspace for members. */
export default function HomePage() {
  const { ready, user } = useAuth();
  const [directory, setDirectory] = useState<DirectoryState | null>(null);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [highSchoolFilter, setHighSchoolFilter] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [institutionStateFilter, setInstitutionStateFilter] = useState('all');
  const [directoryType, setDirectoryType] = useState<DirectoryType>('athletes');
  const userId = user?.id ?? null;
  const isSignedIn = Boolean(userId);
  const canManageLists = user?.user_metadata.account_type === 'coach';
  const isCurrentDirectory = directory?.userId === userId;
  const profiles = isCurrentDirectory ? directory.profiles : EMPTY_PROFILES;
  const error = isCurrentDirectory ? directory.error : null;
  const loading = !ready || (isSignedIn && !isCurrentDirectory);

  useEffect(() => {
    window.setTimeout(
      () =>
        setDirectoryType(user?.user_metadata.account_type === 'athlete' ? 'coaches' : 'athletes'),
      0,
    );
  }, [user?.user_metadata.account_type]);

  useEffect(() => {
    const changeDirectoryType = (event: Event) => {
      setDirectoryType((event as CustomEvent<DirectoryType>).detail);
      setSportFilter('all');
      setPositionFilter('all');
      setClassFilter('all');
      setHighSchoolFilter('all');
      setCollegeFilter('all');
      setInstitutionStateFilter('all');
      setSearch('');
    };
    window.addEventListener('directory-type-change', changeDirectoryType);
    return () => window.removeEventListener('directory-type-change', changeDirectoryType);
  }, []);

  useEffect(() => {
    if (!ready || !userId) return;
    let active = true;
    const load = async () => {
      const [
        { data, error: profilesError },
        { data: coachData, error: coachesError },
        { data: institutionData, error: institutionsError },
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select(
            'id, first_name, last_name, username, avatar_url, sport, position, graduating_class, high_school',
          )
          .order('last_name', { ascending: true })
          .limit(1000),
        supabase
          .from('coachprofiles')
          .select(
            'id, first_name, last_name, username, avatar_url, sport, position, college_university',
          )
          .order('last_name', { ascending: true })
          .limit(1000),
        supabase
          .from('institutions')
          .select(
            'id, name, slug, location, city, state_code, mascot, logo_url, primary_color, secondary_color, tagline, status',
          )
          .eq('status', 'published')
          .order('name', { ascending: true }),
      ]);
      if (!active) return;
      if (profilesError || coachesError || institutionsError)
        return setDirectory({
          userId,
          profiles: [],
          institutions: [],
          error: 'Unable to load athlete and coach profiles right now.',
        });
      const loadedProfiles = [
        ...(data ?? []).map((athlete) => ({ ...athlete, account_type: 'athlete' as const })),
        ...(coachData ?? []).map((coach) => ({ ...coach, account_type: 'coach' as const })),
      ]
        .filter((profile) => profile.username)
        .sort((a, b) => (a.last_name ?? '').localeCompare(b.last_name ?? ''));
      setDirectory({
        userId,
        profiles: loadedProfiles,
        institutions: institutionData ?? [],
        error: null,
      });
    };
    void load();
    return () => {
      active = false;
    };
  }, [ready, userId]);

  const visibleAccountType = directoryType === 'athletes' ? 'athlete' : 'coach';
  const visibleProfiles = useMemo(
    () => profiles.filter((profile) => profile.account_type === visibleAccountType),
    [profiles, visibleAccountType],
  );
  const sports = useMemo(
    () => uniqueSorted(visibleProfiles.map((profile) => profile.sport)),
    [visibleProfiles],
  );
  const positions = useMemo(
    () => uniqueSorted(visibleProfiles.map((profile) => profile.position)),
    [visibleProfiles],
  );
  const classYears = useMemo(
    () => uniqueSorted(visibleProfiles.map((profile) => profile.graduating_class)),
    [visibleProfiles],
  );
  const highSchools = useMemo(
    () => uniqueSorted(visibleProfiles.map((profile) => profile.high_school)),
    [visibleProfiles],
  );
  const colleges = useMemo(
    () => uniqueSorted(visibleProfiles.map((profile) => profile.college_university)),
    [visibleProfiles],
  );
  const availablePositions =
    sportFilter === 'all'
      ? positions
      : uniqueSorted([...getPositions(sportFilter), ...coachPositions]);
  const { filteredAthletes, filteredCoaches } = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = visibleProfiles.filter((profile) => {
      const name = getName(profile).toLowerCase();
      return (
        (!query || name.includes(query) || profile.username.toLowerCase().includes(query)) &&
        (sportFilter === 'all' || profile.sport === sportFilter) &&
        (positionFilter === 'all' || profile.position === positionFilter) &&
        (classFilter === 'all' || profile.graduating_class === classFilter) &&
        (highSchoolFilter === 'all' || profile.high_school === highSchoolFilter) &&
        (collegeFilter === 'all' || profile.college_university === collegeFilter)
      );
    });
    return {
      filteredAthletes: filtered.filter((profile) => profile.account_type === 'athlete'),
      filteredCoaches: filtered.filter((profile) => profile.account_type === 'coach'),
    };
  }, [
    visibleProfiles,
    search,
    sportFilter,
    positionFilter,
    classFilter,
    highSchoolFilter,
    collegeFilter,
  ]);
  const clearFilters = useCallback(() => {
    setSearch('');
    setSportFilter('all');
    setPositionFilter('all');
    setClassFilter('all');
    setHighSchoolFilter('all');
    setCollegeFilter('all');
    setInstitutionStateFilter('all');
  }, []);

  const institutions = useMemo(() => directory?.institutions ?? [], [directory?.institutions]);
  const institutionStates = useMemo(
    () => uniqueSorted(institutions.map((institution) => institution.state_code)),
    [institutions],
  );
  const filteredInstitutions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return institutions.filter((institution) =>
      (!query || institution.name.toLowerCase().includes(query) || institution.location.toLowerCase().includes(query)) &&
      (institutionStateFilter === 'all' || institution.state_code === institutionStateFilter),
    );
  }, [institutions, search, institutionStateFilter]);

  if (loading) return <LoadingState label="Preparing CoachPoints…" />;
  if (!isSignedIn) return <MarketingHome />;

  return (
    <main className="min-h-[calc(100vh-72px)] pb-20">
      <section className="relative overflow-hidden bg-slate-950 py-14 text-white sm:py-18">
        <div className="athletic-grid absolute inset-0 opacity-70" />
        <div className="absolute -right-32 -top-36 size-96 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="page-shell relative">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow text-brand-300">CoachPoints network</p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.035em] sm:text-5xl">
                Discover the people
                <br className="hidden sm:block" /> moving sports forward.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                Find athletes by performance and program fit. Connect with coaches, build your
                network, and start the right conversations.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {directoryType === 'institutions' ? (
                <Metric value={institutions.length} label="Institutions" />
              ) : (
                <>
                  <Metric value={filteredAthletes.length} label="Athletes" />
                  <Metric value={filteredCoaches.length} label="Coaches" />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell -mt-7 relative z-10">
        {error ? (
          <div className="surface-card border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : profiles.length === 0 && institutions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <section className="surface-card p-5 sm:p-6" aria-label="Directory filters">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <label className="relative block flex-1">
                  <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Search the network
                  </span>
                  <Search className="pointer-events-none absolute bottom-3.5 left-3.5 size-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={directoryType === 'institutions' ? 'School name or location' : 'Name or @username'}
                    className="input pl-10"
                  />
                </label>
                {directoryType === 'institutions' ? (
                  <>
                    <Filter
                      label="State"
                      value={institutionStateFilter}
                      onChange={setInstitutionStateFilter}
                      options={institutionStates}
                      allLabel="All states"
                    />
                    <button type="button" onClick={clearFilters} className="btn-secondary px-4">
                      Reset
                    </button>
                  </>
                ) : (
                  <>
                <Filter
                  label="Sport"
                  value={sportFilter}
                  onChange={(nextSport) => {
                    setSportFilter(nextSport);
                    if (
                      nextSport !== 'all' &&
                      positionFilter !== 'all' &&
                      !getPositions(nextSport).includes(positionFilter)
                    )
                      setPositionFilter('all');
                  }}
                  options={sports}
                  allLabel="All sports"
                />
                <Filter
                  label="Position"
                  value={positionFilter}
                  onChange={setPositionFilter}
                  options={availablePositions}
                  allLabel="All positions"
                />
                <button type="button" onClick={clearFilters} className="btn-secondary px-4">
                  Reset
                </button>
                  </>
                )}
              </div>
              {directoryType !== 'institutions' && <details className="group mt-4 border-t border-slate-100 pt-4">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950">
                  <span className="grid size-7 place-items-center rounded-lg bg-slate-100">
                    <GraduationCap className="size-4" />
                  </span>
                  More recruiting filters{' '}
                  <span className="ml-auto text-xs font-semibold text-slate-400 group-open:hidden">
                    Class, school & college
                  </span>
                </summary>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Filter
                    label="Class year"
                    value={classFilter}
                    onChange={setClassFilter}
                    options={classYears}
                    allLabel="All classes"
                    wide
                  />
                  <Filter
                    label="High school"
                    value={highSchoolFilter}
                    onChange={setHighSchoolFilter}
                    options={highSchools}
                    allLabel="All high schools"
                    wide
                  />
                  <Filter
                    label="College / university"
                    value={collegeFilter}
                    onChange={setCollegeFilter}
                    options={colleges}
                    allLabel="All colleges"
                    wide
                  />
                </div>
              </details>}
            </section>

            <section id="all-profiles" className="scroll-mt-28 pt-12">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow">Talent directory</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                    {directoryType === 'institutions' ? 'Institutions' : 'Athletes and coaches'}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {directoryType === 'institutions'
                      ? `${filteredInstitutions.length} institutions available`
                      : `${filteredAthletes.length + filteredCoaches.length} profiles match your search`}
                  </p>
                </div>
              <div className="inline-flex self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm">
                  <Sparkles className="mr-1.5 size-3.5 text-brand-500" />
                  Profiles update in real time
                </div>
              </div>
              <DirectoryToggle value={directoryType} />
              {directoryType !== 'institutions' && (
                <>
                  <ProfileGroup
                    title="Athletes"
                    description="Performance, academics, film, and contact details."
                    profiles={filteredAthletes}
                    emptyMessage="No athletes match these filters."
                    onClear={clearFilters}
                    showListActions={canManageLists}
                    visible={directoryType === 'athletes'}
                  />
                  <ProfileGroup
                    title="Coaches"
                    description="Programs, recruiting contacts, and coaching profiles."
                    profiles={filteredCoaches}
                    emptyMessage="No coaches match these filters."
                    onClear={clearFilters}
                    showListActions={false}
                    visible={directoryType === 'coaches'}
                  />
                </>
              )}
              <InstitutionGroup
                institutions={filteredInstitutions}
                visible={directoryType === 'institutions'}
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}

// ── Public marketing sections ────────────────────────────────────────────────

function MarketingHome() {
  const features = [
    {
      icon: BarChart3,
      title: 'Tell the full story',
      text: 'Put stats, measurables, academics, film, and contact details in one polished profile.',
    },
    {
      icon: UsersRound,
      title: 'Build real connections',
      text: 'Mutual follows keep your network intentional and conversations relevant.',
    },
    {
      icon: MessageCircle,
      title: 'Move faster together',
      text: 'Real-time private messaging brings athletes and coaches into one focused space.',
    },
  ];
  return (
    <main className="overflow-hidden bg-white">
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div className="athletic-grid absolute inset-0 -z-10" />
        <div className="absolute left-[6%] top-20 -z-10 size-80 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="absolute bottom-0 right-[5%] -z-10 size-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="page-shell grid min-h-[680px] items-center gap-14 py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/25 bg-brand-400/10 px-3 py-1.5 text-xs font-bold text-brand-200">
              <Sparkles className="size-3.5" />
              Built for the next opportunity
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Your game.
              <br />
              <span className="bg-gradient-to-r from-brand-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Your story.
              </span>
              <br />
              Your next move.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
              CoachPoints gives athletes a professional presence and coaches a clearer path to the
              right talent—without the noise.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/login?role=athlete" className="btn-primary min-h-13 px-6 text-base">
                Create athlete profile <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login?role=coach"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-6 py-3 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/14"
              >
                Explore as a coach
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-400" />
                Free to get started
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                Mutual connections
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="size-3.5 text-emerald-400" />
                Real-time messaging
              </span>
            </div>
          </div>
          <HeroPreview />
        </div>
      </section>

      <section className="page-shell py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">One platform. Every advantage.</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Designed for how sports connections actually happen.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Professional tools that keep the athlete at the center and give coaches the signal they
            need.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="surface-card group p-7 transition duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-6 text-lg font-extrabold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="page-shell grid gap-6 py-18 lg:grid-cols-2">
          <RoleCard
            role="Athletes"
            title="Own your profile beyond game day."
            text="Build a credible, shareable home for your performance, academics, highlights, and story."
            href="/login?role=athlete"
            icon={Trophy}
            accent="blue"
            bullets={[
              'Professional public profile',
              'Stats, measurables, and Hudl film',
              'Direct coach connections',
            ]}
          />
          <RoleCard
            role="Coaches"
            title="Turn discovery into a real recruiting workflow."
            text="Find athletes, organize prospect lists, and communicate directly with mutual connections."
            href="/login?role=coach"
            icon={Dumbbell}
            accent="emerald"
            bullets={[
              'Searchable athlete directory',
              'Private recruiting lists',
              'Individual and list messaging',
            ]}
          />
        </div>
      </section>

      <section className="page-shell py-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-600 px-6 py-12 text-center text-white shadow-2xl shadow-brand-600/20 sm:px-12">
          <div className="athletic-grid absolute inset-0" />
          <div className="relative">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-100">
              Ready when you are
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
              Put your next opportunity in motion.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-100">
              Create your CoachPoints profile and start building the network around your goals.
            </p>
            <Link
              href="/login?role=athlete"
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-brand-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-brand-50"
            >
              Build your profile <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:mr-0">
      <div className="absolute -inset-4 rounded-[2.25rem] bg-gradient-to-br from-brand-500/20 to-emerald-400/10 blur-2xl" />
      <div className="relative rotate-[1.5deg] overflow-hidden rounded-[2rem] border border-white/15 bg-white text-slate-950 shadow-2xl shadow-slate-950/50">
        <div className="h-28 bg-gradient-to-br from-brand-700 via-brand-600 to-cyan-500 p-5">
          <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
            Athlete profile
          </span>
        </div>
        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end justify-between">
            <div className="grid size-20 place-items-center rounded-2xl border-4 border-white bg-slate-950 text-2xl font-black text-white shadow-lg">
              JM
            </div>
            <span className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <span className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              Active now
            </span>
          </div>
          <h3 className="mt-4 text-2xl font-black tracking-tight">Joe Random</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">@joe-random · Baseball</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              ['PPG', '18.6'],
              ['Height', '6′ 3″'],
              ['GPA', '3.8'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {label}
                </p>
                <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <span className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-center text-xs font-extrabold text-white">
              View full profile
            </span>
            <span className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600">
              <MessageCircle className="size-4" />
            </span>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-7 -left-7 hidden rotate-[-5deg] rounded-2xl border border-white/70 bg-white p-4 shadow-xl sm:block">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Profile strength
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-emerald-50 text-sm font-black text-emerald-700">
            92%
          </div>
          <p className="text-xs font-bold text-slate-700">Recruiter ready</p>
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  role,
  title,
  text,
  href,
  icon: Icon,
  accent,
  bullets,
}: {
  role: string;
  title: string;
  text: string;
  href: string;
  icon: typeof Trophy;
  accent: 'blue' | 'emerald';
  bullets: string[];
}) {
  const green = accent === 'emerald';
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-card sm:p-9">
      <div
        className={`grid size-12 place-items-center rounded-2xl ${green ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700'}`}
      >
        <Icon className="size-5" />
      </div>
      <p
        className={`mt-6 text-xs font-extrabold uppercase tracking-[0.18em] ${green ? 'text-emerald-600' : 'text-brand-600'}`}
      >
        For {role}
      </p>
      <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
      <ul className="mt-6 space-y-3">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <span
              className={`grid size-5 place-items-center rounded-full ${green ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-100 text-brand-700'}`}
            >
              <Check className="size-3" />
            </span>
            {bullet}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-7 inline-flex items-center gap-2 text-sm font-extrabold ${green ? 'text-emerald-700' : 'text-brand-700'}`}
      >
        Get started <ArrowRight className="size-4" />
      </Link>
    </article>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-28 rounded-2xl border border-white/10 bg-white/8 px-5 py-4 backdrop-blur">
      <strong className="block text-2xl font-black">{value}</strong>
      <span className="text-xs font-semibold text-slate-400">{label}</span>
    </div>
  );
}
function Filter({
  label,
  value,
  onChange,
  options,
  allLabel,
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  allLabel: string;
  wide?: boolean;
}) {
  return (
    <label className={wide ? 'block' : 'block lg:w-44'}>
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="input">
        <option value="all">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
function getName(profile: Athlete) {
  return [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username;
}
function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

function DirectoryToggle({ value }: { value: DirectoryType }) {
  const change = (next: DirectoryType) =>
    window.dispatchEvent(new CustomEvent('directory-type-change', { detail: next }));

  return (
    <div
      className="mt-6 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
      role="group"
      aria-label="Choose directory type"
    >
      <button
        type="button"
        onClick={() => change('athletes')}
        className={`rounded-lg px-3 py-2 text-xs font-extrabold transition ${value === 'athletes' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
      >
        Athletes
      </button>
      <button
        type="button"
        onClick={() => change('institutions')}
        className={`rounded-lg px-3 py-2 text-xs font-extrabold transition ${value === 'institutions' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
      >
        Institutions
      </button>
      <button
        type="button"
        onClick={() => change('coaches')}
        className={`rounded-lg px-3 py-2 text-xs font-extrabold transition ${value === 'coaches' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
      >
        Coaches
      </button>
    </div>
  );
}

const ProfileGroup = memo(function ProfileGroup({
  title,
  description,
  profiles,
  emptyMessage,
  onClear,
  showListActions,
  visible,
}: {
  title: string;
  description: string;
  profiles: Athlete[];
  emptyMessage: string;
  onClear: () => void;
  showListActions: boolean;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <section className="mt-10">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-black tracking-tight text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
          {profiles.length}
        </span>
      </div>
      {profiles.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} showListAction={showListActions} />
          ))}
        </div>
      ) : (
        <div className="surface-card border-dashed px-6 py-12 text-center">
          <p className="text-sm font-semibold text-slate-500">{emptyMessage}</p>
          <button
            type="button"
            onClick={onClear}
            className="mt-4 text-sm font-extrabold text-brand-700 hover:text-brand-800"
          >
            Clear all filters
          </button>
        </div>
      )}
    </section>
  );
});

const ProfileCard = memo(function ProfileCard({
  profile,
  showListAction,
}: {
  profile: Athlete;
  showListAction: boolean;
}) {
  const name = getName(profile);
  const {
    data: { publicUrl: fallbackAvatarUrl },
  } = supabase.storage.from('avatars').getPublicUrl(`${profile.username}/profile.png`);
  const coach = profile.account_type === 'coach';
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover">
      <div
        className={`h-2 ${coach ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-brand-600 to-cyan-400'}`}
      />
      <div className="p-5">
        <Link href={`/${profile.username}`} className="block rounded-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="relative">
              <ProfileAvatar
                src={profile.avatar_url || fallbackAvatarUrl}
                name={name}
                size="compact"
              />
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${coach ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700'}`}
            >
              {coach ? <UserRound className="size-3" /> : <Trophy className="size-3" />}
              {coach ? 'Coach' : 'Athlete'}
            </span>
          </div>
          <h4 className="mt-5 text-lg font-black tracking-tight text-slate-950 transition group-hover:text-brand-700">
            {name}
          </h4>
          <p className="mt-1 text-sm font-medium text-slate-500">@{profile.username}</p>
          <div className="mt-2">
            <OnlineStatus userId={profile.id} compact />
          </div>
          <div className="mt-4 space-y-2 text-xs font-semibold text-slate-600">
            {profile.sport && (
              <p className="flex items-center gap-2">
                <Dumbbell className="size-3.5 text-slate-400" />
                {profile.sport}
                {profile.position ? ` · ${profile.position}` : ''}
              </p>
            )}
            {!coach && profile.high_school && (
              <p className="flex items-center gap-2">
                <MapPin className="size-3.5 text-slate-400" />
                {profile.high_school}
              </p>
            )}
            {coach && profile.college_university && (
              <p className="flex items-center gap-2">
                <GraduationCap className="size-3.5 text-slate-400" />
                {profile.college_university}
              </p>
            )}
          </div>
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-700">
            View profile <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
        {showListAction && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <AddToListButton athleteId={profile.id} />
          </div>
        )}
      </div>
    </article>
  );
});

function InstitutionGroup({
  institutions,
  visible,
}: {
  institutions: Institution[];
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Schools and colleges</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            Explore institutions
          </h3>
          <p className="mt-1 text-sm text-slate-500">Browse athletic programs by institution.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
          {institutions.length}
        </span>
      </div>
      {institutions.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {institutions.map((institution) => (
            <Link
              key={institution.id}
              href={`/institutions/${institution.slug}`}
              className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div
                className="flex items-center gap-4 rounded-2xl p-4"
                style={{ backgroundColor: `${institution.primary_color}12` }}
              >
                {institution.logo_url ? (
                  <img
                    src={institution.logo_url}
                    alt={`${institution.name} logo`}
                    className="size-16 rounded-full object-contain"
                  />
                ) : (
                  <div
                    className="grid size-16 place-items-center rounded-full text-2xl font-black text-white"
                    style={{ backgroundColor: institution.primary_color }}
                  >
                    {institution.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-black text-slate-950 group-hover:text-brand-700">
                    {institution.name}
                  </h4>
                  <p className="mt-1 text-sm font-medium text-slate-500">{institution.location}</p>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-600">
                {institution.mascot ? `${institution.mascot} · ` : ''}
                {institution.tagline ?? 'View institution profile'}
              </p>
              <span className="mt-5 inline-flex text-sm font-extrabold text-brand-700">
                View institution <ArrowRight className="ml-1 size-4" />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="surface-card border-dashed px-6 py-12 text-center">
          <Building2 className="mx-auto size-9 text-slate-400" />
          <p className="mt-3 text-sm font-semibold text-slate-500">
            No institution profiles are available yet.
          </p>
        </div>
      )}
    </section>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <main className="loading-shell">
      <div className="text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
        <p className="mt-4">{label}</p>
      </div>
    </main>
  );
}
function EmptyState() {
  return (
    <div className="surface-card px-6 py-16 text-center">
      <UsersRound className="mx-auto size-10 text-brand-600" />
      <h2 className="mt-4 text-xl font-black text-slate-950">
        The directory is ready for its first profile
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Complete your public profile to start building the CoachPoints network.
      </p>
      <Link href="/dashboard" className="btn-primary mt-6">
        Complete profile <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
