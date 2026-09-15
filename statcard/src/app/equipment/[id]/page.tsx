import EquipmentWorkspace from '@/components/EquipmentWorkspace';

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EquipmentWorkspace key={id} mode="detail" itemId={id} />;
}
