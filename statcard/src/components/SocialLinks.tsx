export type SocialLinks = {
  phoneNumber?: string | null;
  contactEmail?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  xUrl?: string | null;
};

type SocialLink = {
  label: string;
  url: string;
  color: string;
  icon: 'instagram' | 'tiktok' | 'youtube' | 'x';
};

function SocialIcon({ icon }: { icon: SocialLink['icon'] }) {
  if (icon === 'instagram') return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-[1.8]"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" className="fill-current stroke-none" /></svg>;
  if (icon === 'youtube') return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2C1.9 9 1.9 12 1.9 12s0 3 .5 4.8a2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2c.5-1.8.5-4.8.5-4.8s0-3-.5-4.8ZM10 15.2V8.8l5.5 3.2-5.5 3.2Z" /></svg>;
  if (icon === 'tiktok') return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current"><path d="M15.7 3h3.1c.2 1.7 1.1 3 2.7 3.7v3.2a8.2 8.2 0 0 1-2.7-1v6.4a6.1 6.1 0 1 1-6.1-6.1c.3 0 .6 0 .9.1v3.3a2.9 2.9 0 1 0 1.1 2.7V3Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current"><path d="m18.2 3-5.1 5.8L8.8 3H3l7.2 9.4L3.3 21h3.4l5.8-6.6 4.9 6.6H23l-7.6-9.9L21.7 3h-3.5Zm-1.2 16.1L6.8 4.8h1.5l10.2 14.3H17Z" /></svg>;
}

export default function SocialLinks({ links }: { links: SocialLinks }) {
  const phoneNumber = links.phoneNumber?.trim();
  const contactEmail = links.contactEmail?.trim();
  const socialLinks = ([
    { label: 'Instagram', url: links.instagramUrl ?? '', color: 'text-pink-200 hover:text-white', icon: 'instagram' },
    { label: 'TikTok', url: links.tiktokUrl ?? '', color: 'text-cyan-200 hover:text-white', icon: 'tiktok' },
    { label: 'YouTube', url: links.youtubeUrl ?? '', color: 'text-red-200 hover:text-white', icon: 'youtube' },
    { label: 'X', url: links.xUrl ?? '', color: 'text-slate-200 hover:text-white', icon: 'x' },
  ] satisfies SocialLink[]).filter(({ url }) => url.trim());

  if (!socialLinks.length && !phoneNumber && !contactEmail) return null;

  return <div className="mt-6 space-y-4">
    {(phoneNumber || contactEmail) && <div className="flex flex-wrap justify-center gap-2">
      {phoneNumber && <a href={`tel:${phoneNumber}`} className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-blue-50">☎ <span className="ml-2">{phoneNumber}</span></a>}
      {contactEmail && <a href={`mailto:${contactEmail}`} className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-blue-50">✉ <span className="ml-2">{contactEmail}</span></a>}
    </div>}
    {socialLinks.length > 0 && <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">{socialLinks.map(({ label, url, color, icon }) => <a key={label} href={url} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 text-xs font-semibold transition ${color}`}><SocialIcon icon={icon} /><span>{label}</span></a>)}</div>}
  </div>;
}
