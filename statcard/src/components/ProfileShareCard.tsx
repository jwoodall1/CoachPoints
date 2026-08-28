'use client';
/* eslint-disable @next/next/no-img-element -- QR code is generated as a local data URL. */

import { Check, Copy, QrCode, Share2, X } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { trackEvent } from '@/lib/analytics';

const subscribeToOrigin = () => () => undefined;

/** Copy and QR sharing tools for a public CoachPoints profile. */
export default function ProfileShareCard({ username }: { username: string }) {
  const origin = useSyncExternalStore(subscribeToOrigin, () => window.location.origin, () => '');
  const url = origin ? `${origin}/${username}` : '';
  const [qrCode, setQrCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isQrExpanded, setIsQrExpanded] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!url) return;
    let active = true;
    void import('qrcode').then(({ default: QRCode }) => QRCode.toDataURL(url, { width: 280, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })).then((dataUrl) => { if (active) setQrCode(dataUrl); });
    return () => { active = false; };
  }, [url]);
  useEffect(() => {
    if (!isQrExpanded) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsQrExpanded(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [isQrExpanded]);
  useEffect(() => () => { if (copyTimer.current) window.clearTimeout(copyTimer.current); }, []);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    trackEvent('profile_share_action', { action: 'copy_link' });
    setCopied(true);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return <aside className="surface-card overflow-hidden"><div className="border-b border-slate-100 bg-gradient-to-br from-brand-50 to-white p-6"><div className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/20"><Share2 className="size-4.5" /></div><h2 className="mt-4 text-lg font-black tracking-tight text-slate-950">Share this profile</h2><p className="mt-2 text-sm leading-6 text-slate-500">Make this CoachPoints profile easy for coaches, teammates, and family to find.</p></div><div className="p-6"><div className="mx-auto grid size-40 place-items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">{qrCode ? <img src={qrCode} alt={`QR code for ${username}'s CoachPoints profile`} className="size-full" /> : <span className="text-xs font-semibold text-slate-400">Generating QR…</span>}</div><button type="button" disabled={!qrCode} onClick={() => setIsQrExpanded(true)} className="mt-3 flex w-full items-center justify-center gap-2 text-xs font-extrabold text-brand-700 hover:text-brand-900 disabled:opacity-50"><QrCode className="size-3.5" />Expand QR code</button><div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-1.5"><p className="truncate px-2 py-1 text-xs font-medium text-slate-500">{url || 'Loading profile link…'}</p><button type="button" disabled={!url} onClick={copyLink} className="mt-1 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-50">{copied ? <><Check className="size-3.5 text-emerald-300" />Copied to clipboard</> : <><Copy className="size-3.5" />Copy profile link</>}</button></div></div>{isQrExpanded && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Expanded profile QR code" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsQrExpanded(false); }}><div className="relative w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl"><button type="button" onClick={() => setIsQrExpanded(false)} className="absolute right-3 top-3 grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close expanded QR code"><X className="size-5" /></button><h3 className="pr-8 text-lg font-black text-slate-950">Scan @{username}</h3><p className="mt-1 text-sm text-slate-500">Open this CoachPoints profile instantly.</p>{qrCode && <img src={qrCode} alt={`Expanded QR code for ${username}'s CoachPoints profile`} className="mx-auto mt-5 size-72 max-w-full rounded-xl" />}<button type="button" onClick={() => setIsQrExpanded(false)} className="btn-dark mt-5 w-full">Done</button></div></div>}</aside>;
}
