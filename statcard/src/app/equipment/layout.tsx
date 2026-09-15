'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

export default function EquipmentLayout({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAuth();
  const router = useRouter();
  const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.id;

  useEffect(() => {
    if (!ready) return;
    if (!userId) {
      router.replace('/login?role=coach');
      return;
    }
    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase
          .from('coachprofiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
        if (!active) return;
        if (error) throw error;
        if (!data) {
          router.replace('/dashboard');
          return;
        }
        setError(null);
        setVerifiedUserId(userId);
      } catch {
        if (active) setError('Unable to verify coach access. Please reload to try again.');
      }
    })();
    return () => {
      active = false;
    };
  }, [ready, userId, router]);

  if (error)
    return (
      <main className="page-shell py-10">
        <p role="alert" className="text-sm font-bold text-rose-600">
          {error}
        </p>
      </main>
    );
  if (!ready || !userId || verifiedUserId !== userId)
    return <main className="loading-shell">Loading equipment…</main>;
  return <div key={userId}>{children}</div>;
}
