'use client';

import Link from 'next/link';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

export default function SaveSchoolButton({ institutionId }: { institutionId: string }) {
  const { ready, user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    let active = true;
    void supabase.from('athlete_saved_institutions').select('institution_id').eq('athlete_id', user.id).eq('institution_id', institutionId).maybeSingle().then(({ data }) => {
      if (active) setSaved(Boolean(data));
    });
    return () => { active = false; };
  }, [institutionId, ready, user]);

  if (!ready || !user) return <Link href="/login?role=athlete" className="btn-secondary">Sign in to save</Link>;
  if (user.user_metadata.account_type === 'coach') return null;

  const toggle = async () => {
    setSaving(true); setError(null);
    const result = saved
      ? await supabase.from('athlete_saved_institutions').delete().eq('athlete_id', user.id).eq('institution_id', institutionId)
      : await supabase.from('athlete_saved_institutions').insert({ athlete_id: user.id, institution_id: institutionId });
    if (result.error) setError(result.error.code === '23505' ? null : 'Unable to update your schools.');
    else setSaved(!saved);
    setSaving(false);
  };

  return <div><button type="button" onClick={toggle} disabled={saving} className="btn-secondary inline-flex items-center gap-2"><span aria-hidden="true">{saved ? <BookmarkCheck className="size-4 text-brand-600" /> : <Bookmark className="size-4" />}</span>{saving ? 'Saving…' : saved ? 'Saved to My Schools' : 'Add to My Schools'}</button>{error && <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}</div>;
}
