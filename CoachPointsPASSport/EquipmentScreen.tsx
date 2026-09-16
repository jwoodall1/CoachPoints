import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cancelEquipmentScan, scanEquipmentTag } from './nfc';

const models = { Helmet: ['Riddell SpeedFlex', 'Riddell Axiom', 'Schutt F7', 'Schutt Vengeance', 'VICIS ZERO2'], 'Shoulder pads': ['Douglas CP', 'Douglas SP', 'Riddell Power SPK+', 'Schutt XV', 'Xenith Velocity 2'] };
const sizes = ['Youth S', 'Youth M', 'Youth L', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const statuses = ['Available', 'Assigned', 'Damaged', 'Missing', 'Retired'];
type Item = { id: string; team_id: string; name: string; equipment_code: string; equipment_category: string; size: string; status: string; notes: string | null; assigned_player_id: string | null };
type Player = { id: string; username: string; first_name: string; last_name: string };
const columns = 'id,team_id,name,equipment_code,equipment_category,size,status,notes,assigned_player_id';

function Choices({ label, values, value, onChange }: { label: string; values: string[]; value: string; onChange: (v: string) => void }) {
  return <View style={s.group}><Text style={s.label}>{label}</Text><View style={s.choices}>{values.map(v => <Pressable accessibilityRole="button" accessibilityState={{ selected: value === v }} key={v} onPress={() => onChange(v)} style={[s.chip, value === v && s.selected]}><Text style={value === v ? s.white : undefined}>{v}</Text></Pressable>)}</View></View>;
}

export default function EquipmentScreen({ client, onBack }: { client: SupabaseClient; onBack: () => void }) {
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [team, setTeam] = useState(''); const [items, setItems] = useState<Item[]>([]);
  const [names, setNames] = useState<Record<string,string>>({});
  const [editing, setEditing] = useState(false); const [item, setItem] = useState<Item | null>(null);
  const uid = useRef(''); const busyRef = useRef(false); const alive = useRef(true); const scanVersion = useRef(0);
  const [busy, setBusy] = useState(false); const [scanning, setScanning] = useState(false); const [error, setError] = useState('');
  const [category, setCategory] = useState<keyof typeof models>('Helmet'); const [model, setModel] = useState(''); const [size, setSize] = useState('');
  const [status, setStatus] = useState('Available'); const [notes, setNotes] = useState(''); const [player, setPlayer] = useState<string | null>(null);
  const [playerQuery, setPlayerQuery] = useState(''); const [players, setPlayers] = useState<Player[]>([]); const [search, setSearch] = useState(''); const [filter, setFilter] = useState('All');
  useEffect(() => { alive.current = true; client.rpc('get_equipment_teams').then(({ data, error }) => { if (!alive.current) return; if (error) setError('Could not load approved sports. Retry by reopening Equipment.'); else { setTeams(data ?? []); setTeam(data?.[0]?.id ?? ''); } }); return () => { alive.current = false; scanVersion.current++; uid.current = ''; void cancelEquipmentScan(); }; }, [client]);
  useEffect(() => { let active = true; setItems([]); if (team) client.from('equipment_items').select(columns).eq('team_id', team).order('created_at', { ascending: false }).then(({ data, error }) => { if (active) { if (error) setError('Could not load equipment.'); else setItems(data ?? []); } }); return () => { active = false; }; }, [client, team]);
  useEffect(() => { let active = true; setPlayers([]); if (playerQuery.trim().length < 2) return; const timer = setTimeout(async () => { const { data, error } = await client.from('public_profile_cards').select('id,username,first_name,last_name').ilike('username', `%${playerQuery.trim().replace(/[%_]/g, '')}%`).limit(15); if (active) { if (error) setError('Player search failed. Please retry.'); else setPlayers(data ?? []); } }, 300); return () => { active = false; clearTimeout(timer); }; }, [client, playerQuery]);
  useEffect(() => { let active = true; const ids = [...new Set(items.flatMap(i => i.assigned_player_id ? [i.assigned_player_id] : []))]; if (ids.length) client.from('public_profile_cards').select('id,first_name,last_name,username').in('id', ids).then(({ data }) => { if (active && data) setNames(Object.fromEntries(data.map(p => [p.id, [p.first_name,p.last_name].filter(Boolean).join(' ') || p.username]))); }); return () => { active = false; }; }, [client, items]);
  function open(row: Item | null) { setItem(row); setCategory(row?.equipment_category === 'Shoulder pads' ? 'Shoulder pads' : 'Helmet'); setModel(row?.name ?? ''); setSize(row?.size ?? ''); setStatus(row?.status ?? 'Available'); setNotes(row?.notes ?? ''); setPlayer(row?.assigned_player_id ?? null); setPlayerQuery(''); setEditing(true); }
  async function scan() {
    if (busyRef.current) return; busyRef.current = true; setBusy(true); setScanning(true); setError(''); uid.current = ''; const version = ++scanVersion.current;
    try { const tag = await scanEquipmentTag(); if (version !== scanVersion.current || !alive.current) return; const { data, error } = await client.rpc('lookup_equipment_tag', { p_team: team, p_tag: tag }); if (error) throw error; if (version !== scanVersion.current || !alive.current) return; uid.current = tag; open(data?.[0] ?? null); }
    catch { if (version === scanVersion.current && alive.current) setError('Scan failed or cancelled. Enable NFC and use a supported tag in the installed PASSport app, then retry.'); }
    finally { busyRef.current = false; if (alive.current) { setBusy(false); setScanning(false); } }
  }
  async function save() {
    if (busyRef.current || !model.trim() || !size) return;
    busyRef.current = true; setBusy(true); setError('');
    try { const { data, error } = await client.rpc('save_equipment_item', { p_team: team, p_item: item?.id ?? null, p_tag: item ? null : uid.current, p_category: category, p_model: model.trim(), p_size: size, p_status: status, p_player: player, p_notes: notes.trim() || null }); if (error) throw error; const row = data?.[0] as Item; if (!row) throw new Error(); setItems(old => [row, ...old.filter(i => i.id !== row.id)]); uid.current = ''; setEditing(false); }
    catch { setError('Unable to save. Check your connection and approved sport access. If this tag was already registered, cancel and rescan it.'); }
    finally { busyRef.current = false; setBusy(false); }
  }
  return <SafeAreaView style={s.safe}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
    <Pressable onPress={() => { if (!busy) { if (editing) { uid.current = ''; setEditing(false); } else onBack(); } }}><Text style={s.link}>{editing ? 'Cancel editing' : 'Back to dashboard'}</Text></Pressable>
    <Text style={s.title}>Equipment</Text><Text>Register, assign and organize your institution’s equipment.</Text>
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    {!editing ? <><Text style={s.label}>Institution / sport</Text>{teams.map(t => <Pressable disabled={busy} key={t.id} onPress={() => { setTeam(t.id); setError(''); }} style={[s.chip, team === t.id && s.selected]}><Text style={team === t.id ? s.white : undefined}>{t.name}</Text></Pressable>)}{!teams.length && <Text>An institution administrator must approve your membership and assign this sport. Submit an institution and sport request from your web coach dashboard.</Text>}
      {!!team && <><Pressable disabled={busy} style={s.button} onPress={scan}><Text style={s.white}>{scanning ? 'Hold phone near equipment tag…' : 'Scan equipment NFC tag'}</Text></Pressable>{scanning && <Pressable onPress={() => { scanVersion.current++; void cancelEquipmentScan(); }}><Text style={s.link}>Cancel scan</Text></Pressable>}
      <TextInput accessibilityLabel="Search equipment" style={s.input} placeholder="Search model or equipment code" value={search} onChangeText={setSearch} /><Choices label="Status filter" values={['All', ...statuses]} value={filter} onChange={setFilter} />
      {items.filter(i => (filter === 'All' || i.status === filter) && `${i.name} ${i.equipment_code}`.toLowerCase().includes(search.toLowerCase())).map(i => <Pressable disabled={busy} key={i.id} style={s.card} onPress={() => open(i)}><Text style={s.label}>{i.equipment_code}</Text><Text>{i.name} · {i.size}</Text><Text>{i.status} · {i.assigned_player_id ? (names[i.assigned_player_id] ?? 'Player assigned') : 'Unassigned'}</Text></Pressable>)}{!items.length && <Text>No equipment yet. Scan a tag to register your first item.</Text>}</>}
    </> : <View pointerEvents={busy ? 'none' : 'auto'}>
      <Text style={s.label}>{item?.equipment_code ?? 'New equipment · tag scanned'}</Text>
      <Choices label="Equipment type" values={Object.keys(models)} value={category} onChange={v => { setCategory(v as keyof typeof models); setModel(''); setSize(''); }} />
      <Choices label="Model" values={[...models[category], 'Other']} value={model} onChange={setModel} />
      <TextInput accessibilityLabel="Equipment model" style={s.input} value={model === 'Other' ? '' : model} onChangeText={setModel} placeholder="Model (or enter another model)" maxLength={120} />
      <Choices label="Size" values={sizes} value={size} onChange={setSize} /><Choices label="Condition / status" values={statuses} value={status} onChange={v => { setStatus(v); if (v === 'Available') setPlayer(null); }} />
      <Text style={s.label}>Assign player (optional)</Text><Text>{player ? (names[player] ?? players.find(p => p.id === player)?.username ?? 'Player selected') : 'Unassigned'}</Text>
      <TextInput accessibilityLabel="Find player by username" autoCapitalize="none" style={s.input} placeholder="Search player username (2+ characters)" value={playerQuery} onChangeText={setPlayerQuery} />
      {players.map(p => <Pressable key={p.id} style={[s.chip, player === p.id && s.selected]} onPress={() => { setPlayer(p.id); setStatus('Assigned'); }}><Text style={player === p.id ? s.white : undefined}>{p.first_name} {p.last_name} (@{p.username})</Text></Pressable>)}
      <Pressable onPress={() => { setPlayer(null); if (status === 'Assigned') setStatus('Available'); }}><Text style={s.link}>Clear assignment / return</Text></Pressable>
      <TextInput accessibilityLabel="Equipment notes" style={s.input} multiline value={notes} onChangeText={setNotes} maxLength={5000} placeholder="Equipment or assignment notes" />
      <Pressable disabled={busy || !model.trim() || !size || (status === 'Assigned' && !player)} style={s.button} onPress={save}><Text style={s.white}>{busy ? 'Saving…' : 'Save equipment'}</Text></Pressable>
    </View>}
  </ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#f3f7f6' }, content: { padding: 22, gap: 14 }, title: { fontSize: 30, fontWeight: '800', color: '#123e30' }, label: { fontWeight: '700', marginVertical: 7 }, group: { marginVertical: 8 }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { padding: 12, borderWidth: 1, borderColor: '#b9cbc3', borderRadius: 12, marginVertical: 3 }, selected: { backgroundColor: '#167a5a' }, white: { color: '#fff', fontWeight: '600' }, button: { backgroundColor: '#167a5a', padding: 17, borderRadius: 14, marginVertical: 12 }, input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#b9cbc3', padding: 14, borderRadius: 12, marginVertical: 8 }, card: { backgroundColor: '#fff', borderRadius: 14, padding: 18 }, link: { color: '#167a5a', paddingVertical: 10, fontWeight: '700' }, error: { color: '#b42318' } });
