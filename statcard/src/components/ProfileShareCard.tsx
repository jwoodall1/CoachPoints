'use client';
/* eslint-disable @next/next/no-img-element -- QR code is generated as a local data URL. */

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

const subscribeToOrigin = () => () => undefined;

/** Generates copyable profile links and QR codes after the page hydrates. */
export default function ProfileShareCard({ username }: { username: string }) {
  // The server snapshot avoids a server/client hydration mismatch around window.location.
  const origin = useSyncExternalStore(subscribeToOrigin, () => window.location.origin, () => '');
  const url = origin ? `${origin}/${username}` : '';
  const [qrCode, setQrCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isQrExpanded, setIsQrExpanded] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!url) return;
    let active = true;

    // QRCode is loaded on demand so its implementation stays out of initial page JS.
    void import('qrcode')
      .then(({ default: QRCode }) => QRCode.toDataURL(url, { width: 280, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } }))
      .then((dataUrl) => {
        if (active) setQrCode(dataUrl);
      });

    return () => {
      active = false;
    };
  }, [url]);

  useEffect(() => {
    if (!isQrExpanded) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsQrExpanded(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isQrExpanded]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
  };

  useEffect(() => () => {
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
  }, []);

  return <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Share this NextUp profile</p>
    <h2 className="mt-2 text-xl font-bold text-slate-950">Make your progress easy to find.</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">Share the link or scan the code to open this public athlete profile.</p>
    <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      <div className="flex shrink-0 flex-col items-center gap-2"><div className="grid size-36 place-items-center rounded-2xl bg-white p-2 shadow-sm">{qrCode ? <img src={qrCode} alt={`QR code for ${username}'s StatCard`} className="size-full" /> : <span className="text-xs text-slate-400">Loading QR…</span>}</div><button type="button" disabled={!qrCode} onClick={() => setIsQrExpanded(true)} className="text-xs font-semibold text-blue-700 transition hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-50">Expand QR code</button></div>
      <div className="min-w-0 flex-1 self-stretch"><p className="mb-2 text-sm font-semibold text-slate-700">Profile link</p><div className="flex gap-2"><input readOnly value={url} aria-label="Public profile link" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none" /><button type="button" disabled={!url} onClick={copyLink} className="shrink-0 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">{copied ? 'Copied!' : 'Copy'}</button></div></div>
    </div>
    {isQrExpanded && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Expanded profile QR code" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsQrExpanded(false); }}><div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"><button type="button" onClick={() => setIsQrExpanded(false)} className="absolute right-3 top-3 rounded-lg px-3 py-1 text-2xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close expanded QR code">×</button><h3 className="pr-8 text-lg font-bold text-slate-950">Scan {username}&apos;s profile</h3><p className="mt-1 text-sm text-slate-500">Point your camera at the QR code.</p>{qrCode && <img src={qrCode} alt={`Expanded QR code for ${username}'s StatCard`} className="mx-auto mt-5 size-72 max-w-full rounded-xl" />}<button type="button" onClick={() => setIsQrExpanded(false)} className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">Done</button></div></div>}
  </aside>;
}
