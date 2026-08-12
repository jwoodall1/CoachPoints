'use client';
/* eslint-disable @next/next/no-img-element -- QR code is generated as a local data URL. */

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function ProfileShareCard({ username }: { username: string }) {
  const [url] = useState(() => typeof window === 'undefined' ? '' : `${window.location.origin}/${username}`);
  const [qrCode, setQrCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const profileUrl = `${window.location.origin}/${username}`;
    QRCode.toDataURL(profileUrl, { width: 280, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } }).then(setQrCode);
  }, [username]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Share this NextUp profile</p>
    <h2 className="mt-2 text-xl font-bold text-slate-950">Make your progress easy to find.</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">Share the link or scan the code to open this public athlete profile.</p>
    <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      <div className="grid size-36 place-items-center rounded-2xl bg-white p-2 shadow-sm">{qrCode ? <img src={qrCode} alt={`QR code for ${username}'s StatCard`} className="size-full" /> : <span className="text-xs text-slate-400">Loading QR…</span>}</div>
      <div className="min-w-0 flex-1 self-stretch"><p className="mb-2 text-sm font-semibold text-slate-700">Profile link</p><div className="flex gap-2"><input readOnly value={url} aria-label="Public profile link" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none" /><button type="button" disabled={!url} onClick={copyLink} className="shrink-0 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">{copied ? 'Copied!' : 'Copy'}</button></div></div>
    </div>
  </aside>;
}
