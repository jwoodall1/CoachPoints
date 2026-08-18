'use client';

import { FormEvent, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase';

type CoachProfile = { firstName: string; lastName: string; username: string; collegeUniversity: string; sport: string; bio: string; phoneNumber: string; contactEmail: string; instagramUrl: string; tiktokUrl: string; youtubeUrl: string; xUrl: string };
const emptyProfile: CoachProfile = { firstName: '', lastName: '', username: '', collegeUniversity: '', sport: '', bio: '', phoneNumber: '', contactEmail: '', instagramUrl: '', tiktokUrl: '', youtubeUrl: '', xUrl: '' };

export default function CoachDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CoachProfile>(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace('/login?role=coach');
      if (session.user.user_metadata.account_type !== 'coach') return router.replace('/dashboard');
      setUser(session.user);
      const { data } = await supabase.from('coachprofiles').select('first_name, last_name, username, college_university, sport, bio, phone_number, contact_email, instagram_url, tiktok_url, youtube_url, x_url').eq('id', session.user.id).maybeSingle();
      setProfile({ firstName: data?.first_name ?? session.user.user_metadata.first_name ?? '', lastName: data?.last_name ?? session.user.user_metadata.last_name ?? '', username: data?.username ?? session.user.user_metadata.username ?? '', collegeUniversity: data?.college_university ?? '', sport: data?.sport ?? '', bio: data?.bio ?? '', phoneNumber: data?.phone_number ?? '', contactEmail: data?.contact_email ?? session.user.email ?? '', instagramUrl: data?.instagram_url ?? '', tiktokUrl: data?.tiktok_url ?? '', youtubeUrl: data?.youtube_url ?? '', xUrl: data?.x_url ?? '' });
      setLoading(false);
    };
    load();
  }, [router]);

  const update = <K extends keyof CoachProfile>(key: K, value: CoachProfile[K]) => setProfile((current) => ({ ...current, [key]: value }));
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !editing) return;
    setSaving(true); setNotice(null);
    const { error } = await supabase.from('coachprofiles').upsert({ id: user.id, first_name: profile.firstName.trim(), last_name: profile.lastName.trim(), username: profile.username.trim().toLowerCase(), college_university: profile.collegeUniversity.trim() || null, sport: profile.sport.trim(), bio: profile.bio.trim(), phone_number: profile.phoneNumber.trim() || null, contact_email: profile.contactEmail.trim() || null, instagram_url: profile.instagramUrl.trim() || null, tiktok_url: profile.tiktokUrl.trim() || null, youtube_url: profile.youtubeUrl.trim() || null, x_url: profile.xUrl.trim() || null }, { onConflict: 'id' });
    if (error) setNotice(error.message); else { setProfile((current) => ({ ...current, username: current.username.trim().toLowerCase() })); setEditing(false); setNotice('Coach profile saved successfully.'); }
    setSaving(false);
  };

  if (loading) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-medium text-slate-500">Loading your coach dashboard…</main>;
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-12"><div className="mx-auto max-w-5xl">
    <header className="mb-8 flex flex-col gap-5 rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-200 sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><p className="text-sm font-medium text-emerald-300">Coach dashboard</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Build your coach profile</h1><p className="mt-2 text-sm text-slate-300">{user?.email}</p></div><button type="button" onClick={async () => { await supabase.auth.signOut(); router.replace('/login?role=coach'); }} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Sign out</button></header>
    <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-xl font-bold text-slate-950">Coach information</h2><p className="mt-1 text-sm text-slate-500">Share the information athletes need to know about you.</p></div>{editing && <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>}</div>
      <div className="grid gap-5 sm:grid-cols-2"><Field label="First name" value={profile.firstName} onChange={(value) => update('firstName', value)} placeholder="Jordan" disabled={!editing} required /><Field label="Last name" value={profile.lastName} onChange={(value) => update('lastName', value)} placeholder="Lee" disabled={!editing} required /><Field label="College / university" value={profile.collegeUniversity} onChange={(value) => update('collegeUniversity', value)} placeholder="State University" disabled={!editing} /><Field label="Sport or program" value={profile.sport} onChange={(value) => update('sport', value)} placeholder="Basketball" disabled={!editing} /><label className="sm:col-span-2 block text-sm font-semibold text-slate-700"><span className="mb-2 block">Bio</span><textarea value={profile.bio} onChange={(event) => update('bio', event.target.value)} rows={5} className="input resize-y disabled:cursor-not-allowed disabled:bg-slate-100" placeholder="Your coaching experience, philosophy, and specialties." disabled={!editing} /></label><Field label="Phone number" value={profile.phoneNumber} onChange={(value) => update('phoneNumber', value)} placeholder="(555) 123-4567" disabled={!editing} /><Field label="Contact email" value={profile.contactEmail} onChange={(value) => update('contactEmail', value)} placeholder="you@example.com" disabled={!editing} /><Field label="Instagram URL" value={profile.instagramUrl} onChange={(value) => update('instagramUrl', value)} placeholder="https://instagram.com/yourname" disabled={!editing} /><Field label="TikTok URL" value={profile.tiktokUrl} onChange={(value) => update('tiktokUrl', value)} placeholder="https://tiktok.com/@yourname" disabled={!editing} /><Field label="YouTube URL" value={profile.youtubeUrl} onChange={(value) => update('youtubeUrl', value)} placeholder="https://youtube.com/@yourname" disabled={!editing} /><Field label="X URL" value={profile.xUrl} onChange={(value) => update('xUrl', value)} placeholder="https://x.com/yourname" disabled={!editing} /></div>
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">{notice ? <p role="status" className={`text-sm font-medium ${notice.includes('successfully') ? 'text-emerald-600' : 'text-rose-600'}`}>{notice}</p> : <span />}{editing ? <button type="submit" disabled={saving} className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-60">{saving ? 'Saving…' : 'Save coach profile'}</button> : <button type="button" onClick={(event) => { event.preventDefault(); setNotice(null); setEditing(true); }} className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">Edit profile</button>}</div>
    </form>
  </div></main>;
}

function Field({ label, value, onChange, placeholder, disabled, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; disabled: boolean; required?: boolean }) {
  return <label className="block text-sm font-semibold text-slate-700"><span className="mb-2 block">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} disabled={disabled} className="input disabled:cursor-not-allowed disabled:bg-slate-100" /></label>;
}
