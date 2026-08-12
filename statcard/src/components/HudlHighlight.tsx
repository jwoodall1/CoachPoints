type HudlHighlightProps = {
  url: string | null | undefined;
};

function formatHudlEmbedUrl(url: string) {
  return url.includes('/embed/') ? url : url.replace('/video/', '/embed/video/');
}

export default function HudlHighlight({ url }: HudlHighlightProps) {
  if (!url?.trim()) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950 pb-[56.25%]">
      <iframe
        src={formatHudlEmbedUrl(url.trim())}
        title="Hudl highlight reel"
        className="absolute inset-0 size-full"
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
}
