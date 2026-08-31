import Image from 'next/image';
import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70">
      <div className="page-shell flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/coachpoints-mark.png"
            alt=""
            width={36}
            height={36}
            className="size-9 rounded-xl object-cover"
          />
          <div>
            <p className="text-sm font-extrabold text-slate-950">CoachPoints</p>
            <p className="text-xs text-slate-500">Where performance meets opportunity.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand-700">
            Discover
          </Link>
          <Link href="/login?role=athlete" className="hover:text-brand-700">
            For athletes
          </Link>
          <Link href="/login?role=coach" className="hover:text-brand-700">
            For coaches
          </Link>
          <Link href="/privacy" className="hover:text-brand-700">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-brand-700">
            Terms of Agreement
          </Link>
          <span>© {new Date().getFullYear()} CoachPoints</span>
        </div>
      </div>
    </footer>
  );
}
