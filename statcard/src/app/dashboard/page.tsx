'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowUpRight, Camera, LogOut, Pencil, Save, Trophy } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/AuthProvider';
import ProfileAvatar from '@/components/ProfileAvatar';
import { supabase } from '@/lib/supabase';
import { collegiateSports, getPositions } from '@/lib/sports';
import { trackEvent } from '@/lib/analytics';

// The image cropper and its canvas logic are downloaded only after this route needs them.
const UploadModal = dynamic(() => import('@/components/UploadModal'));

type Stat = { id: string; label: string; value: string };
type AccountType = 'athlete' | 'coach';
type Profile = { firstName: string; lastName: string; username: string; accountType: AccountType; height: string; weight: string; graduatingClass: string; highSchool: string; gpa: string; sport: string; position: string; bio: string; hudl_highlight_url: string; phone_number: string; contact_email: string; instagram_url: string; tiktok_url: string; youtube_url: string; x_url: string; stats: Stat[]; measurables: Stat[] };
const emptyProfile: Profile = { firstName: '', lastName: '', username: '', accountType: 'athlete', height: '', weight: '', graduatingClass: '', highSchool: '', gpa: '', sport: '', position: '', bio: '', hudl_highlight_url: '', phone_number: '', contact_email: '', instagram_url: '', tiktok_url: '', youtube_url: '', x_url: '', stats: [], measurables: [] };

// Accept only Hudl player URLs that the public profile knows how to embed.
const isValidHudlUrl = (value: string) => {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) && url.hostname === 'www.hudl.com' && (url.pathname.includes('/video/') || url.pathname.includes('/v/') || url.pathname.includes('/embed/'));
  } catch {
    return false;
  }
};

// Convert Supabase JSON objects into editable rows with stable React keys.
const asStats = (stats: unknown): Stat[] => stats && typeof stats === 'object' && !Array.isArray(stats)
  ? Object.entries(stats as Record<string, unknown>).map(([label, value]) => ({ id: crypto.randomUUID(), label, value: String(value) })) : [];

/** Loads, edits, and saves the signed-in athlete's complete public profile. */
export default function DashboardPage() {
  const router = useRouter();
  const { ready, user } = useAuth();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [savedProfile, setSavedProfile] = useState<Profile>(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const hudlUrlError = useMemo(() => profile.hudl_highlight_url.trim() && !isValidHudlUrl(profile.hudl_highlight_url)
    ? 'Enter a valid Hudl video link, such as http://www.hudl.com/v/2JrhL4 or https://www.hudl.com/video/....'
    : null, [profile.hudl_highlight_url]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.user_metadata.account_type === 'coach') {
      router.replace('/coach-dashboard');
      return;
    }
    let active = true;

    // Profile data is loaded after the shared auth provider resolves the current user.
    const load = async () => {
      const accountType: AccountType = user.user_metadata.account_type === 'coach' ? 'coach' : 'athlete';
      let data: { first_name?: string | null; last_name?: string | null; username?: string | null; height?: string | null; weight?: string | null; graduating_class?: string | null; high_school?: string | null; gpa?: string | null; sport?: string | null; position?: string | null; bio?: string | null; avatar_url?: string | null; hudl_highlight_url?: string | null; phone_number?: string | null; contact_email?: string | null; instagram_url?: string | null; tiktok_url?: string | null; youtube_url?: string | null; x_url?: string | null; stats?: unknown; measurables?: unknown } | null = null;
      if (accountType === 'coach') {
        const result = await supabase.from('coachprofiles').select('first_name, last_name, username, sport, bio, avatar_url, instagram_url, tiktok_url, youtube_url, x_url').eq('id', user.id).maybeSingle();
        data = result.data;
      } else {
        const result = await supabase.from('profiles').select('first_name, last_name, username, height, weight, graduating_class, high_school, gpa, sport, position, bio, avatar_url, hudl_highlight_url, phone_number, contact_email, instagram_url, tiktok_url, youtube_url, x_url, stats, measurables').eq('id', user.id).maybeSingle();
        data = result.data;
      }
      if (!active) return;
      const loaded: Profile = { firstName: data?.first_name ?? user.user_metadata.first_name ?? '', lastName: data?.last_name ?? user.user_metadata.last_name ?? '', username: data?.username ?? user.user_metadata.username ?? '', accountType, height: data?.height ?? '', weight: data?.weight ?? '', graduatingClass: data?.graduating_class ?? '', highSchool: data?.high_school ?? '', gpa: data?.gpa ?? '', sport: data?.sport ?? '', position: data?.position ?? '', bio: data?.bio ?? '', hudl_highlight_url: data?.hudl_highlight_url ?? '', phone_number: data?.phone_number ?? '', contact_email: data?.contact_email ?? user.email ?? '', instagram_url: data?.instagram_url ?? '', tiktok_url: data?.tiktok_url ?? '', youtube_url: data?.youtube_url ?? '', x_url: data?.x_url ?? '', stats: asStats(data?.stats), measurables: asStats(data?.measurables) };
      setProfile(loaded);
      setSavedProfile(loaded);
      const avatarPath = loaded.username ? `${loaded.username}/profile.png` : '';
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(avatarPath);
      setAvatarUrl(data?.avatar_url ?? (avatarPath ? publicUrl : null));
      setSavedAvatarUrl(data?.avatar_url ?? (avatarPath ? publicUrl : null));
      setLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, [ready, router, user]);

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => setProfile((current) => key === 'sport' ? { ...current, sport: value as string, position: '' } : { ...current, [key]: value });
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
    trackEvent('profile_photo_saved', { account_type: profile.accountType });
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
      : (await supabase.from('profiles').upsert({ id: user.id, first_name: profile.firstName.trim(), last_name: profile.lastName.trim(), username, height: profile.height.trim() || null, weight: profile.weight.trim() || null, graduating_class: profile.graduatingClass.trim() || null, high_school: profile.highSchool.trim() || null, gpa: profile.gpa.trim() || null, sport: profile.sport.trim(), position: getPositions(profile.sport).includes(profile.position) ? profile.position : null, bio: profile.bio.trim(), hudl_highlight_url: profile.hudl_highlight_url.trim() || null, phone_number: profile.phone_number.trim() || null, contact_email: profile.contact_email.trim() || null, instagram_url: profile.instagram_url.trim() || null, tiktok_url: profile.tiktok_url.trim() || null, youtube_url: profile.youtube_url.trim() || null, x_url: profile.x_url.trim() || null, stats, measurables: Object.fromEntries(profile.measurables.filter(({ label }) => label.trim()).map(({ label, value }) => [label.trim(), value.trim()])) }, { onConflict: 'id' })).error;
    if (error) setNotice(error.message);
    else {
      const saved = { ...profile, username };
      setProfile(saved); setSavedProfile(saved); setSavedAvatarUrl(avatarUrl); setIsEditing(false);
      trackEvent('profile_saved', { account_type: profile.accountType, stats_count: Object.keys(stats).length, measurables_count: profile.measurables.filter(({ label }) => label.trim()).length });
      setNotice('Profile saved successfully.');
    }
    setSaving(false);
  };

  if (loading) return <main className="loading-shell">Loading your dashboard…</main>;

  return <main className="min-h-screen pb-20 pt-8 sm:pt-10"><div className="page-shell max-w-5xl">
    <header className="athletic-grid relative mb-8 overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-300/50 sm:px-8 sm:py-10"><div className="absolute -right-16 -top-24 size-72 rounded-full bg-brand-600/25 blur-3xl" /><div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><div className="hidden size-12 shrink-0 place-items-center rounded-2xl bg-brand-500/15 text-brand-200 sm:grid"><Trophy className="size-5" /></div><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-300">Athlete workspace</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Build your CoachPoints profile</h1><p className="mt-2 text-sm font-medium text-slate-400">{user?.email}</p></div></div><div className="flex flex-wrap gap-2">{profile.username && <Link href={`/${profile.username}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10">View profile <ArrowUpRight className="size-4" /></Link>}<button type="button" onClick={async () => { await supabase.auth.signOut(); router.replace('/login'); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10 hover:text-white"><LogOut className="size-4" />Sign out</button></div></div>
    </header>
    <form onSubmit={saveProfile} className="space-y-6">
      <section className="surface-card p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow">Public identity</p><h2 className="section-title mt-2">Personal information</h2><p className="mt-1 text-sm text-slate-500">This is what visitors see on your public profile.</p></div>{isEditing ? <button type="button" onClick={stopEditing} className="btn-secondary">Stop editing</button> : <button type="button" onClick={() => { setIsEditing(true); setNotice(null); }} className="btn-dark"><Pencil className="size-4" />Edit profile</button>}</div>
        <div className="mb-7 flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">{avatarUrl ? <ProfileAvatar src={avatarUrl} name={profile.firstName || 'Profile'} size="small" /> : <div className="grid size-20 place-items-center rounded-full bg-slate-100 text-xl font-bold text-slate-400">{profile.firstName.slice(0, 1).toUpperCase()}</div>}<div><p className="text-sm font-bold text-slate-800">Profile photo</p><p className="mt-1 text-sm text-slate-500">Use a clear, square portrait for the strongest presentation.</p>{isEditing && <button type="button" onClick={() => setIsPhotoModalOpen(true)} className="mt-2 inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-700 hover:text-brand-800"><Camera className="size-4" />{avatarUrl ? 'Change photo' : 'Upload photo'}</button>}</div></div>
        <div className="mb-5 sm:max-w-sm"><label className="block text-sm font-semibold text-slate-700"><span className="mb-2 block">Public handle</span><input value={profile.username} readOnly aria-readonly="true" className="input cursor-not-allowed bg-slate-100 text-slate-500" /><span className="mt-2 block text-xs font-normal text-slate-500">Your permanent profile handle.</span></label></div>
        <fieldset disabled={!isEditing} className="grid gap-5 sm:grid-cols-2 disabled:opacity-70"><Input label="First name" value={profile.firstName} onChange={(value) => update('firstName', value)} placeholder="Joe" required /><Input label="Last name" value={profile.lastName} onChange={(value) => update('lastName', value)} placeholder="Random" required /><Input label="Height" value={profile.height} onChange={(value) => update('height', value)} placeholder="6 ft 2 in" /><Input label="Weight" value={profile.weight} onChange={(value) => update('weight', value)} placeholder="185 lbs" /><Input label="Graduating class" value={profile.graduatingClass} onChange={(value) => update('graduatingClass', value)} placeholder="2027" /><Input label="Sport" value={profile.sport} onChange={(value) => update('sport', value)} placeholder="Basketball" /><label className="sm:col-span-2 block text-sm font-semibold text-slate-700"><span className="mb-2 block">Bio</span><textarea value={profile.bio} onChange={(event) => update('bio', event.target.value)} rows={4} className="input resize-y" placeholder="A short introduction, goals, and accomplishments." /></label><label className="sm:col-span-2 block text-sm font-semibold text-slate-700"><span className="mb-2 block">Hudl Highlight URL</span><input type="url" value={profile.hudl_highlight_url} onChange={(event) => update('hudl_highlight_url', event.target.value)} placeholder="https://www.hudl.com/video/..." className={`input ${hudlUrlError ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`} aria-invalid={Boolean(hudlUrlError)} aria-describedby="hudl-highlight-help hudl-highlight-error" />{hudlUrlError && <span id="hudl-highlight-error" className="mt-2 block text-xs font-normal text-rose-600">{hudlUrlError}</span>}<span id="hudl-highlight-help" className="mt-2 block text-xs font-normal text-slate-500">Paste your full Hudl video link here (e.g., https://www.hudl.com/video/...)</span></label><div className="sm:col-span-2"><h3 className="mb-3 text-sm font-semibold text-slate-700">Social links</h3><div className="grid gap-5 sm:grid-cols-2"><Input label="Instagram" value={profile.instagram_url} onChange={(value) => update('instagram_url', value)} placeholder="https://instagram.com/yourname" /><Input label="TikTok" value={profile.tiktok_url} onChange={(value) => update('tiktok_url', value)} placeholder="https://tiktok.com/@yourname" /><Input label="YouTube" value={profile.youtube_url} onChange={(value) => update('youtube_url', value)} placeholder="https://youtube.com/@yourname" /><Input label="X" value={profile.x_url} onChange={(value) => update('x_url', value)} placeholder="https://x.com/yourname" /></div><p className="mt-3 block text-xs font-normal text-slate-500">Add full profile links; blank fields stay hidden on your public profile.</p></div></fieldset>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6"><h2 className="text-xl font-bold text-slate-950">Contact information</h2><p className="mt-1 text-sm text-slate-500">These details appear prominently on your public profile.</p></div>
        <fieldset disabled={!isEditing} className="grid gap-5 sm:grid-cols-2 disabled:opacity-70"><Input label="Phone number" value={profile.phone_number} onChange={(value) => update('phone_number', value)} placeholder="(555) 123-4567" type="tel" /><Input label="Contact email" value={profile.contact_email} onChange={(value) => update('contact_email', value)} placeholder="you@example.com" type="email" /></fieldset>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="mb-6"><h2 className="text-xl font-bold text-slate-950">Position</h2><p className="mt-1 text-sm text-slate-500">Choose a position curated for your selected sport.</p></div><fieldset disabled={!isEditing || !profile.sport} className="max-w-sm disabled:opacity-70"><label className="block text-sm font-semibold text-slate-700"><span className="mb-2 block">Position</span><select value={profile.position} onChange={(event) => update('position', event.target.value)} className="input"><option value="">{profile.sport ? 'Select a position' : 'Select a sport first'}</option>{getPositions(profile.sport).map((position) => <option key={position} value={position}>{position}</option>)}</select></label></fieldset></section>
      {profile.accountType === 'athlete' && <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="mb-6"><h2 className="text-xl font-bold text-slate-950">Education</h2><p className="mt-1 text-sm text-slate-500">Add the school you represent.</p></div><fieldset disabled={!isEditing} className="max-w-sm disabled:opacity-70"><Input label="High school" value={profile.highSchool} onChange={(value) => update('highSchool', value)} placeholder="Lincoln High School" /></fieldset></section>}
      {profile.accountType === 'athlete' && <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="mb-6"><h2 className="text-xl font-bold text-slate-950">Academic information</h2><p className="mt-1 text-sm text-slate-500">Share your GPA alongside your athletic profile.</p></div><fieldset disabled={!isEditing} className="max-w-sm disabled:opacity-70"><Input label="GPA" value={profile.gpa} onChange={(value) => update('gpa', value)} placeholder="3.8" inputMode="decimal" /></fieldset></section>}
      {profile.accountType === 'athlete' && <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-slate-950">Measurables</h2><p className="mt-1 text-sm text-slate-500">Add physical measurements that help tell your athletic story.</p></div><button type="button" disabled={!isEditing} onClick={() => update('measurables', [...profile.measurables, { id: crypto.randomUUID(), label: '', value: '' }])} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50">+ Add measurable</button></div>
        <fieldset disabled={!isEditing} className="space-y-3 disabled:opacity-70">{profile.measurables.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">No measurables yet. Add your first measurement.</div>}{profile.measurables.map((item) => <div key={item.id} className="grid gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto]"><input aria-label="Measurable name" className="input" value={item.label} onChange={(event) => updateMeasurable(item.id, 'label', event.target.value)} placeholder="Bench max" /><input aria-label="Measurable value" className="input" value={item.value} onChange={(event) => updateMeasurable(item.id, 'value', event.target.value)} placeholder="315 lbs" /><button type="button" onClick={() => update('measurables', profile.measurables.filter((entry) => entry.id !== item.id))} className="rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50">Remove</button></div>)}</fieldset>
      </section>}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-slate-950">Performance stats</h2><p className="mt-1 text-sm text-slate-500">Add the metrics that best tell your story.</p></div><button type="button" disabled={!isEditing} onClick={() => update('stats', [...profile.stats, { id: crypto.randomUUID(), label: '', value: '' }])} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50">+ Add stat</button></div>
        <fieldset disabled={!isEditing} className="space-y-3 disabled:opacity-70">{profile.stats.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">No stats yet. Add your first performance metric.</div>}{profile.stats.map((stat) => <div key={stat.id} className="grid gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto]"><input aria-label="Stat name" className="input" value={stat.label} onChange={(event) => updateStat(stat.id, 'label', event.target.value)} placeholder="Points per game" /><input aria-label="Stat value" className="input" value={stat.value} onChange={(event) => updateStat(stat.id, 'value', event.target.value)} placeholder="18.4" /><button type="button" onClick={() => update('stats', profile.stats.filter((item) => item.id !== stat.id))} className="rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50">Remove</button></div>)}</fieldset>
      </section>
      <div className={`flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between ${isEditing ? 'sticky bottom-4 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur' : ''}`}>{notice ? <p role="status" className={`text-sm font-bold ${notice.includes('successfully') ? 'text-emerald-600' : 'text-rose-600'}`}>{notice}</p> : <span />}{isEditing && <button disabled={saving || Boolean(hudlUrlError)} className="btn-primary"><Save className="size-4" />{saving ? 'Saving changes…' : 'Save all changes'}</button>}</div>
    </form>
  <UploadModal isOpen={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} onSave={saveAvatar} />
  </div></main>;
}

/** Renders a standard dashboard input or the curated sport selector. */
function Input({ label, value, onChange, placeholder, hint, required = false, type = 'text', inputMode }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; hint?: string; required?: boolean; type?: string; inputMode?: 'decimal' | 'email' | 'tel' | 'text' }) {
  return <label className="block text-sm font-semibold text-slate-700"><span className="mb-2 block">{label}</span>{label === 'Sport' ? <select value={value} onChange={(event) => onChange(event.target.value)} className="input [&:disabled]:appearance-none" aria-label="Sport"><option value="">Select a sport</option>{collegiateSports.map((sport) => <option key={sport} value={sport}>{sport}</option>)}</select> : <input type={type} inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className="input" />}{hint && <span className="mt-2 block text-xs font-normal text-slate-500">{hint}</span>}</label>;
}
