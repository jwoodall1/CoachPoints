'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

type Institution = {
  id: string;
  name: string;
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
};

type FormState = {
  name: string;
  location: string;
  mascot: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  tagline: string;
  about: string;
  website_url: string;
  athletics_url: string;
  gpa_requirement: string;
  sat_min_score: string;
  act_min_score: string;
  admissions_requirements: string;
  admissions_url: string;
};

function toFormState(institution: Institution): FormState {
  return {
    name: institution.name,
    location: institution.location,
    mascot: institution.mascot ?? '',
    logo_url: institution.logo_url ?? '',
    primary_color: institution.primary_color,
    secondary_color: institution.secondary_color,
    tagline: institution.tagline ?? '',
    about: institution.about ?? '',
    website_url: institution.website_url ?? '',
    athletics_url: institution.athletics_url ?? '',
    gpa_requirement: institution.gpa_requirement ?? '',
    sat_min_score: institution.sat_min_score?.toString() ?? '',
    act_min_score: institution.act_min_score?.toString() ?? '',
    admissions_requirements: institution.admissions_requirements ?? '',
    admissions_url: institution.admissions_url ?? '',
  };
}

export default function InstitutionEditor({ institution }: { institution: Institution }) {
  const router = useRouter();
  const { ready, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(() => toFormState(institution));

  useEffect(() => {
    if (!ready || !user) {
      return;
    }

    let active = true;
    void supabase
      .from('institution_admins')
      .select('institution_id')
      .eq('institution_id', institution.id)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) {
          setAdminUserId(user.id);
          setIsAdmin(Boolean(data));
        }
      });

    return () => {
      active = false;
    };
  }, [institution.id, ready, user]);

  if (!user || adminUserId !== user.id || !isAdmin) return null;

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('institutions')
      .update({
        name: form.name.trim(),
        location: form.location.trim(),
        mascot: form.mascot.trim() || null,
        logo_url: form.logo_url.trim() || null,
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        tagline: form.tagline.trim() || null,
        about: form.about.trim() || null,
        website_url: form.website_url.trim() || null,
        athletics_url: form.athletics_url.trim() || null,
        gpa_requirement: form.gpa_requirement.trim() || null,
        sat_min_score: form.sat_min_score ? Number(form.sat_min_score) : null,
        act_min_score: form.act_min_score ? Number(form.act_min_score) : null,
        admissions_requirements: form.admissions_requirements.trim() || null,
        admissions_url: form.admissions_url.trim() || null,
        updated_by: user?.id ?? null,
      })
      .eq('id', institution.id);

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setOpen(false);
    setMessage('School information saved.');
    router.refresh();
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary">
        Edit school info
      </button>

      {message && <p className="mt-2 text-xs font-semibold text-emerald-700">{message}</p>}

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 sm:p-8">
          <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Institution admin</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Edit school info</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                Close
              </button>
            </div>
            <form onSubmit={save} className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <EditorInput label="School name" value={form.name} onChange={(v) => updateField('name', v)} required />
                <EditorInput label="Location" value={form.location} onChange={(v) => updateField('location', v)} required />
                <EditorInput label="Mascot" value={form.mascot} onChange={(v) => updateField('mascot', v)} />
                <EditorInput label="Logo URL" value={form.logo_url} onChange={(v) => updateField('logo_url', v)} type="url" />
                <EditorInput label="Primary color" value={form.primary_color} onChange={(v) => updateField('primary_color', v)} type="text" required />
                <EditorInput label="Secondary color" value={form.secondary_color} onChange={(v) => updateField('secondary_color', v)} type="text" required />
                <EditorInput label="GPA requirement" value={form.gpa_requirement} onChange={(v) => updateField('gpa_requirement', v)} />
                <EditorInput label="SAT minimum" value={form.sat_min_score} onChange={(v) => updateField('sat_min_score', v)} type="number" min="0" />
                <EditorInput label="ACT minimum" value={form.act_min_score} onChange={(v) => updateField('act_min_score', v)} type="number" min="0" />
                <EditorInput label="College website" value={form.website_url} onChange={(v) => updateField('website_url', v)} type="url" />
                <EditorInput label="Athletics website" value={form.athletics_url} onChange={(v) => updateField('athletics_url', v)} type="url" />
                <EditorInput label="Admissions URL" value={form.admissions_url} onChange={(v) => updateField('admissions_url', v)} type="url" />
              </div>
              <EditorTextArea label="Tagline" value={form.tagline} onChange={(v) => updateField('tagline', v)} />
              <EditorTextArea label="About the school" value={form.about} onChange={(v) => updateField('about', v)} rows={4} />
              <EditorTextArea label="Admissions requirements" value={form.admissions_requirements} onChange={(v) => updateField('admissions_requirements', v)} rows={4} />
              {message && <p className="text-sm font-semibold text-rose-700">{message}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function EditorInput({
  label,
  value,
  onChange,
  type = 'text',
  min,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">{label}</span>
      <input className="input" value={value} onChange={(event) => onChange(event.target.value)} type={type} min={min} required={required} />
    </label>
  );
}

function EditorTextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">{label}</span>
      <textarea className="input min-h-24 resize-y" rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
