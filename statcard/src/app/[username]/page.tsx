import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ProfileShareCard from '@/components/ProfileShareCard';
import ProfileAvatar from '@/components/ProfileAvatar';
import HudlHighlight from '@/components/HudlHighlight';
import SocialLinks from '@/components/SocialLinks';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function AthleteProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, sport, bio, hudl_highlight_url, instagram_url, tiktok_url, youtube_url, x_url, stats')
    .eq('username', username)
    .maybeSingle();

  if (error || !profile) notFound();
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || username;
  const stats = profile.stats && typeof profile.stats === 'object' && !Array.isArray(profile.stats) ? Object.entries(profile.stats) : [];
  const { data: { publicUrl: avatarUrl } } = supabase.storage.from('avatars').getPublicUrl(`${username}/profile.png`);

  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-12"><article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
    <header className="relative overflow-hidden bg-slate-950 px-6 py-12 text-center text-white sm:px-10 sm:py-16"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#2563eb_0%,transparent_48%)] opacity-70" /><div className="relative"><div className="mx-auto inline-flex rounded-full border-4 border-white/15"><ProfileAvatar src={avatarUrl} name={name} /></div><p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Athlete profile</p><h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{name}</h1>{profile.sport && <span className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/15 px-4 py-1.5 text-sm font-semibold text-blue-100">{profile.sport}</span>}<SocialLinks links={{ instagramUrl: profile.instagram_url, tiktokUrl: profile.tiktok_url, youtubeUrl: profile.youtube_url, xUrl: profile.x_url }} /></div></header>
    <div className="space-y-10 p-6 sm:p-10"><section><h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">About</h2><p className="mt-4 max-w-3xl whitespace-pre-wrap text-base leading-8 text-slate-700">{profile.bio || 'This athlete has not added a biography yet.'}</p></section>
      <section><div className="flex items-end justify-between gap-4"><div><h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Performance stats</h2><p className="mt-2 text-sm text-slate-500">Highlights shared by {profile.first_name || 'this athlete'}.</p></div></div>{stats.length ? <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{stats.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><dt className="truncate text-xs font-bold uppercase tracking-wider text-slate-500">{label}</dt><dd className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{String(value)}</dd></div>)}</dl> : <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">Performance statistics will be added soon.</div>}</section>
      {profile.hudl_highlight_url && <section><h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Hudl highlight</h2><div className="mt-4"><HudlHighlight url={profile.hudl_highlight_url} /></div></section>}
      <ProfileShareCard username={username} />
    </div>
  </article></main>;
}
