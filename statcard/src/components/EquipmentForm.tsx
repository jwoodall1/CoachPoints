'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { equipmentStatuses, type EquipmentItem } from '@/lib/equipment';

const equipmentModels = {
  Helmet: ['Riddell SpeedFlex', 'Riddell Axiom', 'Schutt F7', 'Schutt Vengeance'],
  'Shoulder pads': ['Douglas CP', 'Douglas SP', 'Riddell Power SPK+', 'Schutt XV', 'Xenith Velocity 2'],
} as const;
const sizes = ['Youth S', 'Youth M', 'Youth L', 'S', 'M', 'L', 'Small', 'Medium', 'Large', 'XL', '2XL', '3XL'];

export default function EquipmentForm({
  teamId,
  item,
  onCancel,
  onSaved,
}: {
  teamId: string;
  item?: EquipmentItem;
  onCancel?: () => void;
  onSaved?: (item: EquipmentItem) => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const busy = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<'Helmet' | 'Shoulder pads'>(item?.equipment_category ?? 'Helmet');
  const [playerId, setPlayerId] = useState(item?.assigned_player_id ?? '');
  const [playerQuery, setPlayerQuery] = useState('');
  const [players, setPlayers] = useState<{id: string; username: string; first_name: string; last_name: string}[]>([]);
  const [status, setStatus] = useState(item?.status ?? 'Available');
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      if (playerQuery.trim().length < 2) { if (active) setPlayers([]); return; }
      const { data, error } = await supabase.from('public_profile_cards').select('id,username,first_name,last_name').ilike('username', `%${playerQuery.trim().replace(/[%_]/g, '')}%`).limit(15);
      if (active) { if (error) setError('Could not search players. Retry.'); else setPlayers(data ?? []); }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [playerQuery]);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || busy.current) return;
    const form = new FormData(event.currentTarget);
    const model = String(form.get('model') ?? '').trim();
    const size = String(form.get('size') ?? '').trim();
    if (!model || !size || !item) {
      setError(item ? 'Model and size are required.' : 'Register equipment in the native PASSport app.');
      return;
    }
    if ((status === 'Assigned' && !playerId) || (status === 'Available' && playerId)) { setError('Choose a player for Assigned equipment, or clear the player for Available equipment.'); return; }
    busy.current = true;
    setSaving(true);
    setError(null);
    try {
      const { data: rows, error } = await supabase.rpc('save_equipment_item', {
        p_team: teamId, p_item: item?.id, p_tag: null,
        p_category: category, p_model: model, p_size: size,
        p_status: String(form.get('status')), p_player: playerId || null,
        p_notes: String(form.get('notes') ?? '').trim() || null,
      });
      const data = rows?.[0];
      if (error) throw error;
      if (item && onSaved) onSaved(data as EquipmentItem);
      else router.push(`/equipment?team=${encodeURIComponent(teamId)}`);
    } catch {
      setError('Unable to save equipment. Check your team access and try again.');
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  if (!item) return <div className="surface-card mt-6 p-6">Open CoachPoints PASSport on your phone, choose Equipment, and scan the NFC tag to register an item. It will appear here after saving.</div>;

  return (
    <form onSubmit={save} className="surface-card mt-6 p-6 sm:p-8">
      <fieldset disabled={saving} className="grid gap-5 sm:grid-cols-2">

        <label className="block text-sm font-bold text-slate-700"><span className="mb-2 block">Equipment</span><select name="category" value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="input"><option>Helmet</option><option>Shoulder pads</option></select></label>
        <label className="block text-sm font-bold text-slate-700"><span className="mb-2 block">Model</span><select key={category} name="model" defaultValue={item?.name ?? ''} className="input"><option value="">Choose a model</option>{item?.name && !(equipmentModels[category] as readonly string[]).includes(item.name) && <option>{item.name}</option>}{equipmentModels[category].map((model) => <option key={model}>{model}</option>)}</select></label>
        <label className="block text-sm font-bold text-slate-700"><span className="mb-2 block">Size</span><select name="size" defaultValue={item?.size ?? ''} className="input"><option value="">Choose a size</option>{sizes.map((size) => <option key={size}>{size}</option>)}</select></label>
        <label className="block text-sm font-bold text-slate-700">
          <span className="mb-2 block">Status</span>
          <select name="status" value={status} onChange={e => { setStatus(e.target.value as typeof status); if (e.target.value === 'Available') setPlayerId(''); }} className="input">
            {equipmentStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2"><label className="text-sm font-bold text-slate-700">Assign player (optional)<input className="input mt-2" value={playerQuery} onChange={e => setPlayerQuery(e.target.value)} placeholder="Search player username (2+ characters)" /></label><p className="mt-2 text-sm">{playerId ? 'Player selected / current assignment retained' : 'Unassigned'}</p><div className="flex flex-wrap gap-2">{players.map(p => <button type="button" aria-pressed={p.id === playerId} className="btn-secondary" key={p.id} onClick={() => { setPlayerId(p.id); setStatus('Assigned'); }}>{p.first_name} {p.last_name} (@{p.username}){p.id === playerId ? ' ? selected' : ''}</button>)}</div><button type="button" className="btn-secondary mt-2" onClick={() => { setPlayerId(''); if (status === 'Assigned') setStatus('Available'); }}>Clear assignment / return</button></div>
        <label className="block text-sm font-bold text-slate-700 sm:col-span-2">
          <span className="mb-2 block">Notes</span>
          <textarea
            name="notes"
            defaultValue={item?.notes ?? ''}
            maxLength={5000}
            rows={4}
            className="input resize-y"
          />
        </label>
      </fieldset>
      {error && (
        <p role="alert" className="mt-5 text-sm font-bold text-rose-600">
          {error}
        </p>
      )}
      <div className="mt-7 flex flex-wrap justify-end gap-3">
        {onCancel ? (
          <button type="button" disabled={saving} onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        ) : (
          <Link href={`/equipment?team=${encodeURIComponent(teamId)}`} className="btn-secondary">
            Cancel
          </Link>
        )}
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="size-4" />
          {saving ? 'Saving…' : 'Save Equipment'}
        </button>
      </div>
    </form>
  );
}
