'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type InstitutionSportSelection = {
  institutionId: string;
  institutionName: string;
  sportId: string;
};
const pageSize = 20;

/** Search every published institution, then choose only a sport belonging to it. */
export default function InstitutionSportPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: InstitutionSportSelection | null;
  onChange: (value: InstitutionSportSelection | null) => void;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [results, setResults] = useState<{ id: string; name: string; location: string }[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (value) return;
    let active = true;
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const term = search.trim().replace(/[\\%_]/g, '\\$&');
          const { data, error } = await supabase
            .from('institutions')
            .select('id, name, location')
            .eq('status', 'published')
            .ilike('name', `%${term}%`)
            .order('name')
            .order('id')
            .range(page * pageSize, (page + 1) * pageSize);
          if (error) throw error;
          if (active) {
            setResults((data ?? []).slice(0, pageSize));
            setHasMore((data?.length ?? 0) > pageSize);
            setError(false);
            setLoading(false);
          }
        } catch {
          if (active) {
            setError(true);
            setLoading(false);
          }
        }
      })();
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, page, value]);

  return (
    <fieldset disabled={disabled} className="space-y-4 disabled:opacity-60">
      <legend className="mb-2 text-sm font-bold text-slate-700">Institution and sport</legend>
      {value ? (
        <>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="text-sm font-bold text-slate-950">{value.institutionName}</span>
            <button
              type="button"
              className="text-sm font-bold text-brand-700"
              onClick={() => {
                onChange(null);
                setLoading(true);
              }}
            >
              Change
            </button>
          </div>
          <SportSelect key={value.institutionId} value={value} onChange={onChange} />
        </>
      ) : (
        <>
          <label className="block text-sm font-bold text-slate-700">
            <span className="mb-2 block">Search institutions</span>
            <input
              className="input"
              value={search}
              placeholder="Institution name"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
                setLoading(true);
              }}
            />
          </label>
          {loading ? (
            <p role="status" className="text-sm text-slate-500">
              Loading institutions…
            </p>
          ) : error ? (
            <p role="alert" className="text-sm text-rose-600">
              Unable to load institutions. Change your search to try again.
            </p>
          ) : (
            <>
              <ul
                aria-label="Institution results"
                className="max-h-52 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200"
              >
                {results.map((institution) => (
                  <li key={institution.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-3 text-left text-sm hover:bg-brand-50"
                      onClick={() =>
                        onChange({
                          institutionId: institution.id,
                          institutionName: institution.name,
                          sportId: '',
                        })
                      }
                    >
                      <span className="block font-bold text-slate-950">{institution.name}</span>
                      <span className="text-xs text-slate-500">{institution.location}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {!results.length && <p className="text-sm text-slate-500">No institutions found.</p>}
              {(page > 0 || hasMore) && (
                <div className="flex justify-between gap-3">
                  <button
                    type="button"
                    disabled={page === 0}
                    className="btn-secondary"
                    onClick={() => {
                      setPage(page - 1);
                      setLoading(true);
                    }}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={!hasMore}
                    className="btn-secondary"
                    onClick={() => {
                      setPage(page + 1);
                      setLoading(true);
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </fieldset>
  );
}

function SportSelect({
  value,
  onChange,
}: {
  value: InstitutionSportSelection;
  onChange: (value: InstitutionSportSelection) => void;
}) {
  const [sports, setSports] = useState<{ id: string; display_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase
          .from('sports')
          .select('id, display_name')
          .eq('institution_id', value.institutionId)
          .order('display_name');
        if (error) throw error;
        if (active) {
          setSports(data ?? []);
          setLoading(false);
        }
      } catch {
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [value.institutionId]);
  if (loading)
    return (
      <p role="status" className="text-sm text-slate-500">
        Loading available sports…
      </p>
    );
  if (error)
    return (
      <p role="alert" className="text-sm text-rose-600">
        Unable to load sports. Select the institution again to retry.
      </p>
    );
  if (!sports.length)
    return (
      <p className="text-sm text-slate-500">
        This institution has no available sports. Contact its administrator or choose another
        institution.
      </p>
    );
  return (
    <label className="block text-sm font-bold text-slate-700">
      <span className="mb-2 block">Sport</span>
      <select
        required
        className="input"
        value={value.sportId}
        onChange={(event) => onChange({ ...value, sportId: event.target.value })}
      >
        <option value="">Select a sport</option>
        {sports.map((sport) => (
          <option key={sport.id} value={sport.id}>
            {sport.display_name}
          </option>
        ))}
      </select>
    </label>
  );
}
