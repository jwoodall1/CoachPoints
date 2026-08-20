'use client';
/* eslint-disable @next/next/no-img-element -- unknown legacy avatar hosts bypass Next's allowlist. */

import Image from 'next/image';
import { useState } from 'react';

type ProfileAvatarProps = {
  name: string;
  preload?: boolean;
  size?: 'small' | 'large';
  src: string;
};

const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').origin;
  } catch {
    return '';
  }
})();

function canOptimizeAvatar(src: string) {
  return src.startsWith('/') || Boolean(supabaseOrigin && src.startsWith(`${supabaseOrigin}/storage/v1/object/public/avatars/`));
}

/** Renders an optimized Supabase avatar and falls back to the person's initial. */
export default function ProfileAvatar({ src, name, size = 'large', preload = false }: ProfileAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const unavailable = failedSrc === src;
  const dimensions = size === 'large' ? 'size-20 text-3xl' : 'size-20 text-xl';
  return <div className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 font-bold text-slate-400 ${dimensions}`}>{!unavailable && (canOptimizeAvatar(src) ? <Image src={src} alt={`${name}'s profile`} fill sizes="80px" className="object-cover" onError={() => setFailedSrc(src)} preload={preload} /> : <img src={src} alt={`${name}'s profile`} className="size-full object-cover" onError={() => setFailedSrc(src)} />)}{unavailable && name.charAt(0).toUpperCase()}</div>;
}
