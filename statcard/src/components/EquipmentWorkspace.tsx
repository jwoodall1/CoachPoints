'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Package, Pencil, Plus } from 'lucide-react';
import EquipmentForm from '@/components/EquipmentForm';
import { supabase } from '@/lib/supabase';
import {
  equipmentColumns,
  loadEquipmentTeams,
  loadPlayerNames,
  type EquipmentItem,
  type EquipmentTeam,
} from '@/lib/equipment';

export default function EquipmentWorkspace({
  mode,
  itemId,
  requestedTeam,
}: {
  mode: 'list' | 'new' | 'detail';
  itemId?: string;
  requestedTeam?: string;
}) {
  const [teams, setTeams] = useState<EquipmentTeam[]>([]);
  const [teamId, setTeamId] = useState('');
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [players, setPlayers] = useState(new Map<string, string>());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const availableTeams = await loadEquipmentTeams();
        if (!active) return;
        setTeams(availableTeams);
        if (mode === 'detail') {
          const { data, error } = await supabase
            .from('equipment_items')
            .select(equipmentColumns)
            .eq('id', itemId!)
            .maybeSingle();
          if (error) throw error;
          if (!active) return;
          if (!data) {
            setError('Equipment not found or you do not have access.');
            setLoading(false);
            return;
          }
          const item = data as EquipmentItem;
          const names = await loadPlayerNames([item]);
          if (!active) return;
          setItems([item]);
          setPlayers(names);
          setTeamId(item.team_id);
        } else {
          setTeamId(
            availableTeams.find((team) => team.id === requestedTeam)?.id ??
              availableTeams[0]?.id ??
              '',
          );
        }
        if (mode !== 'list' || !availableTeams.length) setLoading(false);
      } catch {
        if (active) {
          setError('Unable to load equipment. Please reload to try again.');
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [mode, itemId, requestedTeam]);

  useEffect(() => {
    if (mode !== 'list' || !teamId) return;
    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase
          .from('equipment_items')
          .select(equipmentColumns)
          .eq('team_id', teamId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        const rows = (data ?? []) as EquipmentItem[];
        const names = await loadPlayerNames(rows);
        if (active) {
          setItems(rows);
          setPlayers(names);
          setLoading(false);
        }
      } catch {
        if (active) {
          setError('Unable to load equipment. Please reload to try again.');
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [mode, teamId]);

  const item = items[0];
  const team = teams.find((team) => team.id === teamId);
  const assignedPlayer = (item: EquipmentItem) =>
    item.assigned_player_id
      ? (players.get(item.assigned_player_id) ?? 'Player unavailable')
      : 'Unassigned';

  return (
    <main className="min-h-screen pb-20 pt-8 sm:pt-10">
      <div className="page-shell max-w-5xl">
        <Link
          href={
            mode === 'list' ? '/coach-dashboard' : `/equipment?team=${encodeURIComponent(teamId)}`
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-950"
        >
          <ArrowLeft className="size-4" />
          {mode === 'list' ? 'Back to dashboard' : 'Back to Equipment'}
        </Link>
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {mode === 'new' ? 'Add Equipment' : 'Equipment'}
            </h1>
            <p className="mt-2 text-sm text-slate-500">Track equipment separately for each approved sport within your institution.</p>
          </div>
          {mode === 'list' && teamId && !error && (
            <Link
              href={`/equipment/new?team=${encodeURIComponent(teamId)}`}
              className="btn-primary"
            >
              <Plus className="size-4" />
              Add Equipment
            </Link>
          )}
        </header>
        {teams.length > 0 && mode !== 'detail' && (
          <label className="mt-6 block max-w-md text-sm font-bold text-slate-700">
            <span className="mb-2 block">Institution / sport</span>
            <select
              className="input"
              value={teamId}
              onChange={(event) => {
                setTeamId(event.target.value);
                setItems([]);
                setError(null);
                if (mode === 'list') setLoading(true);
              }}
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {error ? (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
          >
            {error}
          </p>
        ) : loading ? (
          <p role="status" className="mt-6 text-sm text-slate-500">
            Loading equipment…
          </p>
        ) : !teams.length ? (
          <EquipmentEmpty
            title="No approved sports available"
            description="Request institution and sport membership from your coach dashboard. Your institution administrator must approve your requested sport."
          />
        ) : mode === 'new' ? (
          <EquipmentForm key={teamId} teamId={teamId} />
        ) : mode === 'detail' && item ? (
          <>
            <p className="mt-6 text-sm font-bold text-slate-500">{team?.name}</p>
            {editing ? (
              <EquipmentForm
                teamId={item.team_id}
                item={item}
                onCancel={() => setEditing(false)}
                onSaved={(updated) => {
                  setItems([updated]);
                  void loadPlayerNames([updated]).then(setPlayers).catch(() => setError("Unable to refresh player name."));
                  setEditing(false);
                }}
              />
            ) : (
              <section className="surface-card mt-6 p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="section-title break-words">{item.name}</h2>
                  <button type="button" className="btn-dark" onClick={() => setEditing(true)}>
                    <Pencil className="size-4" />
                    Edit
                  </button>
                </div>
                <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                  {[
                    ['Equipment code', item.equipment_code || 'Pending'],
                    ['Equipment Name', item.name],
                    ['Type', item.type || '—'],
                    ['Size', item.size || '—'],
                    ['Status', item.status],
                    ['Assigned Player', assignedPlayer(item)],
                    ['Notes', item.notes || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className={label === 'Notes' ? 'sm:col-span-2' : ''}>
                      <dt className="text-sm font-bold text-slate-500">{label}</dt>
                      <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-950">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </>
        ) : !items.length ? (
          <EquipmentEmpty
            title="No equipment yet"
            description="Add your first item to start tracking team equipment."
          />
        ) : (
          <div className="surface-card mt-6 overflow-x-auto">
            <div className="flex gap-3 p-4"><input aria-label="Search equipment" className="input" placeholder="Search model, code or player" value={search} onChange={e => setSearch(e.target.value)} /><select aria-label="Filter status" className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>{['All','Available','Assigned','Damaged','Missing','Retired'].map(v => <option key={v}>{v}</option>)}</select></div>
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Equipment for {team?.name}</caption>
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <tr>
                  {['Equipment name', 'Type', 'Size', 'Status', 'Assigned player'].map(
                    (heading) => (
                      <th key={heading} scope="col" className="px-5 py-4">
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.filter(item => (statusFilter === 'All' || item.status === statusFilter) && `${item.name} ${item.equipment_code} ${assignedPlayer(item)}`.toLowerCase().includes(search.toLowerCase())).map((item) => (
                  <tr key={item.id}>
                    <th scope="row" className="min-w-48 px-5 py-4 font-bold">
                      <Link
                        className="text-brand-700 hover:underline"
                        href={`/equipment/${item.id}`}
                      >
                        {item.name}<span className="block text-xs text-slate-500">{item.equipment_code}</span>
                      </Link>
                    </th>
                    <td className="px-5 py-4">{item.type || '—'}</td>
                    <td className="px-5 py-4">{item.size || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">{assignedPlayer(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function EquipmentEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
      <Package className="mx-auto size-10 text-brand-500" />
      <h2 className="mt-4 text-xl font-black text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
