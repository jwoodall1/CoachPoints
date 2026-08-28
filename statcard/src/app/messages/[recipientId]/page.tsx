import type { Metadata } from 'next';

import MessagesWorkspace from '@/components/MessagesWorkspace';

export const metadata: Metadata = {
  title: 'Conversation | Rosterra',
};

export default async function ConversationPage({ params }: { params: Promise<{ recipientId: string }> }) {
  const { recipientId } = await params;
  return <MessagesWorkspace initialRecipientId={recipientId} />;
}
