/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Building2, MapPin, Trophy } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import InstitutionEditor from '@/components/InstitutionEditor';
import { safeHttpsUrl } from '@/lib/safeExternalUrl';
import SportBadge from '@/components/SportBadge';

type Sport = {
  id: string;
  sport_name: string;
  gender: 'men' | 'women' | 'coed';
  display_name: string;
  description: string | null;
  official_url: string | null;
};

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
  about: string | null;
  website_url: string | null;
  athletics_url: string | null;
  gpa_requirement: string | null;
  sat_min_score: number | null;
  act_min_score: number | null;
  admissions_requirements: string | null;
  admissions_url: string | null;
  sports: Sport[];
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { data } = await supabase
    .from('institutions')
    .select('name, tagline')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  return {
    title: data?.name ? `${data.name} | CoachPoints` : 'Institution | CoachPoints',
    description: data?.tagline ?? 'Explore athletic programs on CoachPoints.',
  };
}

/** Reusable institution template populated by one institution and its sports. */
export default async function InstitutionPage({ params }: PageProps) {
  const { slug } = await params;
  const { data, error } = await supabase
    .from('institutions')
    .select(
      'id, name, slug, location, mascot, logo_url, primary_color, secondary_color, tagline, about, website_url, athletics_url, gpa_requirement, sat_min_score, act_min_score, admissions_requirements, admissions_url, sports(id, sport_name, gender, display_name, description, official_url)',
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) {
    return (
      <main className="loading-shell">
        <div className="text-center">
          <Building2 className="mx-auto size-10 text-slate-400" />
          <h1 className="mt-4 text-2xl font-black text-slate-950">Institution not found</h1>
          <Link href="/" className="btn-primary mt-6">
            <ArrowLeft className="size-4" /> Back to discover
          </Link>
        </div>
      </main>
    );
  }

  const institution = data as unknown as Institution;
  const logoUrl = safeHttpsUrl(institution.logo_url);
  const websiteUrl = safeHttpsUrl(institution.website_url);
  const athleticsUrl = safeHttpsUrl(institution.athletics_url);
  const admissionsUrl = safeHttpsUrl(institution.admissions_url);

  return (
    <main
      className="min-h-[calc(100vh-72px)] pb-20"
      style={
        {
          '--institution-primary': institution.primary_color,
          '--institution-secondary': institution.secondary_color,
        } as React.CSSProperties
      }
    >
      <section
        className="relative overflow-hidden py-16 text-white sm:py-24"
        style={{ backgroundColor: institution.primary_color }}
      >
        <div className="athletic-grid absolute inset-0 opacity-40" />
        <div className="page-shell relative">
          <div className="absolute right-4 top-0 sm:right-0">
            <InstitutionEditor institution={institution} />
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/75 transition hover:text-white"
          >
            <ArrowLeft className="size-4" /> Back to discover
          </Link>
          <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${institution.name} logo`}
                className="size-32 rounded-3xl bg-white p-3 object-contain shadow-2xl"
              />
            ) : (
              <div className="grid size-32 place-items-center rounded-3xl bg-white/15 text-6xl font-black">
                {institution.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-white/70">
                Institution profile
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
                {institution.name}
              </h1>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white/80">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4" /> {institution.location}
                </span>
                {institution.mascot && (
                  <span className="inline-flex items-center gap-2">
                    <Trophy className="size-4" /> {institution.mascot}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell -mt-7 relative z-10">
        <section className="surface-card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow">About {institution.name}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              {institution.tagline ?? 'Explore the program'}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              {institution.about ?? 'Institution information is coming soon.'}
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-3 lg:flex-col">
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                College website <ArrowUpRight className="size-4" />
              </a>
            )}
            {athleticsUrl && (
              <a
                href={athleticsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Athletics site <ArrowUpRight className="size-4" />
              </a>
            )}
          </div>
        </section>

        {(institution.gpa_requirement ||
          institution.sat_min_score ||
          institution.act_min_score ||
          institution.admissions_requirements ||
          admissionsUrl) && (
          <section className="surface-card mt-6 p-6 sm:p-8">
            <p className="eyebrow">Admissions snapshot</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {institution.gpa_requirement && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    GPA requirement
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-950">
                    {institution.gpa_requirement}
                  </p>
                </div>
              )}
              {institution.sat_min_score && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    SAT minimum
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-950">
                    {institution.sat_min_score}
                  </p>
                </div>
              )}
              {institution.act_min_score && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    ACT minimum
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-950">
                    {institution.act_min_score}
                  </p>
                </div>
              )}
            </div>
            {institution.admissions_requirements && (
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">
                {institution.admissions_requirements}
              </p>
            )}
            {admissionsUrl && (
              <a
                href={admissionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-5"
              >
                Admissions information <ArrowUpRight className="size-4" />
              </a>
            )}
          </section>
        )}

        <section className="pt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Athletic programs</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Sports at {institution.name}
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
              {institution.sports.length} programs
            </span>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {institution.sports.map((sport) => (
              <article key={sport.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="grid size-10 place-items-center rounded-xl text-white"
                    style={{ backgroundColor: institution.primary_color }}
                  >
                    <SportBadge sportName={sport.sport_name || sport.display_name} />
                  </span>
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider"
                    style={{ backgroundColor: `${institution.secondary_color}55` }}
                  >
                    {sport.gender === 'coed'
                      ? 'Coed'
                      : sport.gender === 'men'
                        ? "Men's"
                        : "Women's"}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-black text-slate-950">{sport.display_name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                  {sport.description ?? 'Explore this athletic program.'}
                </p>
                {safeHttpsUrl(sport.official_url) && (
                  <a
                    href={safeHttpsUrl(sport.official_url) ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold"
                    style={{ color: institution.primary_color }}
                  >
                    Official program <ArrowUpRight className="size-4" />
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
