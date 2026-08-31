'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Dumbbell, ListChecks, LogOut, Pencil, Save, UsersRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import ProfileReadinessPopup from '@/components/ProfileReadinessPopup';
import { coachPositions } from '@/lib/sports';

// ── Coach profile model ──────────────────────────────────────────────────────

type CoachProfile = {
  firstName: string;
  lastName: string;
  username: string;
  collegeUniversity: string;
  sport: string;
  position: string;
  bio: string;
  phoneNumber: string;
  contactEmail: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  xUrl: string;
};
const emptyProfile: CoachProfile = {
  firstName: '',
  lastName: '',
  username: '',
  collegeUniversity: '',
  sport: '',
  position: '',
  bio: '',
  phoneNumber: '',
  contactEmail: '',
  instagramUrl: '',
  tiktokUrl: '',
  youtubeUrl: '',
  xUrl: '',
};

/** Loads, edits, and saves the signed-in coach's public profile. */
export default function CoachDashboardPage() {
  const router = useRouter();
  const { ready, user } = useAuth();
  const [profile, setProfile] = useState<CoachProfile>(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const readiness = (() => {
    const checks = [
      {
        label: 'Name',
        detail: 'Add your first and last name.',
        complete: Boolean(profile.firstName.trim() && profile.lastName.trim()),
        weight: 20,
      },
      {
        label: 'School or program',
        detail: 'Tell athletes which program you represent.',
        complete: Boolean(profile.collegeUniversity.trim()),
        weight: 20,
      },
      {
        label: 'Sport or program',
        detail: 'Make your recruiting focus clear.',
        complete: Boolean(profile.sport.trim()),
        weight: 15,
      },
      {
        label: 'Coaching story',
        detail: 'Share your experience and philosophy.',
        complete: Boolean(profile.bio.trim()),
        weight: 20,
      },
      {
        label: 'Contact details',
        detail: 'Give athletes a direct way to reach you.',
        complete: Boolean(profile.contactEmail.trim() || profile.phoneNumber.trim()),
        weight: 15,
      },
      {
        label: 'Social presence',
        detail: 'Add a public link for more context.',
        complete: Boolean(
          profile.instagramUrl.trim() ||
          profile.tiktokUrl.trim() ||
          profile.youtubeUrl.trim() ||
          profile.xUrl.trim(),
        ),
        weight: 10,
      },
    ];
    const points = checks.reduce((total, check) => total + (check.complete ? check.weight : 0), 0);
    return { checks, points, nextSteps: checks.filter((check) => !check.complete).slice(0, 3) };
  })();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/login?role=coach');
      return;
    }
    if (user.user_metadata.account_type !== 'coach') {
      router.replace('/dashboard');
      return;
    }
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from('coachprofiles')
        .select(
          'first_name, last_name, username, college_university, sport, position, bio, phone_number, contact_email, instagram_url, tiktok_url, youtube_url, x_url',
        )
        .eq('id', user.id)
        .maybeSingle();
      if (!active) return;
      setProfile({
        firstName: data?.first_name ?? user.user_metadata.first_name ?? '',
        lastName: data?.last_name ?? user.user_metadata.last_name ?? '',
        username: data?.username ?? user.user_metadata.username ?? '',
        collegeUniversity: data?.college_university ?? '',
        sport: data?.sport ?? '',
        position: data?.position ?? '',
        bio: data?.bio ?? '',
        phoneNumber: data?.phone_number ?? '',
        contactEmail: data?.contact_email ?? user.email ?? '',
        instagramUrl: data?.instagram_url ?? '',
        tiktokUrl: data?.tiktok_url ?? '',
        youtubeUrl: data?.youtube_url ?? '',
        xUrl: data?.x_url ?? '',
      });
      setLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, [ready, router, user]);

  // ── Profile editing and persistence ────────────────────────────────────────

  const update = <K extends keyof CoachProfile>(key: K, value: CoachProfile[K]) =>
    setProfile((current) => ({ ...current, [key]: value }));
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !editing) return;
    setSaving(true);
    setNotice(null);
    const { error } = await supabase.from('coachprofiles').upsert(
      {
        id: user.id,
        first_name: profile.firstName.trim(),
        last_name: profile.lastName.trim(),
        username: profile.username.trim().toLowerCase(),
        college_university: profile.collegeUniversity.trim() || null,
        sport: profile.sport.trim(),
        position: profile.position.trim() || null,
        bio: profile.bio.trim(),
        phone_number: profile.phoneNumber.trim() || null,
        contact_email: profile.contactEmail.trim() || null,
        instagram_url: profile.instagramUrl.trim() || null,
        tiktok_url: profile.tiktokUrl.trim() || null,
        youtube_url: profile.youtubeUrl.trim() || null,
        x_url: profile.xUrl.trim() || null,
      },
      { onConflict: 'id' },
    );
    if (error) setNotice(error.message);
    else {
      setProfile((current) => ({ ...current, username: current.username.trim().toLowerCase() }));
      setEditing(false);
      setNotice('Coach profile saved successfully.');
    }
    setSaving(false);
  };

  if (loading) return <main className="loading-shell">Loading your coach workspace…</main>;
  return (
    <main className="min-h-screen pb-20 pt-8 sm:pt-10">
      <div className="page-shell max-w-5xl">
        <header className="athletic-grid relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-300/50 sm:px-8 sm:py-10">
          <div className="absolute -right-16 -top-24 size-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="hidden size-12 shrink-0 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-200 sm:grid">
                <Dumbbell className="size-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-300">
                  Coach workspace
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  Lead your recruiting presence
                </h1>
                <p className="mt-2 text-sm font-medium text-slate-400">{user?.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.username && (
                <Link
                  href={`/${profile.username}`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  View profile <ArrowUpRight className="size-4" />
                </Link>
              )}
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.replace('/login?role=coach');
                }}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/coach-lists"
            className="surface-card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-card-hover"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <ListChecks className="size-5" />
            </span>
            <span>
              <strong className="block text-sm font-extrabold text-slate-950">
                Recruiting lists
              </strong>
              <span className="mt-0.5 block text-xs text-slate-500">
                Organize and message athlete groups
              </span>
            </span>
            <ArrowUpRight className="ml-auto size-4 text-slate-400 group-hover:text-emerald-600" />
          </Link>
          <Link
            href="/friends"
            className="surface-card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <UsersRound className="size-5" />
            </span>
            <span>
              <strong className="block text-sm font-extrabold text-slate-950">Your network</strong>
              <span className="mt-0.5 block text-xs text-slate-500">Manage mutual connections</span>
            </span>
            <ArrowUpRight className="ml-auto size-4 text-slate-400 group-hover:text-brand-600" />
          </Link>
        </div>
        <ProfileReadinessPopup
          checks={readiness.checks}
          points={readiness.points}
          recruiterReady={readiness.points === 100}
          variant="coach"
        />

        <form onSubmit={save} className="surface-card mt-6 p-6 sm:p-8">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow text-emerald-600">Public identity</p>
              <h2 className="section-title mt-2">Coach information</h2>
              <p className="mt-1 text-sm text-slate-500">
                Share the information athletes need to know about you and your program.
              </p>
            </div>
            {editing ? (
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                Cancel editing
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setNotice(null);
                  setEditing(true);
                }}
                className="btn-dark"
              >
                <Pencil className="size-4" />
                Edit profile
              </button>
            )}
          </div>
          <fieldset disabled={!editing} className="grid gap-5 sm:grid-cols-2 disabled:opacity-75">
            <Field
              label="First name"
              value={profile.firstName}
              onChange={(value) => update('firstName', value)}
              placeholder="Joe"
              required
            />
            <Field
              label="Last name"
              value={profile.lastName}
              onChange={(value) => update('lastName', value)}
              placeholder="Random"
              required
            />
            <Field
              label="College / university"
              value={profile.collegeUniversity}
              onChange={(value) => update('collegeUniversity', value)}
              placeholder="State University"
            />
            <Field
              label="Sport or program"
              value={profile.sport}
              onChange={(value) => update('sport', value)}
              placeholder="Football"
            />
            <label className="block text-sm font-bold text-slate-700">
              <span className="mb-2 block">Position</span>
              <input
                list="coach-position-options"
                value={profile.position}
                onChange={(event) => update('position', event.target.value)}
                placeholder="Head Coach"
                className="input"
              />
              <datalist id="coach-position-options">
                {coachPositions.map((position) => (
                  <option key={position} value={position} />
                ))}
              </datalist>
            </label>
            <label className="block text-sm font-bold text-slate-700 sm:col-span-2">
              <span className="mb-2 block">Bio</span>
              <textarea
                value={profile.bio}
                onChange={(event) => update('bio', event.target.value)}
                rows={5}
                className="input resize-y"
                placeholder="Your coaching experience, philosophy, and specialties."
              />
            </label>
            <Field
              label="Phone number"
              value={profile.phoneNumber}
              onChange={(value) => update('phoneNumber', value)}
              placeholder="(555) 123-4567"
            />
            <Field
              label="Contact email"
              value={profile.contactEmail}
              onChange={(value) => update('contactEmail', value)}
              placeholder="you@example.com"
            />
            <Field
              label="Instagram URL"
              value={profile.instagramUrl}
              onChange={(value) => update('instagramUrl', value)}
              placeholder="https://instagram.com/yourname"
            />
            <Field
              label="TikTok URL"
              value={profile.tiktokUrl}
              onChange={(value) => update('tiktokUrl', value)}
              placeholder="https://tiktok.com/@yourname"
            />
            <Field
              label="YouTube URL"
              value={profile.youtubeUrl}
              onChange={(value) => update('youtubeUrl', value)}
              placeholder="https://youtube.com/@yourname"
            />
            <Field
              label="X URL"
              value={profile.xUrl}
              onChange={(value) => update('xUrl', value)}
              placeholder="https://x.com/yourname"
            />
          </fieldset>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {notice ? (
              <p
                role="status"
                className={`text-sm font-bold ${notice.includes('successfully') ? 'text-emerald-600' : 'text-rose-600'}`}
              >
                {notice}
              </p>
            ) : (
              <span />
            )}
            {editing && (
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60"
              >
                <Save className="size-4" />
                {saving ? 'Saving…' : 'Save coach profile'}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

// ── Reusable form field ───────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      <span className="mb-2 block">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="input"
      />
    </label>
  );
}
