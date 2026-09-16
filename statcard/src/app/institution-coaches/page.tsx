'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

type Institution = { id: string; name: string; slug: string };
type Sport = { id: string; display_name: string };
type Member = {
  coach_id: string;
  status: 'pending' | 'approved';
  primary_sport_id: string | null;
  coachprofiles: { first_name: string | null; last_name: string | null; username: string };
  coach_sport_memberships: { sport_id: string }[];
};

export default function InstitutionCoachesPage() {
  const { ready, user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (ready && !user) router.replace('/login');
  }, [ready, user, router]);
  if (!ready || !user) return <main className="loading-shell">Loading institution access…</main>;
  return <InstitutionCoachesWorkspace key={user.id} />;
}

function InstitutionCoachesWorkspace() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionId, setInstitutionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<{
    institutionId: string;
    members: Member[];
    sports: Sport[];
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase.rpc('get_coach_admin_institutions');
        if (error) throw error;
        if (active) {
          setInstitutions(data ?? []);
          setInstitutionId(data?.[0]?.id ?? '');
          setLoading(false);
        }
      } catch {
        if (active) {
          setError('Unable to verify institution access. Reload to try again.');
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const loadMembers = useCallback(async () => {
    const [members, sports] = await Promise.all([
      supabase
        .from('coach_institution_memberships')
        .select(
          'coach_id, status, primary_sport_id, coachprofiles!coach_institution_memberships_coach_id_fkey(first_name, last_name, username), coach_sport_memberships(sport_id)',
        )
        .eq('institution_id', institutionId)
        .in('status', ['pending', 'approved'])
        .order('created_at'),
      supabase
        .from('sports')
        .select('id, display_name')
        .eq('institution_id', institutionId)
        .order('display_name'),
    ]);
    if (members.error || sports.error) throw members.error ?? sports.error;
    return {
      institutionId,
      members: (members.data ?? []) as unknown as Member[],
      sports: sports.data ?? [],
    };
  }, [institutionId]);

  useEffect(() => {
    if (!institutionId) return;
    let active = true;
    void loadMembers()
      .then((data) => {
        if (active) setSnapshot(data);
      })
      .catch(() => {
        if (active) setError('Unable to load coaches. Reload to try again.');
      });
    return () => {
      active = false;
    };
  }, [institutionId, loadMembers]);

  async function manage(member: Member, action: string, sportIds?: string[]) {
    if (saving) return;
    if (
      action === 'remove' &&
      !window.confirm(
        `Remove ${member.coachprofiles.username} from this institution and all its sports? Their CoachPoints account will remain active.`,
      )
    )
      return;
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase.rpc('manage_institution_coach', {
        target_institution: institutionId,
        target_coach: member.coach_id,
        action,
        ...(sportIds ? { sport_ids: sportIds } : {}),
      });
      if (error) throw error;
      setSnapshot(await loadMembers());
    } catch {
      setError(
        'Unable to update membership. Your access or this request may have changed. Reload and try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  const data = snapshot?.institutionId === institutionId ? snapshot : null;
  return (
    <main className="min-h-screen pb-20 pt-8 sm:pt-10">
      <div className="page-shell max-w-5xl">
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Institution coaches
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Review membership requests and manage coaches’ sports.
        </p>
        {error && (
          <p role="alert" className="mt-6 text-sm font-bold text-rose-600">
            {error}
          </p>
        )}
        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Loading institution access…</p>
        ) : !institutions.length && !error ? (
          <p role="alert" className="surface-card mt-6 p-6">
            Institution administrator access is required.
          </p>
        ) : (
          institutions.length > 0 && (
            <>
              <label className="mt-6 block max-w-lg text-sm font-bold text-slate-700">
                <span className="mb-2 block">Institution</span>
                <select
                  disabled={saving}
                  className="input"
                  value={institutionId}
                  onChange={(event) => {
                    setInstitutionId(event.target.value);
                    setError(null);
                  }}
                >
                  {institutions.map((institution) => (
                    <option key={institution.id} value={institution.id}>
                      {institution.name}
                    </option>
                  ))}
                </select>
              </label>
              {!data ? (
                <p className="mt-6 text-sm text-slate-500">Loading coaches…</p>
              ) : !data.members.length ? (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                  <h2 className="text-xl font-black">No coaches yet</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    New requests will appear here when coaches select this institution.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {data.members.map((member) => (
                    <CoachRow
                      key={`${member.coach_id}:${member.status}:${member.coach_sport_memberships
                        .map((sport) => sport.sport_id)
                        .sort()
                        .join(',')}`}
                      member={member}
                      sports={data.sports}
                      saving={saving}
                      onManage={manage}
                    />
                  ))}
                </div>
              )}
            </>
          )
        )}
      </div>
    </main>
  );
}

function CoachRow({
  member,
  sports,
  saving,
  onManage,
}: {
  member: Member;
  sports: Sport[];
  saving: boolean;
  onManage: (member: Member, action: string, sports?: string[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState(
    member.coach_sport_memberships.map((sport) => sport.sport_id),
  );
  const name =
    [member.coachprofiles.first_name, member.coachprofiles.last_name].filter(Boolean).join(' ') ||
    member.coachprofiles.username;
  return (
    <section className="surface-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/${member.coachprofiles.username}`}
          className="text-lg font-extrabold text-brand-700 hover:underline"
        >
          {name}
        </Link>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          {member.status === 'pending' ? 'Pending approval' : 'Approved'}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {member.status === 'pending' ? 'Requested sport' : 'Profile sport'}:{' '}
        {sports.find((sport) => sport.id === member.primary_sport_id)?.display_name ??
          'None assigned'}
      </p>
      {member.status === 'pending' ? (
        <div className="mt-5 flex gap-3">
          <button
            disabled={saving}
            className="btn-primary"
            onClick={() => void onManage(member, 'approve')}
          >
            Accept coach
          </button>
          <button
            disabled={saving}
            className="btn-secondary"
            onClick={() => void onManage(member, 'reject')}
          >
            Decline
          </button>
        </div>
      ) : (
        <>
          <fieldset disabled={saving} className="mt-5 grid gap-3 sm:grid-cols-2">
            <legend className="mb-3 text-sm font-bold text-slate-700">Sports access</legend>
            {sports.map((sport) => (
              <label key={sport.id} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="accent-brand-600"
                  checked={selected.includes(sport.id)}
                  onChange={(event) =>
                    setSelected((current) =>
                      event.target.checked
                        ? [...current, sport.id]
                        : current.filter((id) => id !== sport.id),
                    )
                  }
                />
                {sport.display_name}
              </label>
            ))}
          </fieldset>
          <p className="mt-3 text-xs text-slate-500">
            The current profile sport stays selected if it remains assigned. Otherwise, the first
            assigned sport becomes the profile sport. These selections also control equipment access; removing a sport revokes access to its equipment.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              disabled={saving}
              className="btn-primary"
              onClick={() => void onManage(member, 'set_sports', selected)}
            >
              Save sports
            </button>
            <button
              disabled={saving}
              className="btn-secondary text-rose-600"
              onClick={() => void onManage(member, 'remove')}
            >
              Remove from institution
            </button>
          </div>
        </>
      )}
    </section>
  );
}
