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

  // 3. Render the data dynamically with professional Tailwind styling
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Section with Gradient */}
        <header className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-12 text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
            {profile.full_name || username}
          </h1>
          {profile.sport && (
            <span className="inline-block px-4 py-1 bg-blue-600/30 text-blue-200 rounded-full text-sm font-semibold tracking-widest uppercase border border-blue-500/30">
              {profile.sport}
            </span>
          )}
        </header>

        <div className="p-8 sm:p-10">
          {/* Bio Section */}
          <section className="mb-12">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">
              Athlete Bio
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
              {profile.bio || "No biography available at this time."}
            </p>
          </section>

          {/* Stats Section */}
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">
              Performance Stats
            </h2>
            
            {profile.stats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {Object.entries(profile.stats).map(([statName, statValue]) => (
                  <div 
                    key={statName} 
                    className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                  >
                    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate mb-1">
                      {statName}
                    </dt>
                    <dd className="text-3xl font-bold text-slate-900">
                      {String(statValue)}
                    </dd>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 border border-dashed border-gray-200">
                Performance data has not been uploaded yet.
              </div>
            )}
          </section>
        </div>
      </article>
    </main>
  );
}