'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { equipmentStatuses, type EquipmentItem } from '@/lib/equipment';

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

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || busy.current) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    if (!name) {
      setError('Equipment Name is required.');
      return;
    }
    const values = {
      name,
      type: String(form.get('type') ?? '').trim() || null,
      size: String(form.get('size') ?? '').trim() || null,
      status: String(form.get('status')),
      notes: String(form.get('notes') ?? '').trim() || null,
    };
    busy.current = true;
    setSaving(true);
    setError(null);
    try {
      const query = item
        ? supabase.from('equipment_items').update(values).eq('id', item.id).eq('team_id', teamId)
        : supabase
            .from('equipment_items')
            .insert({ ...values, team_id: teamId, created_by: user.id });
      const { data, error } = await query.select().single();
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

  return (
    <form onSubmit={save} className="surface-card mt-6 p-6 sm:p-8">
      <fieldset disabled={saving} className="grid gap-5 sm:grid-cols-2">
        {(
          [
            ['name', 'Equipment Name', 120],
            ['type', 'Type', 80],
            ['size', 'Size', 40],
          ] as const
        ).map(([field, label, maxLength]) => (
          <label key={field} className="block text-sm font-bold text-slate-700">
            <span className="mb-2 block">{label}</span>
            <input
              name={field}
              defaultValue={item?.[field] ?? ''}
              required={field === 'name'}
              maxLength={maxLength}
              className="input"
            />
          </label>
        ))}
        <label className="block text-sm font-bold text-slate-700">
          <span className="mb-2 block">Status</span>
          <select name="status" defaultValue={item?.status ?? 'Available'} className="input">
            {equipmentStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
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
