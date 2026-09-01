'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { safeHudlEmbedUrl } from '@/lib/safeExternalUrl';

type HudlHighlightProps = {
  primaryUrl: string | null | undefined;
  secondaryUrls?: string[] | null;
};

/** Embeds a responsive Hudl player only when the profile supplies a URL. */
export default function HudlHighlight({ primaryUrl, secondaryUrls = [] }: HudlHighlightProps) {
  const urls = [primaryUrl, ...(secondaryUrls ?? [])]
    .map(safeHudlEmbedUrl)
    .filter((url): url is string => Boolean(url));
  const [activeIndex, setActiveIndex] = useState(0);
  if (!urls.length) return null;
  const activeUrl = urls[activeIndex] ?? urls[0];

  return (
    <div>
      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950 pb-[56.25%]">
        <iframe
          src={activeUrl}
          title={`Hudl highlight ${activeIndex + 1}`}
          className="absolute inset-0 size-full"
          frameBorder="0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allowFullScreen
        />
      </div>
      {urls.length > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setActiveIndex((index) => (index - 1 + urls.length) % urls.length)}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Previous Hudl highlight"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="min-w-0 text-center">
            <div className="flex justify-center gap-1.5" aria-label="Hudl highlights">
              {urls.map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`size-2 rounded-full transition ${index === activeIndex ? 'bg-brand-600' : 'bg-slate-300 hover:bg-slate-400'}`}
                  aria-label={`Show Hudl highlight ${index + 1}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveIndex((index) => (index + 1) % urls.length)}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Next Hudl highlight"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
