import type { Metadata } from 'next';

import MessagesWorkspace from '@/components/MessagesWorkspace';

export const metadata: Metadata = {
  title: 'Messages | CoachPoints',
  description: 'Private messages with your CoachPoints connections.',
};

export default function MessagesPage() {
  return <MessagesWorkspace />;
}
