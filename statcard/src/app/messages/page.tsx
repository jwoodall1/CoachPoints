import type { Metadata } from 'next';

import MessagesWorkspace from '@/components/MessagesWorkspace';

export const metadata: Metadata = {
  title: 'Messages | Rosterra',
  description: 'Private messages with your Rosterra connections.',
};

export default function MessagesPage() {
  return <MessagesWorkspace />;
}
