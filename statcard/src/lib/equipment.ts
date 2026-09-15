import { supabase } from '@/lib/supabase';

export const equipmentStatuses = [
  'Available',
  'Assigned',
  'Damaged',
  'Missing',
  'Retired',
] as const;
export type EquipmentStatus = (typeof equipmentStatuses)[number];
export type EquipmentItem = {
  id: string;
  team_id: string;
  name: string;
  type: string | null;
  size: string | null;
  status: EquipmentStatus;
  assigned_player_id: string | null;
  notes: string | null;
};
export type EquipmentTeam = { id: string; name: string };
export const equipmentColumns = 'id, team_id, name, type, size, status, assigned_player_id, notes';

export async function loadEquipmentTeams(): Promise<EquipmentTeam[]> {
  // The RPC uses the same program permissions as the database policies.
  const { data, error } = await supabase.rpc('get_equipment_teams');
  if (error) throw error;
  return data ?? [];
}

export async function loadPlayerNames(items: EquipmentItem[]) {
  const ids = [
    ...new Set(items.flatMap((item) => (item.assigned_player_id ? [item.assigned_player_id] : []))),
  ];
  if (!ids.length) return new Map<string, string>();
  const { data, error } = await supabase
    .from('public_profile_cards')
    .select('id, first_name, last_name, username')
    .in('id', ids);
  if (error) throw error;
  return new Map(
    (data ?? []).map((player) => [
      player.id,
      [player.first_name, player.last_name].filter(Boolean).join(' ') || player.username,
    ]),
  );
}

// TODO: Add NFC tag assignment.
// TODO: Add QR backup code support.
// TODO: Add player equipment checkout/return flow.
// TODO: Add damaged/missing equipment reports.
// TODO: Add CSV import/export.
