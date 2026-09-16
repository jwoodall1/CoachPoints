'use client';

import Link from 'next/link';
import { useState } from 'react';
import InstitutionSportPicker, {
  type InstitutionSportSelection,
} from '@/components/InstitutionSportPicker';
import { supabase } from '@/lib/supabase';

export type CoachMembership = {
  institution_id: string;
  primary_sport_id: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'removed';
};

export default function CoachInstitutionMembership({
  membership,
  institution,
  sport,
}: {
  membership: CoachMembership | null;
  institution: string;
  sport: string;
}) {
  const [selection, setSelection] = useState<InstitutionSportSelection | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canRequest =
    !membership || membership.status === 'rejected' || membership.status === 'removed';

  async function request(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selection?.sportId || saving) return;
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase.rpc('request_coach_institution', {
        target_institution: selection.institutionId,
        target_sport: selection.sportId,
      });
      if (error) throw error;
      window.location.reload();
    } catch {
      setError('Unable to submit your request. Please try again.');
      setSaving(false);
    }
  }

  return (
    <section className="surface-card mt-6 p-6 sm:p-8">
      <h2 className="section-title">Institution membership</h2>
      {membership?.status === 'pending' && (
        <>
          <p className="mt-3 text-sm font-bold text-amber-700">
            Pending approval · {institution} · {sport}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Your account is ready to use. An institution administrator must approve your membership
            before you can access equipment for the requested sport.
          </p>
        </>
      )}
      {membership?.status === 'approved' && (
        <>
          <p className="mt-3 text-sm font-bold text-emerald-700">
            Approved · {institution}
            {sport ? ` · ${sport}` : ''}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Your institution administrator manages your sports. Your primary sport is displayed on
            your profile. Equipment access is limited to the sports your administrator assigns.
          </p>
          <Link href="/equipment" className="btn-secondary mt-4">
            View team equipment
          </Link>
        </>
      )}
      {canRequest && (
        <form onSubmit={request} className="mt-4 space-y-4">
          <p className="text-sm text-slate-500">
            {membership?.status === 'rejected'
              ? 'Your request was declined. You can submit a new request.'
              : membership?.status === 'removed'
                ? 'Your institution membership was removed. Your CoachPoints account remains active.'
                : 'Select your institution and sport to request membership.'}
          </p>
          <InstitutionSportPicker value={selection} onChange={setSelection} disabled={saving} />
          {error && (
            <p role="alert" className="text-sm text-rose-600">
              {error}
            </p>
          )}
          <button className="btn-primary" disabled={saving || !selection?.sportId}>
            {saving ? 'Submitting…' : 'Request membership'}
          </button>
        </form>
      )}
    </section>
  );
}
