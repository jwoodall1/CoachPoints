'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import UploadModal from '@/components/UploadModal';
import ProfileAvatar from '@/components/ProfileAvatar';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type Stat = { id: string; label: string; value: string };
type AccountType = 'athlete' | 'coach';
type Profile = { firstName: string; lastName: string; username: string; accountType: AccountType; sport: string; bio: string; hudl_highlight_url: string; instagram_url: string; tiktok_url: string; youtube_url: string; x_url: string; stats: Stat[]; measurables: Stat[] };
const emptyProfile: Profile = { firstName: '', lastName: '', username: '', accountType: 'athlete', sport: '', bio: '', hudl_highlight_url: '', instagram_url: '', tiktok_url: '', youtube_url: '', x_url: '', stats: [], measurables: [] };

const collegiateSports = [
  'Baseball', 'Beach volleyball', 'Fencing', 'Field hockey', 'Football', 'Gymnastics', 'Softball',
  "Men's basketball", "Women's basketball", "Men's cross country", "Women's cross country",
  "Men's golf", "Women's golf", "Men's ice hockey", "Women's ice hockey", "Men's lacrosse", "Women's lacrosse",
  "Men's rowing", "Women's rowing", "Men's soccer", "Women's soccer", "Men's swimming and diving",
  "Women's swimming and diving", "Men's tennis", "Women's tennis", "Men's track and field",
  "Women's track and field", "Men's volleyball", "Women's volleyball", "Men's water polo", "Women's water polo",
  "Men's wrestling", "Women's wrestling", 'Other',
] as const;

const isValidHudlUrl = (value: string) => {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) && url.hostname === 'www.hudl.com' && (url.pathname.includes('/video/') || url.pathname.includes('/v/') || url.pathname.includes('/embed/'));
  } catch {
    return false;
  }
};

const asStats = (stats: unknown): Stat[] => stats && typeof stats === 'object' && !Array.isArray(stats)
  ? Object.entries(stats as Record<string, unknown>).map(([label, value]) => ({ id: crypto.randomUUID(), label, value: String(value) })) : [];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [savedProfile, setSavedProfile] = useState<Profile>(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const hudlUrlError = profile.hudl_highlight_url.trim() && !isValidHudlUrl(profile.hudl_highlight_url)
    ? 'Enter a valid Hudl video link, such as http://www.hudl.com/v/2JrhL4 or https://www.hudl.com/video/....'
    : null;

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace('/login');
      if (session.user.user_metadata.account_type === 'coach') return router.replace('/coach-dashboard');
      setUser(session.user);
      const accountType: AccountType = session.user.user_metadata.account_type === 'coach' ? 'coach' : 'athlete';
      let data: { first_name?: string | null; last_name?: string | null; username?: string | null; sport?: string | null; bio?: string | null; avatar_url?: string | null; hudl_highlight_url?: string | null; instagram_url?: string | null; tiktok_url?: string | null; youtube_url?: string | null; x_url?: string | null; stats?: unknown; measurables?: unknown } | null = null;
      if (accountType === 'coach') {
        const result = await supabase.from('coachprofiles').select('first_name, last_name, username, sport, bio, avatar_url, instagram_url, tiktok_url, youtube_url, x_url').eq('id', session.user.id).maybeSingle();
        data = result.data;
      } else {
        const result = await supabase.from('profiles').select('first_name, last_name, username, sport, bio, avatar_url, hudl_highlight_url, instagram_url, tiktok_url, youtube_url, x_url, stats, measurables').eq('id', session.user.id).maybeSingle();
        data = result.data;
      }
      const loaded: Profile = { firstName: data?.first_name ?? session.user.user_metadata.first_name ?? '', lastName: data?.last_name ?? session.user.user_metadata.last_name ?? '', username: data?.username ?? session.user.user_metadata.username ?? '', accountType, sport: data?.sport ?? '', bio: data?.bio ?? '', hudl_highlight_url: data?.hudl_highlight_url ?? '', instagram_url: data?.instagram_url ?? '', tiktok_url: data?.tiktok_url ?? '', youtube_url: data?.youtube_url ?? '', x_url: data?.x_url ?? '', stats: asStats(data?.stats), measurables: asStats(data?.measurables) };
      setProfile(loaded);
      setSavedProfile(loaded);
      const avatarPath = loaded.username ? `${loaded.username}/profile.png` : '';
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(avatarPath);
      setAvatarUrl(data?.avatar_url ?? (avatarPath ? publicUrl : null));
      setSavedAvatarUrl(data?.avatar_url ?? (avatarPath ? publicUrl : null));
      setLoading(false);
    };
    load();
  }, [router]);

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => setProfile((current) => ({ ...current, [key]: value }));
  const updateStat = (id: string, key: 'label' | 'value', value: string) => update('stats', profile.stats.map((stat) => stat.id === id ? { ...stat, [key]: value } : stat));
  const updateMeasurable = (id: string, key: 'label' | 'value', value: string) => update('measurables', profile.measurables.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const stopEditing = () => { setProfile(savedProfile); setAvatarUrl(savedAvatarUrl); setIsEditing(false); setNotice(null); };

  const saveAvatar = async (image: string) => {
    if (!user) return;
    const imageBlob = await (await fetch(image)).blob();
    const path = `${profile.username}/profile.png`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, imageBlob, { contentType: 'image/png', upsert: true });
    if (uploadError) throw new Error(uploadError.message);
    const { data: { publicUrl: uploadedImageUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const finalUrl = `${uploadedImageUrl}?v=${Date.now()}`;
    const profileError = profile.accountType === 'coach'
      ? (await supabase.from('coachprofiles').update({ avatar_url: finalUrl }).eq('id', user.id)).error
      : (await supabase.from('profiles').update({ avatar_url: finalUrl }).eq('id', user.id)).error;
    if (profileError) throw new Error(profileError.message);
    setAvatarUrl(finalUrl);
    setSavedAvatarUrl(finalUrl);
    setNotice('Profile photo updated successfully.');
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const username = profile.username;
    if (username.length < 3) return setNotice('Choose a public handle with at least 3 letters or numbers.');
    setSaving(true); setNotice(null);
    const stats = Object.fromEntries(profile.stats.filter(({ label }) => label.trim()).map(({ label, value }) => [label.trim(), value.trim()]));
    const error = profile.accountType === 'coach'
      ? (await supabase.from('coachprofiles').upsert({ id: user.id, first_name: profile.firstName.trim(), last_name: profile.lastName.trim(), username, sport: profile.sport.trim(), bio: profile.bio.trim(), instagram_url: profile.instagram_url.trim() || null, tiktok_url: profile.tiktok_url.trim() || null, youtube_url: profile.youtube_url.trim() || null, x_url: profile.x_url.trim() || null }, { onConflict: 'id' })).error
      : (await supabase.from('profiles').upsert({ id: user.id, first_name: profile.firstName.trim(), last_name: profile.lastName.trim(), username, sport: profile.sport.trim(), bio: profile.bio.trim(), hudl_highlight_url: profile.hudl_highlight_url.trim() || null, instagram_url: profile.instagram_url.trim() || null, tiktok_url: profile.tiktok_url.trim() || null, youtube_url: profile.youtube_url.trim() || null, x_url: profile.x_url.trim() || null, stats, measurables: Object.fromEntries(profile.measurables.filter(({ label }) => label.trim()).map(({ label, value }) => [label.trim(), value.trim()])) }, { onConflict: 'id' })).error;
    if (error) setNotice(error.message);
    else {
      const saved = { ...profile, username };
      setProfile(saved); setSavedProfile(saved); setSavedAvatarUrl(avatarUrl); setIsEditing(false);
      setNotice('Profile saved successfully.');
    }
    setSaving(false);
  };

  if (loading) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-medium text-slate-500">Loading your dashboard…</main>;

  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-12"><div className="mx-auto max-w-5xl">
    <header className="mb-8 flex flex-col gap-5 rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-200 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div><p className="text-sm font-medium text-blue-300">{profile.accountType === 'coach' ? 'Coach dashboard' : 'Athlete dashboard'}</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Build your Athlio profile</h1><p className="mt-2 text-sm text-slate-300">{user?.email}</p></div>
      <button type="button" onClick={async () => { await supabase.auth.signOut(); router.replace('/login'); }} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Sign out</button>
    </header>
    <form onSubmit={saveProfile} className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-xl font-bold text-slate-950">Personal information</h2><p className="mt-1 text-sm text-slate-500">This is what visitors see on your public profile.</p></div>{isEditing ? <button type="button" onClick={stopEditing} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Stop editing</button> : <button type="button" onClick={() => { setIsEditing(true); setNotice(null); }} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">Edit profile</button>}</div>
        <div className="mb-7 flex items-center gap-4">{avatarUrl ? <ProfileAvatar src={avatarUrl} name={profile.firstName || 'Profile'} size="small" /> : <div className="grid size-20 place-items-center rounded-full bg-slate-100 text-xl font-bold text-slate-400">{profile.firstName.slice(0, 1).toUpperCase()}</div>}<div><p className="text-sm font-semibold text-slate-800">Profile photo</p><p className="mt-1 text-sm text-slate-500">A 512 × 512 circular image.</p>{isEditing && <button type="button" onClick={() => setIsPhotoModalOpen(true)} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700">{avatarUrl ? 'Change photo' : 'Upload photo'}</button>}</div></div>
        <div className="mb-5 sm:max-w-sm"><label className="block text-sm font-semibold text-slate-700"><span className="mb-2 block">Public handle</span><input value={profile.username} readOnly aria-readonly="true" className="input cursor-not-allowed bg-slate-100 text-slate-500" /><span className="mt-2 block text-xs font-normal text-slate-500">Your permanent profile handle.</span></label></div>
        <fieldset disabled={!isEditing} className="grid gap-5 sm:grid-cols-2 disabled:opacity-70"><Input label="First name" value={profile.firstName} onChange={(value) => update('firstName', value)} placeholder="Jordan" required /><Input label="Last name" value={profile.lastName} onChange={(value) => update('lastName', value)} placeholder="Lee" required /><Input label="Sport" value={profile.sport} onChange={(value) => update('sport', value)} placeholder="Basketball" /><label className="sm:col-span-2 block text-sm font-semibold text-slate-700"><span className="mb-2 block">Bio</span><textarea value={profile.bio} onChange={(event) => update('bio', event.target.value)} rows={4} className="input resize-y" placeholder="A short introduction, goals, and accomplishments." /></label><label className="sm:col-span-2 block text-sm font-semibold text-slate-700"><span className="mb-2 block">Hudl Highlight URL</span><input type="url" value={profile.hudl_highlight_url} onChange={(event) => update('hudl_highlight_url', event.target.value)} placeholder="https://www.hudl.com/video/..." className={`input ${hudlUrlError ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`} aria-invalid={Boolean(hudlUrlError)} aria-describedby="hudl-highlight-help hudl-highlight-error" />{hudlUrlError && <span id="hudl-highlight-error" className="mt-2 block text-xs font-normal text-rose-600">{hudlUrlError}</span>}<span id="hudl-highlight-help" className="mt-2 block text-xs font-normal text-slate-500">Paste your full Hudl video link here (e.g., https://www.hudl.com/video/...)</span></label><div className="sm:col-span-2"><h3 className="mb-3 text-sm font-semibold text-slate-700">Social links</h3><div className="grid gap-5 sm:grid-cols-2"><Input label="Instagram" value={profile.instagram_url} onChange={(value) => update('instagram_url', value)} placeholder="https://instagram.com/yourname" /><Input label="TikTok" value={profile.tiktok_url} onChange={(value) => update('tiktok_url', value)} placeholder="https://tiktok.com/@yourname" /><Input label="YouTube" value={profile.youtube_url} onChange={(value) => update('youtube_url', value)} placeholder="https://youtube.com/@yourname" /><Input label="X" value={profile.x_url} onChange={(value) => update('x_url', value)} placeholder="https://x.com/yourname" /></div><p className="mt-3 text-xs font-normal text-slate-500">Add full profile links; blank fields stay hidden on your public profile.</p></div></fieldset>
      </section>
      {profile.accountType === 'athlete' && <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-slate-950">Measurables</h2><p className="mt-1 text-sm text-slate-500">Add physical measurements that help tell your athletic story.</p></div><button type="button" disabled={!isEditing} onClick={() => update('measurables', [...profile.measurables, { id: crypto.randomUUID(), label: '', value: '' }])} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50">+ Add measurable</button></div>
        <fieldset disabled={!isEditing} className="space-y-3 disabled:opacity-70">{profile.measurables.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">No measurables yet. Add your first measurement.</div>}{profile.measurables.map((item) => <div key={item.id} className="grid gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto]"><input aria-label="Measurable name" className="input" value={item.label} onChange={(event) => updateMeasurable(item.id, 'label', event.target.value)} placeholder="Height" /><input aria-label="Measurable value" className="input" value={item.value} onChange={(event) => updateMeasurable(item.id, 'value', event.target.value)} placeholder="6 ft 2 in" /><button type="button" onClick={() => update('measurables', profile.measurables.filter((entry) => entry.id !== item.id))} className="rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50">Remove</button></div>)}</fieldset>
      </section>}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-slate-950">Performance stats</h2><p className="mt-1 text-sm text-slate-500">Add the metrics that best tell your story.</p></div><button type="button" disabled={!isEditing} onClick={() => update('stats', [...profile.stats, { id: crypto.randomUUID(), label: '', value: '' }])} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50">+ Add stat</button></div>
        <fieldset disabled={!isEditing} className="space-y-3 disabled:opacity-70">{profile.stats.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">No stats yet. Add your first performance metric.</div>}{profile.stats.map((stat) => <div key={stat.id} className="grid gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto]"><input aria-label="Stat name" className="input" value={stat.label} onChange={(event) => updateStat(stat.id, 'label', event.target.value)} placeholder="Points per game" /><input aria-label="Stat value" className="input" value={stat.value} onChange={(event) => updateStat(stat.id, 'value', event.target.value)} placeholder="18.4" /><button type="button" onClick={() => update('stats', profile.stats.filter((item) => item.id !== stat.id))} className="rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50">Remove</button></div>)}</fieldset>
      </section>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">{notice ? <p role="status" className={`text-sm font-medium ${notice.includes('successfully') ? 'text-emerald-600' : 'text-rose-600'}`}>{notice}</p> : <span />}{isEditing && <button disabled={saving || Boolean(hudlUrlError)} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button>}</div>
    </form>
  <UploadModal isOpen={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} onSave={saveAvatar} />
  </div></main>;
}

function Input({ label, value, onChange, placeholder, hint, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; hint?: string; required?: boolean }) {
  return <label className="block text-sm font-semibold text-slate-700"><span className="mb-2 block">{label}</span>{label === 'Sport' ? <select value={value} onChange={(event) => onChange(event.target.value)} className="input [&:disabled]:appearance-none" aria-label="Sport"><option value="">Select a sport</option>{collegiateSports.map((sport) => <option key={sport} value={sport}>{sport}</option>)}</select> : <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className="input" />}{hint && <span className="mt-2 block text-xs font-normal text-slate-500">{hint}</span>}</label>;
}
