import Image from "next/image";

import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

// Initialize the Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// In Next.js App Router, dynamic route parameters are passed as 'params'
export default async function AthleteProfile({ params }: { params: { username: string } }) {
  // 1. Read the parameter from the URL
  const { username } = params;

  // 2. Query Supabase for the profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name, sport, bio, stats')
    .eq('username', username)
    .single();

  // If the query fails or no user is found, trigger the Next.js 404 page
  if (error || !profile) {
    notFound();
  }

  // 3. Render the data dynamically
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-4xl font-bold">{profile.full_name || username}</h1>
        {profile.sport && <p className="text-xl text-gray-600">{profile.sport}</p>}
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Bio</h2>
        <p className="text-gray-800 whitespace-pre-wrap">
          {profile.bio || "This athlete hasn't added a bio yet."}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Stats</h2>
        {/* Supabase returns jsonb as a parsed JavaScript object */}
        {profile.stats ? (
          <ul className="grid grid-cols-2 gap-4">
            {Object.entries(profile.stats).map(([statName, statValue]) => (
              <li key={statName} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                <span className="block font-bold text-gray-500 text-sm uppercase tracking-wider">
                  {statName}
                </span>
                <span className="block text-3xl font-semibold mt-1">
                  {String(statValue)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No stats available.</p>
        )}
      </section>
    </main>
  );
}