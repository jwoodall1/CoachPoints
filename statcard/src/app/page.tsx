import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          StatCard
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
          The modern platform for athletes to build, manage, and share their digital profiles.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link 
            href="/login" 
            className="bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}