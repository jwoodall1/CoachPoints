type HudlHighlightProps = {
  url: string | null | undefined;
};

/** Converts a public Hudl URL into the equivalent embeddable player URL. */
function formatHudlEmbedUrl(url: string) {
  const secureUrl = url.replace(/^http:\/\//i, 'https://');
  if (secureUrl.includes('/embed/')) return secureUrl;
  if (secureUrl.includes('/video/')) return secureUrl.replace('/video/', '/embed/video/');
  return secureUrl.replace('/v/', '/embed/v/');
}

/** Embeds a responsive Hudl player only when the profile supplies a URL. */
export default function HudlHighlight({ url }: HudlHighlightProps) {
  if (!url?.trim()) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950 pb-[56.25%]">
      <iframe
        src={formatHudlEmbedUrl(url.trim())}
        title="Hudl highlight reel"
        className="absolute inset-0 size-full"
        frameBorder="0"
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
}
