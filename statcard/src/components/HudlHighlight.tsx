'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

type HudlHighlightProps = {
  primaryUrl: string | null | undefined;
  secondaryUrls?: string[] | null;
};

/** Converts a public Hudl URL into the equivalent embeddable player URL. */
function formatHudlEmbedUrl(url: string) {
  const secureUrl = url.replace(/^http:\/\//i, 'https://');
  if (secureUrl.includes('/embed/')) return secureUrl;
  if (secureUrl.includes('/video/')) return secureUrl.replace('/video/', '/embed/video/');
  return secureUrl.replace('/v/', '/embed/v/');
}

/** Embeds a responsive Hudl player only when the profile supplies a URL. */
export default function HudlHighlight({ primaryUrl, secondaryUrls = [] }: HudlHighlightProps) {
  const urls = [primaryUrl, ...(secondaryUrls ?? [])].filter((url): url is string => Boolean(url?.trim()));
  const [activeIndex, setActiveIndex] = useState(0);
  if (!urls.length) return null;
  const activeUrl = urls[activeIndex] ?? urls[0];

  return (
    <div>
      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950 pb-[56.25%]">
      <iframe
        src={formatHudlEmbedUrl(activeUrl.trim())}
        title={`Hudl highlight ${activeIndex + 1}`}
        className="absolute inset-0 size-full"
        frameBorder="0"
        loading="lazy"
        allowFullScreen
      />
      </div>
      {urls.length > 1 && <div className="mt-4 flex items-center justify-between gap-3"><button type="button" onClick={() => setActiveIndex((index) => (index - 1 + urls.length) % urls.length)} className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50" aria-label="Previous Hudl highlight"><ChevronLeft className="size-5" /></button><div className="min-w-0 text-center"><p className="text-sm font-extrabold text-slate-800">{activeIndex === 0 ? 'Primary highlight' : `Secondary highlight ${activeIndex}`}</p><div className="mt-2 flex justify-center gap-1.5" aria-label="Hudl highlights">{urls.map((url, index) => <button key={`${url}-${index}`} type="button" onClick={() => setActiveIndex(index)} className={`size-2 rounded-full transition ${index === activeIndex ? 'bg-brand-600' : 'bg-slate-300 hover:bg-slate-400'}`} aria-label={`Show Hudl highlight ${index + 1}`} aria-current={index === activeIndex ? 'true' : undefined} />)}</div></div><button type="button" onClick={() => setActiveIndex((index) => (index + 1) % urls.length)} className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50" aria-label="Next Hudl highlight"><ChevronRight className="size-5" /></button></div>}
    </div>
  );
}
