'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | undefined>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // No active session found, redirect to login
        router.push('/login');
      } else {
        setUserEmail(session.user.email);
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium animate-pulse">Verifying credentials...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Athlete Dashboard</h1>
            <p className="text-gray-500 text-sm">Logged in as: <span className="font-semibold text-slate-700">{userEmail}</span></p>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </header>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-64 flex flex-col items-center justify-center">
             <p className="text-gray-400 font-medium">Profile Editor (Coming Soon)</p>
          </section>

          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-64 flex flex-col items-center justify-center">
             <p className="text-gray-400 font-medium">Stats Manager (Coming Soon)</p>
          </section>
        </div>

      </div>
    </main>
  );
}