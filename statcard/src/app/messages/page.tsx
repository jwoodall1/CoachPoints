import type { Metadata } from 'next';

import MessagesWorkspace from '@/components/MessagesWorkspace';

export const metadata: Metadata = {
  title: 'Messages | Athlio',
  description: 'Private messages with your Athlio connections.',
};

export default function MessagesPage() {
  return <MessagesWorkspace />;
}
