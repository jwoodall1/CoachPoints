'use client';

import Link from 'next/link';
import { Building2, Eye, ImagePlus, Plus, Save, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/components/AuthProvider';
import UploadModal from '@/components/UploadModal';
import { supabase } from '@/lib/supabase';

type Sport = {
  id?: string;
  sport_name: string;
  gender: string;
  display_name: string;
  description: string;
  official_url: string;
};

type Institution = {
  id: string;
  name: string;
  slug: string;
  location: string;
  address_line1: string;
  city: string;
  state_code: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  mascot: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  tagline: string;
  about: string;
  website_url: string;
  athletics_url: string;
  gpa_requirement: string;
  sat_min_score: number | null;
  act_min_score: number | null;
  admissions_requirements: string;
  admissions_url: string;
  status: 'draft' | 'published' | 'archived';
  sports: Sport[];
};

type Account = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  account_type: string;
};

const emptyInstitution = (): Institution => ({
  id: '', name: '', slug: '', location: '', address_line1: '', city: '', state_code: '', postal_code: '', latitude: null, longitude: null, mascot: '', logo_url: null,
  primary_color: '#0f172a', secondary_color: '#e2e8f0', tagline: '', about: '',
  website_url: '', athletics_url: '', gpa_requirement: '', sat_min_score: null,
  act_min_score: null, admissions_requirements: '', admissions_url: '', status: 'draft', sports: [],
});

const emptySport = (): Sport => ({ sport_name: '', gender: 'coed', display_name: '', description: '', official_url: '' });

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function textValue(value: string | null | undefined) {
  return value ?? '';
}

async function withTimeout<T>(promise: PromiseLike<T>, label: string, milliseconds = 15000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<T>((_, reject) => { timer = setTimeout(() => reject(new Error(`${label} timed out. Please try again.`)), milliseconds); }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export default function InstitutionAdminPage() {
  const router = useRouter();
  const { ready, user } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selected, setSelected] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [admins, setAdmins] = useState<Array<{ user_id: string; email: string | null }>>([]);
  const [originalSportIds, setOriginalSportIds] = useState<string[]>([]);
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace('/login'); return; }
    let active = true;
    void supabase.rpc('is_super_admin').then(async ({ data: isSuperAdmin }) => {
      if (!active) return;
      if (!isSuperAdmin) { setAuthorized(false); setLoading(false); return; }
      setAuthorized(true);
      const [{ data, error }, { data: accountData, error: accountError }] = await Promise.all([supabase
        .from('institutions')
        .select('id, name, slug, location, address_line1, city, state_code, postal_code, latitude, longitude, mascot, logo_url, primary_color, secondary_color, tagline, about, website_url, athletics_url, gpa_requirement, sat_min_score, act_min_score, admissions_requirements, admissions_url, status, sports(id, sport_name, gender, display_name, description, official_url)')
        .order('name'), supabase.rpc('list_assignable_accounts')]);
      if (!active) return;
      if (error) setNotice(error.message);
      else setInstitutions((data ?? []) as unknown as Institution[]);
      if (accountError) setNotice(accountError.message);
      else setAccounts((accountData ?? []) as Account[]);
      setLoading(false);
    });
    return () => { active = false; };
  }, [ready, router, user]);

  const selectInstitution = async (institution: Institution) => {
    setSelected({ ...institution, sports: institution.sports ?? [] });
    setSelectedAdminId('');
    setOriginalSportIds((institution.sports ?? []).map((sport) => sport.id).filter(Boolean) as string[]);
    setNotice(null);
    const { data, error } = await supabase.rpc('list_institution_admins', { p_institution_id: institution.id });
    if (error) setNotice(error.message);
    else setAdmins(data ?? []);
  };

  const newInstitution = () => {
    setSelected(emptyInstitution());
    setOriginalSportIds([]);
    setAdmins([]);
    setSelectedAdminId('');
    setNotice(null);
  };

  const update = <K extends keyof Institution>(key: K, value: Institution[K]) =>
    setSelected((current) => current ? { ...current, [key]: value } : current);

  const save = async () => {
    if (!selected) return;
    if (!textValue(selected.name).trim() || !textValue(selected.location).trim()) return setNotice('Name and location are required.');
    setSaving(true); setNotice(null);
    try {
      const payload = {
        name: textValue(selected.name).trim(), slug: slugify(textValue(selected.slug) || textValue(selected.name)), location: textValue(selected.location).trim(),
        address_line1: textValue(selected.address_line1).trim() || null, city: textValue(selected.city).trim() || null,
        state_code: textValue(selected.state_code).trim().toUpperCase() || null, postal_code: textValue(selected.postal_code).trim() || null,
        latitude: selected.latitude, longitude: selected.longitude,
        mascot: textValue(selected.mascot).trim() || null, logo_url: selected.logo_url || null,
        primary_color: selected.primary_color, secondary_color: selected.secondary_color,
        tagline: textValue(selected.tagline).trim() || null, about: textValue(selected.about).trim() || null,
        website_url: textValue(selected.website_url).trim() || null, athletics_url: textValue(selected.athletics_url).trim() || null,
        gpa_requirement: textValue(selected.gpa_requirement).trim() || null,
        sat_min_score: selected.sat_min_score || null, act_min_score: selected.act_min_score || null,
        admissions_requirements: textValue(selected.admissions_requirements).trim() || null,
        admissions_url: textValue(selected.admissions_url).trim() || null, status: selected.status,
        published_at: selected.status === 'published' ? new Date().toISOString() : null,
        updated_by: user?.id ?? null,
      };
      const result = selected.id
        ? await withTimeout(supabase.from('institutions').update(payload).eq('id', selected.id).select().single(), 'Saving institution')
        : await withTimeout(supabase.from('institutions').insert({ ...payload, created_by: user?.id ?? null }).select().single(), 'Creating institution');
      if (result.error || !result.data) throw new Error(result.error?.message ?? 'Unable to save institution.');
      const saved = { ...selected, ...result.data, slug: payload.slug, sports: selected.sports } as Institution;
      const originalIds = new Set(originalSportIds);
      const currentIds = new Set(selected.sports.map((sport) => sport.id).filter(Boolean));
      for (const id of originalIds) if (!currentIds.has(id)) await withTimeout(supabase.from('sports').delete().eq('id', id), 'Removing sport');
      const sports = selected.sports.filter((sport) => textValue(sport.sport_name).trim() && textValue(sport.display_name).trim());
      if (sports.length) {
        const { error } = await withTimeout(supabase.from('sports').upsert(sports.map((sport) => ({
          ...(sport.id ? { id: sport.id } : {}), institution_id: result.data.id,
          sport_name: textValue(sport.sport_name).trim(), gender: sport.gender, display_name: textValue(sport.display_name).trim(),
          description: textValue(sport.description).trim() || null, official_url: textValue(sport.official_url).trim() || null,
        }))), 'Saving sports');
        if (error) throw new Error(error.message);
      }
      const { data: refreshed, error: refreshError } = await withTimeout(supabase.from('institutions').select('id, name, slug, location, address_line1, city, state_code, postal_code, latitude, longitude, mascot, logo_url, primary_color, secondary_color, tagline, about, website_url, athletics_url, gpa_requirement, sat_min_score, act_min_score, admissions_requirements, admissions_url, status, sports(id, sport_name, gender, display_name, description, official_url)').eq('id', result.data.id).single(), 'Refreshing institution');
      if (refreshError) throw new Error(refreshError.message);
      const next = (refreshed as unknown as Institution) ?? saved;
      setInstitutions((current) => current.some((item) => item.id === next.id) ? current.map((item) => item.id === next.id ? next : item) : [...current, next].sort((a, b) => a.name.localeCompare(b.name)));
      setSelected(next); setOriginalSportIds(next.sports.map((sport) => sport.id).filter(Boolean) as string[]); setNotice('Institution saved successfully.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to save institution.');
    } finally {
      setSaving(false);
    }
  };

  const addAdmin = async () => {
    if (!selected?.id || !selectedAdminId) return;
    const { error } = await supabase.rpc('assign_institution_admin_by_user', { p_institution_id: selected.id, p_user_id: selectedAdminId });
    if (error) return setNotice(error.message);
    setSelectedAdminId(''); await selectInstitution(selected); setNotice('Institution admin assigned.');
  };

  const removeAdmin = async (userId: string) => {
    if (!selected?.id) return;
    const { error } = await supabase.rpc('remove_institution_admin', { p_institution_id: selected.id, p_user_id: userId });
    if (error) setNotice(error.message); else await selectInstitution(selected);
  };

  const saveLogo = async (image: string) => {
    if (!selected?.id || !user) return;
    const blob = await (await fetch(image)).blob();
    const path = `institutions/${selected.id}/logo.png`;
    const { error } = await supabase.storage.from('avatars').upload(path, blob, { contentType: 'image/png', upsert: true });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const logoUrl = `${data.publicUrl}?v=${Date.now()}`;
    update('logo_url', logoUrl);
    const { error: updateError } = await supabase.from('institutions').update({ logo_url: logoUrl, updated_by: user.id }).eq('id', selected.id);
    if (updateError) throw new Error(updateError.message);
    setInstitutions((current) => current.map((item) => item.id === selected.id ? { ...item, logo_url: logoUrl } : item));
    setNotice('Logo uploaded.');
  };

  if (loading) return <main className="loading-shell">Loading institution manager…</main>;
  if (authorized === false) return <main className="loading-shell"><div className="text-center"><Building2 className="mx-auto size-10 text-slate-400" /><h1 className="mt-4 text-2xl font-black text-slate-950">Admin access required</h1><Link href="/" className="btn-primary mt-6">Back to discover</Link></div></main>;

  return (
    <main className="min-h-screen pb-20 pt-8 sm:pt-10">
      <div className="page-shell max-w-7xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow">Super admin</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Institution manager</h1><p className="mt-2 text-sm text-slate-500">Create, publish, and maintain institution profiles.</p></div>
          <button type="button" onClick={newInstitution} className="btn-primary"><Plus className="size-4" /> Create institution</button>
        </header>
        {notice && <p className="mt-5 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">{notice}</p>}
        <div className="mt-8 grid gap-6 lg:grid-cols-[18rem_1fr]">
          <aside className="surface-card p-3"><p className="px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">Institutions ({institutions.length})</p>{institutions.map((item) => <button key={item.id} type="button" onClick={() => selectInstitution(item)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${selected?.id === item.id ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'}`}><span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: item.primary_color }}>{item.logo_url ? <img src={item.logo_url} alt="" className="size-8 rounded-lg object-contain" /> : <Building2 className="size-4 text-white" />}</span><span className="min-w-0"><span className="block truncate text-sm font-black">{item.name}</span><span className={`block text-xs ${selected?.id === item.id ? 'text-slate-300' : 'text-slate-500'}`}>{item.status}</span></span></button>)}</aside>
          {selected ? <Editor institution={selected} update={update} save={save} saving={saving} addSport={() => update('sports', [...selected.sports, emptySport()])} removeSport={(index) => update('sports', selected.sports.filter((_, current) => current !== index))} onUpload={() => setLogoModalOpen(true)} admins={admins} accounts={accounts} selectedAdminId={selectedAdminId} setSelectedAdminId={setSelectedAdminId} addAdmin={addAdmin} removeAdmin={removeAdmin} /> : <div className="surface-card grid min-h-96 place-items-center p-8 text-center"><div><Building2 className="mx-auto size-10 text-slate-300" /><p className="mt-4 font-bold text-slate-600">Select an institution or create a new one.</p></div></div>}
        </div>
      </div>
      <UploadModal isOpen={logoModalOpen} onClose={() => setLogoModalOpen(false)} onSave={saveLogo} />
    </main>
  );
}

type EditorProps = {
  institution: Institution;
  update: <K extends keyof Institution>(key: K, value: Institution[K]) => void;
  save: () => void;
  saving: boolean;
  addSport: () => void;
  removeSport: (index: number) => void;
  onUpload: () => void;
  admins: Array<{ user_id: string; email: string | null }>;
  accounts: Account[];
  selectedAdminId: string;
  setSelectedAdminId: (value: string) => void;
  addAdmin: () => void;
  removeAdmin: (userId: string) => void;
};

function Editor({ institution, update, save, saving, addSport, removeSport, onUpload, admins, accounts, selectedAdminId, setSelectedAdminId, addAdmin, removeAdmin }: EditorProps) {
  return <section className="surface-card p-6 sm:p-8"><div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow">Institution details</p><h2 className="mt-2 text-2xl font-black text-slate-950">{institution.name || 'New institution'}</h2></div><div className="flex flex-wrap gap-2"><Link href={institution.slug ? `/institutions/${institution.slug}` : '#'} className={`btn-secondary ${institution.slug ? '' : 'pointer-events-none opacity-50'}`}><Eye className="size-4" /> Preview</Link><button type="button" onClick={save} disabled={saving} className="btn-primary"><Save className="size-4" /> {saving ? 'Saving…' : 'Save institution'}</button></div></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="School name" value={institution.name} required onChange={(v: string) => update('name', v)} /><Field label="Slug" value={institution.slug} hint="Leave blank to generate from the school name." onChange={(v: string) => update('slug', v)} /><Field label="Location" value={institution.location} required onChange={(v: string) => update('location', v)} /><Field label="Mascot" value={institution.mascot} onChange={(v: string) => update('mascot', v)} /><Field label="Logo URL" value={institution.logo_url ?? ''} type="url" onChange={(v: string) => update('logo_url', v || null)} /><div><span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Logo upload</span><button type="button" onClick={onUpload} disabled={!institution.id} className="btn-secondary"><ImagePlus className="size-4" /> Upload image</button>{!institution.id && <p className="mt-2 text-xs text-slate-500">Save the institution first.</p>}</div><Field label="Primary color" value={institution.primary_color} onChange={(v: string) => update('primary_color', v)} /><Field label="Secondary color" value={institution.secondary_color} onChange={(v: string) => update('secondary_color', v)} /><Field label="GPA requirement" value={institution.gpa_requirement} onChange={(v: string) => update('gpa_requirement', v)} /><Field label="SAT minimum" value={institution.sat_min_score?.toString() ?? ''} type="number" onChange={(v: string) => update('sat_min_score', v ? Number(v) : null)} /><Field label="ACT minimum" value={institution.act_min_score?.toString() ?? ''} type="number" onChange={(v: string) => update('act_min_score', v ? Number(v) : null)} /><Field label="Admissions URL" value={institution.admissions_url} type="url" onChange={(v: string) => update('admissions_url', v)} /><Field label="College website" value={institution.website_url} type="url" onChange={(v: string) => update('website_url', v)} /><Field label="Athletics website" value={institution.athletics_url} type="url" onChange={(v: string) => update('athletics_url', v)} /></div>
    <div className="mt-6 rounded-2xl border border-slate-200 p-4"><p className="eyebrow">Structured location</p><p className="mt-1 text-sm text-slate-500">These fields support state filtering and future distance searches.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Street address" value={institution.address_line1} onChange={(v: string) => update('address_line1', v)} /><Field label="City" value={institution.city} onChange={(v: string) => update('city', v)} /><Field label="State code" value={institution.state_code} hint="Two-letter code, such as MN." onChange={(v: string) => update('state_code', v.toUpperCase())} /><Field label="Postal code" value={institution.postal_code} onChange={(v: string) => update('postal_code', v)} /><Field label="Latitude" value={institution.latitude?.toString() ?? ''} type="number" onChange={(v: string) => update('latitude', v ? Number(v) : null)} /><Field label="Longitude" value={institution.longitude?.toString() ?? ''} type="number" onChange={(v: string) => update('longitude', v ? Number(v) : null)} /></div></div>
    <TextArea label="Tagline" value={institution.tagline} onChange={(v: string) => update('tagline', v)} /><TextArea label="About" value={institution.about} onChange={(v: string) => update('about', v)} /><TextArea label="Admissions requirements" value={institution.admissions_requirements} onChange={(v: string) => update('admissions_requirements', v)} />
    <div className="mt-6 flex items-center gap-3"><label className="text-sm font-bold text-slate-700">Status<select className="input mt-2" value={institution.status} onChange={(e) => update('status', e.target.value as Institution['status'])}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label></div>
    <div className="mt-8 border-t border-slate-100 pt-6"><div className="flex items-center justify-between"><div><p className="eyebrow">Athletic programs</p><h3 className="mt-1 text-xl font-black text-slate-950">Sports</h3></div><button type="button" onClick={addSport} className="btn-secondary"><Plus className="size-4" /> Add sport</button></div><div className="mt-4 space-y-3">{institution.sports.map((sport: Sport, index: number) => <div key={sport.id ?? index} className="rounded-2xl border border-slate-200 p-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="Sport name" value={sport.sport_name} onChange={(v: string) => update('sports', institution.sports.map((s: Sport, i: number) => i === index ? { ...s, sport_name: v } : s))} /><Field label="Display name" value={sport.display_name} onChange={(v: string) => update('sports', institution.sports.map((s: Sport, i: number) => i === index ? { ...s, display_name: v } : s))} /><label className="block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Gender</span><select className="input" value={sport.gender} onChange={(e) => update('sports', institution.sports.map((s: Sport, i: number) => i === index ? { ...s, gender: e.target.value } : s))}><option value="men">Men</option><option value="women">Women</option><option value="coed">Coed</option></select></label><Field label="Official URL" value={sport.official_url} type="url" onChange={(v: string) => update('sports', institution.sports.map((s: Sport, i: number) => i === index ? { ...s, official_url: v } : s))} /></div><TextArea label="Description" value={sport.description} onChange={(v: string) => update('sports', institution.sports.map((s: Sport, i: number) => i === index ? { ...s, description: v } : s))} /><button type="button" onClick={() => removeSport(index)} className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-rose-600"><Trash2 className="size-4" /> Remove sport</button></div>)}</div></div>
    {institution.id && <div className="mt-8 border-t border-slate-100 pt-6"><p className="eyebrow">Access</p><h3 className="mt-1 text-xl font-black text-slate-950">Institution admins</h3><div className="mt-4 flex gap-2"><select className="input" value={selectedAdminId} onChange={(e) => setSelectedAdminId(e.target.value)}><option value="">Select an account</option>{accounts.filter((account) => !admins.some((admin) => admin.user_id === account.user_id)).map((account) => <option key={account.user_id} value={account.user_id}>{account.display_name ?? account.email ?? account.user_id} · {account.account_type}</option>)}</select><button type="button" onClick={addAdmin} disabled={!selectedAdminId} className="btn-secondary">Assign</button></div><div className="mt-3 space-y-2">{admins.map((admin: { user_id: string; email: string | null }) => <div key={admin.user_id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"><span>{admin.email ?? admin.user_id}</span><button type="button" onClick={() => removeAdmin(admin.user_id)} className="text-rose-600" aria-label="Remove admin"><X className="size-4" /></button></div>)}</div></div>}
  </section>;
}

type FieldProps = { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; hint?: string };
function Field({ label, value, onChange, type = 'text', required = false, hint }: FieldProps) { return <label className="block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">{label}</span><input className="input" value={value} onChange={(e) => onChange(e.target.value)} type={type} required={required} />{hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}</label>; }
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="mt-4 block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">{label}</span><textarea className="input min-h-24 resize-y" rows={3} value={value} onChange={(e) => onChange(e.target.value)} /></label>; }
