'use client';
/* eslint-disable @next/next/no-img-element -- this is a Supabase Storage public URL. */

import { useState } from 'react';

export default function ProfileAvatar({ src, name, size = 'large' }: { src: string; name: string; size?: 'small' | 'large' }) {
  const [unavailable, setUnavailable] = useState(false);
  const dimensions = size === 'large' ? 'size-20 text-3xl' : 'size-20 text-xl';
  return <div className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 font-bold text-slate-400 ${dimensions}`}>{!unavailable && <img src={src} alt={`${name}'s profile`} className="size-full object-cover" onError={() => setUnavailable(true)} />}{unavailable && name.charAt(0).toUpperCase()}</div>;
}
