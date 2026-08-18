import { notFound } from 'next/navigation';
import ProfileShareCard from '@/components/ProfileShareCard';
import ProfileAvatar from '@/components/ProfileAvatar';
import HudlHighlight from '@/components/HudlHighlight';
import SocialLinks from '@/components/SocialLinks';
import { supabase } from '@/lib/supabase';

export default async function AthleteProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const athleteQuery = supabase
    .from('profiles')
    .select('first_name, last_name, account_type, height, weight, graduating_class, gpa, sport, position, bio, avatar_url, hudl_highlight_url, phone_number, contact_email, instagram_url, tiktok_url, youtube_url, x_url, stats, measurables')
    .eq('username', username)
    .maybeSingle();
  const coachQuery = supabase
      .from('coachprofiles')
      .select('first_name, last_name, college_university, sport, bio, avatar_url, phone_number, contact_email, instagram_url, tiktok_url, youtube_url, x_url')
      .eq('username', username)
      .maybeSingle();
  const [{ data: athleteProfile, error: athleteError }, { data: coachProfile, error: coachError }] = await Promise.all([athleteQuery, coachQuery]);

  const profile = athleteProfile
    ? { ...athleteProfile, college_university: null }
    : coachProfile
      ? { ...coachProfile, account_type: 'coach' as const, height: null, weight: null, graduating_class: null, gpa: null, sport: coachProfile.sport, position: null, hudl_highlight_url: null, stats: null, measurables: null }
      : null;
  const error = athleteProfile ? athleteError : coachError;

  if (error || !profile) notFound();
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || username;
  const stats = profile.stats && typeof profile.stats === 'object' && !Array.isArray(profile.stats) ? Object.entries(profile.stats) : [];
  const measurables = profile.measurables && typeof profile.measurables === 'object' && !Array.isArray(profile.measurables) ? Object.entries(profile.measurables) : [];
  const { data: { publicUrl: fallbackAvatarUrl } } = supabase.storage.from('avatars').getPublicUrl(`${username}/profile.png`);
  const avatarUrl = profile.avatar_url ?? fallbackAvatarUrl;

  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-12"><article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
    <header className="relative overflow-hidden bg-slate-950 px-6 py-12 text-center text-white sm:px-10 sm:py-16"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#2563eb_0%,transparent_48%)] opacity-70" /><div className="relative"><div className="mx-auto inline-flex rounded-full border-4 border-white/15"><ProfileAvatar src={avatarUrl} name={name} /></div><p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">{profile.account_type === 'coach' ? 'Coach profile' : 'Athlete profile'}</p><h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{name}</h1>{profile.account_type === 'athlete' && <div className="mt-5 flex flex-wrap justify-center gap-2">{profile.sport && <span className="rounded-full border border-blue-300/30 bg-blue-400/15 px-4 py-1.5 text-sm font-semibold text-blue-100">{profile.sport}</span>}{profile.position && <span className="rounded-full border border-violet-300/30 bg-violet-400/15 px-4 py-1.5 text-sm font-semibold text-violet-100">{profile.position}</span>}{profile.height && <span className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold text-slate-200">Height: {profile.height}</span>}{profile.weight && <span className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold text-slate-200">Weight: {profile.weight}</span>}{profile.gpa && <span className="rounded-full border border-amber-300/30 bg-amber-400/15 px-4 py-1.5 text-sm font-semibold text-amber-100">GPA: {profile.gpa}</span>}{profile.graduating_class && <span className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold text-slate-200">Class of {profile.graduating_class}</span>}</div>}{profile.account_type === 'coach' && profile.sport && <span className="mt-5 inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/15 px-4 py-1.5 text-sm font-semibold text-emerald-100">{profile.sport}</span>}<SocialLinks links={{ phoneNumber: profile.phone_number, contactEmail: profile.contact_email, instagramUrl: profile.instagram_url, tiktokUrl: profile.tiktok_url, youtubeUrl: profile.youtube_url, xUrl: profile.x_url }} /></div></header>
    <div className="space-y-10 p-6 sm:p-10"><section><h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">About</h2>{profile.account_type === 'coach' && profile.college_university && <p className="mt-4 text-sm font-semibold text-slate-600">{profile.college_university}</p>}<p className="mt-4 max-w-3xl whitespace-pre-wrap text-base leading-8 text-slate-700">{profile.bio || (profile.account_type === 'coach' ? 'This coach has not added a biography yet.' : 'This athlete has not added a biography yet.')}</p></section>
      <section><div className="flex items-end justify-between gap-4"><div><h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Performance stats</h2><p className="mt-2 text-sm text-slate-500">Highlights shared by {profile.first_name || 'this athlete'}.</p></div></div>{stats.length ? <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{stats.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><dt className="truncate text-xs font-bold uppercase tracking-wider text-slate-500">{label}</dt><dd className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{String(value)}</dd></div>)}</dl> : <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">Performance statistics will be added soon.</div>}</section>
      {profile.account_type === 'athlete' && <section><h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Measurables</h2>{measurables.length ? <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{measurables.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><dt className="truncate text-xs font-bold uppercase tracking-wider text-slate-500">{label}</dt><dd className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{String(value)}</dd></div>)}</dl> : <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">Measurables will be added soon.</div>}</section>}
      {profile.hudl_highlight_url && <section><h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Hudl highlight</h2><div className="mt-4"><HudlHighlight url={profile.hudl_highlight_url} /></div></section>}
      <ProfileShareCard username={username} />
    </div>
  </article></main>;
}
