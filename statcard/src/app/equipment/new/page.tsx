import EquipmentWorkspace from '@/components/EquipmentWorkspace';

export default async function AddEquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const { team } = await searchParams;
  return <EquipmentWorkspace key={team ?? ''} mode="new" requestedTeam={team} />;
}
