'use client';

import { CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useState } from 'react';

export type ReadinessCheck = { label: string; detail: string; complete: boolean; weight: number };

type ProfileReadinessPopupProps = {
  checks: ReadinessCheck[];
  points: number;
  recruiterReady: boolean;
  variant: 'athlete' | 'coach';
};

/** Compact, collapsible setup helper shared by athlete and coach dashboards. */
export default function ProfileReadinessPopup({ checks, points, recruiterReady, variant }: ProfileReadinessPopupProps) {
  const [expanded, setExpanded] = useState(false);
  const nextSteps = checks.filter((check) => !check.complete).slice(0, 3);
  const athlete = variant === 'athlete';
  const accent = athlete ? 'brand' : 'emerald';

  return <aside className={`fixed bottom-5 right-5 z-30 w-[min(390px,calc(100vw-2rem))] rounded-3xl border bg-white/95 shadow-2xl backdrop-blur-xl ${athlete ? 'border-brand-200 shadow-brand-950/15' : 'border-emerald-200 shadow-emerald-950/15'}`} aria-label="Profile readiness helper">
    <div className="flex items-center gap-3 p-4"><span className={`grid size-9 shrink-0 place-items-center rounded-xl ${athlete ? 'bg-brand-100 text-brand-700' : 'bg-emerald-100 text-emerald-700'}`}><Sparkles className="size-4" /></span><button type="button" onClick={() => setExpanded((value) => !value)} className="min-w-0 flex-1 text-left"><span className={`block text-[10px] font-extrabold uppercase tracking-[0.16em] ${athlete ? 'text-brand-700' : 'text-emerald-700'}`}>Profile readiness</span><span className="mt-0.5 block truncate text-sm font-black text-slate-950">{recruiterReady ? 'Recruiter-ready profile' : `${points}% complete`}</span></button><button type="button" onClick={() => setExpanded((value) => !value)} className="grid size-9 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={expanded ? 'Collapse profile readiness helper' : 'Expand profile readiness helper'}>{expanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}</button></div>
    {expanded && <div className="border-t border-slate-100 px-4 pb-4 pt-3"><p className="text-xs leading-5 text-slate-600">{recruiterReady ? (athlete ? 'Your essential recruiting information is covered. Keep your profile current as your season develops.' : 'Your public presence gives athletes the context and contact options they need.') : (athlete ? 'Complete the essentials so recruiters can understand who you are, what you play, and how to evaluate your game.' : 'Complete your public profile so athletes can understand your program and feel confident connecting.')}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${athlete ? 'Athlete' : 'Coach'} profile completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={points}><div className={`h-full rounded-full transition-all ${accent === 'brand' ? 'bg-gradient-to-r from-brand-600 to-emerald-500' : 'bg-gradient-to-r from-emerald-600 to-brand-500'}`} style={{ width: `${points}%` }} /></div><p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Next best steps</p>{nextSteps.length ? <ul className="mt-2 space-y-2">{nextSteps.map((step) => <li key={step.label} className="flex gap-2"><Circle className="mt-0.5 size-3.5 shrink-0 text-slate-300" /><span><strong className="block text-xs font-bold text-slate-800">{step.label}</strong><span className="block text-[11px] leading-4 text-slate-500">{step.detail}</span></span></li>)}</ul> : <div className="mt-2 flex gap-2 text-xs font-semibold text-emerald-700"><CheckCircle2 className="size-4 shrink-0" />Everything important is covered.</div>}<div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-slate-100 pt-3">{checks.map((check) => <div key={check.label} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">{check.complete ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Circle className="size-3.5 text-slate-300" />}{check.label}</div>)}</div></div>}
  </aside>;
}
