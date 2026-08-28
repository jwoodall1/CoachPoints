import type { Metadata } from 'next';
import { Activity, BookOpen, Dumbbell, Gauge, GraduationCap, MapPin, Ruler, Scale, Trophy, UserRound, Video } from 'lucide-react';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import AddToListButton from '@/components/AddToListButton';
import FriendRequestButton from '@/components/FriendRequestButton';
import HudlHighlight from '@/components/HudlHighlight';
import ProfileAvatar from '@/components/ProfileAvatar';
import ProfileShareCard from '@/components/ProfileShareCard';
import SocialLinks from '@/components/SocialLinks';
import { supabase } from '@/lib/supabase';

type ProfilePageProps = { params: Promise<{ username: string }> };

const getPublicProfile = cache(async (username: string) => {
  const athleteQuery = supabase.from('profiles').select('id, first_name, last_name, account_type, height, weight, graduating_class, high_school, gpa, sport, position, bio, avatar_url, hudl_highlight_url, hudl_secondary_urls, phone_number, contact_email, instagram_url, tiktok_url, youtube_url, x_url, stats, measurables').eq('username', username).maybeSingle();
  const coachQuery = supabase.from('coachprofiles').select('id, first_name, last_name, college_university, sport, bio, avatar_url, phone_number, contact_email, instagram_url, tiktok_url, youtube_url, x_url').eq('username', username).maybeSingle();
  const [{ data: athleteProfile, error: athleteError }, { data: coachProfile, error: coachError }] = await Promise.all([athleteQuery, coachQuery]);
  const profile = athleteProfile ? { ...athleteProfile, college_university: null } : coachProfile ? { ...coachProfile, account_type: 'coach' as const, height: null, weight: null, graduating_class: null, high_school: null, gpa: null, sport: coachProfile.sport, position: null, hudl_highlight_url: null, hudl_secondary_urls: [], stats: null, measurables: null } : null;
  return { error: athleteProfile ? athleteError : coachError, profile };
});

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const { profile } = await getPublicProfile(username);
  if (!profile) return { title: 'Profile not found | CoachPoints' };
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || username;
  const role = profile.account_type === 'coach' ? 'Coach' : 'Athlete';
  return { title: `${name} | CoachPoints`, description: `${role} profile for ${name} on CoachPoints.` };
}

/** Public-facing athlete or coach portfolio with recruiting-ready details. */
export default async function PublicProfile({ params }: ProfilePageProps) {
  const { username } = await params;
  const { error, profile } = await getPublicProfile(username);
  if (error || !profile) notFound();
  const isCoach = profile.account_type === 'coach';
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || username;
  const stats = profile.stats && typeof profile.stats === 'object' && !Array.isArray(profile.stats) ? Object.entries(profile.stats) : [];
  const measurables = profile.measurables && typeof profile.measurables === 'object' && !Array.isArray(profile.measurables) ? Object.entries(profile.measurables) : [];
  const hasHudlHighlights = Boolean(profile.hudl_highlight_url || profile.hudl_secondary_urls?.length);
  const { data: { publicUrl: fallbackAvatarUrl } } = supabase.storage.from('avatars').getPublicUrl(`${username}/profile.png`);
  const avatarUrl = profile.avatar_url ?? fallbackAvatarUrl;
  const details = [
    profile.sport && { icon: Dumbbell, label: profile.sport },
    profile.position && { icon: Activity, label: profile.position },
    profile.high_school && { icon: MapPin, label: profile.high_school },
    profile.college_university && { icon: GraduationCap, label: profile.college_university },
    profile.graduating_class && { icon: GraduationCap, label: `Class of ${profile.graduating_class}` },
  ].filter(Boolean) as Array<{ icon: typeof Activity; label: string }>;

  return <main className="min-h-screen pb-20">
    <section className="relative overflow-hidden bg-slate-950 text-white"><div className="athletic-grid absolute inset-0" /><div className={`absolute -right-20 -top-32 size-[28rem] rounded-full blur-3xl ${isCoach ? 'bg-emerald-500/20' : 'bg-brand-600/25'}`} /><div className="page-shell relative py-12 sm:py-16"><div className="grid items-center gap-8 md:grid-cols-[auto_1fr] md:gap-10"><div className="mx-auto rounded-full border-4 border-white/15 bg-white/5 p-1 shadow-2xl md:mx-0"><ProfileAvatar src={avatarUrl} name={name} preload /></div><div className="text-center md:text-left"><div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] ${isCoach ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-200' : 'border-brand-300/25 bg-brand-400/10 text-brand-200'}`}>{isCoach ? <UserRound className="size-3.5" /> : <Trophy className="size-3.5" />}{isCoach ? 'Coach profile' : 'Athlete profile'}</div><h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl lg:text-6xl">{name}</h1><p className="mt-2 text-sm font-semibold text-slate-400">@{username}</p>{details.length > 0 && <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 md:justify-start">{details.map(({ icon: Icon, label }) => <span key={label} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200"><Icon className={`size-4 ${isCoach ? 'text-emerald-300' : 'text-brand-300'}`} />{label}</span>)}</div>}<SocialLinks links={{ phoneNumber: profile.phone_number, contactEmail: profile.contact_email, instagramUrl: profile.instagram_url, tiktokUrl: profile.tiktok_url, youtubeUrl: profile.youtube_url, xUrl: profile.x_url }} /><div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start"><FriendRequestButton targetUserId={profile.id} targetName={name} />{!isCoach && <AddToListButton athleteId={profile.id} prominent />}</div></div></div>
      {!isCoach && <div className="mt-10 grid grid-cols-2 gap-3 border-t border-white/10 pt-7 sm:grid-cols-4">{profile.height && <HeroMetric icon={Ruler} label="Height" value={profile.height} />}{profile.weight && <HeroMetric icon={Scale} label="Weight" value={profile.weight} />}{profile.gpa && <HeroMetric icon={BookOpen} label="GPA" value={profile.gpa} />}{profile.graduating_class && <HeroMetric icon={GraduationCap} label="Graduates" value={profile.graduating_class} />}</div>}
    </div></section>

    <div className="page-shell pt-10"><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]"><div className="space-y-8"><section className="surface-card p-6 sm:p-8"><SectionHeading icon={UserRound} eyebrow="Profile" title="About" /><p className="mt-5 whitespace-pre-wrap text-base leading-8 text-slate-600">{profile.bio || (isCoach ? 'This coach has not added a biography yet.' : 'This athlete has not added a biography yet.')}</p></section>
      {!isCoach && <section className="surface-card p-6 sm:p-8"><SectionHeading icon={Gauge} eyebrow="Performance" title="Stats that define the game" />{stats.length ? <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{stats.map(([label, value]) => <DataTile key={label} label={label} value={String(value)} />)}</dl> : <EmptyData text="Performance statistics will be added soon." />}</section>}
      {!isCoach && <section className="surface-card p-6 sm:p-8"><SectionHeading icon={Ruler} eyebrow="Athletic profile" title="Measurables" />{measurables.length ? <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{measurables.map(([label, value]) => <DataTile key={label} label={label} value={String(value)} compact />)}</dl> : <EmptyData text="Measurables will be added soon." />}</section>}
      {hasHudlHighlights && <section className="surface-card p-6 sm:p-8"><SectionHeading icon={Video} eyebrow="Film" title="Hudl highlight reel" /><div className="mt-6"><HudlHighlight primaryUrl={profile.hudl_highlight_url} secondaryUrls={profile.hudl_secondary_urls} /></div></section>}</div><aside className="lg:sticky lg:top-28 lg:self-start"><ProfileShareCard username={username} /></aside></div></div>
  </main>;
}

function HeroMetric({ icon: Icon, label, value }: { icon: typeof Ruler; label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><Icon className="size-3.5" />{label}</div><p className="mt-2 text-xl font-black text-white">{value}</p></div>; }
function SectionHeading({ icon: Icon, eyebrow, title }: { icon: typeof UserRound; eyebrow: string; title: string }) { return <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="size-4.5" /></div><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p><h2 className="mt-0.5 text-xl font-black tracking-tight text-slate-950">{title}</h2></div></div>; }
function DataTile({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) { return <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-5"><dt className="truncate text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{label}</dt><dd className={`mt-2 font-black tracking-tight text-slate-950 ${compact ? 'text-2xl' : 'text-3xl'}`}>{value}</dd></div>; }
function EmptyData({ text }: { text: string }) { return <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-9 text-center text-sm font-medium text-slate-500">{text}</div>; }
