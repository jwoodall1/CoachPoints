'use client';
/* eslint-disable @next/next/no-img-element -- the cropper requires a browser object URL. */

import { ChangeEvent, PointerEvent, useEffect, useRef, useState } from 'react';

type UploadModalProps = { isOpen: boolean; onClose: () => void; onSave: (image: string) => Promise<void> | void };
const CROP_SIZE = 280;
const OUTPUT_SIZE = 512;

/** Lets a user position a photo and exports the visible circle as a 512px PNG. */
export default function UploadModal({ isOpen, onClose, onSave }: UploadModalProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStart = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => { if (source) URL.revokeObjectURL(source); }, [source]);
  if (!isOpen) return null;

  const scale = naturalSize.width ? Math.max(CROP_SIZE / naturalSize.width, CROP_SIZE / naturalSize.height) * zoom : 1;
  const imageWidth = naturalSize.width * scale;
  const imageHeight = naturalSize.height * scale;
  const imageX = (CROP_SIZE - imageWidth) / 2 + offset.x;
  const imageY = (CROP_SIZE - imageHeight) / 2 + offset.y;
  const clampOffset = (next: { x: number; y: number }, nextZoom = zoom) => {
    if (!naturalSize.width || !naturalSize.height) return { x: 0, y: 0 };
    const nextScale = Math.max(CROP_SIZE / naturalSize.width, CROP_SIZE / naturalSize.height) * nextZoom;
    const maxX = Math.max(0, (naturalSize.width * nextScale - CROP_SIZE) / 2);
    const maxY = Math.max(0, (naturalSize.height * nextScale - CROP_SIZE) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, next.x)), y: Math.min(maxY, Math.max(-maxY, next.y)) };
  };
  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setError('Choose a JPG, PNG, or WebP image.');
    setSource(URL.createObjectURL(file)); setNaturalSize({ width: 0, height: 0 }); setZoom(1); setOffset({ x: 0, y: 0 }); setError(null);
  };
  // Draw the transformed preview into a clipped canvas before uploading it.
  const saveCrop = async () => {
    if (!source || !imageRef.current) return;
    setSaving(true);
    const canvas = document.createElement('canvas'); canvas.width = OUTPUT_SIZE; canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext('2d');
    if (!context) return setSaving(false);
    context.beginPath(); context.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2); context.clip();
    const ratio = OUTPUT_SIZE / CROP_SIZE;
    context.drawImage(imageRef.current, imageX * ratio, imageY * ratio, imageWidth * ratio, imageHeight * ratio);
    try {
      await onSave(canvas.toDataURL('image/png'));
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save your photo.');
    } finally {
      setSaving(false);
    }
  };
  const beginDrag = (event: PointerEvent<HTMLDivElement>) => { dragStart.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y }; event.currentTarget.setPointerCapture(event.pointerId); };
  const moveDrag = (event: PointerEvent<HTMLDivElement>) => { if (dragStart.current) setOffset(clampOffset({ x: dragStart.current.offsetX + event.clientX - dragStart.current.x, y: dragStart.current.offsetY + event.clientY - dragStart.current.y })); };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Edit profile photo">
    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-start justify-between"><div><h2 className="text-xl font-bold text-slate-950">Profile photo</h2><p className="mt-1 text-sm text-slate-500">Position and zoom your image inside the circle.</p></div><button type="button" onClick={onClose} className="rounded-lg px-2 text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Close">×</button></div>
      {!source ? <label className="grid cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center transition hover:border-blue-400 hover:bg-blue-50"><span className="text-sm font-semibold text-slate-800">Choose a photo</span><span className="mt-2 text-xs text-slate-500">JPG, PNG, or WebP</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile} /></label> : <><div onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={() => { dragStart.current = null; }} className="relative mx-auto size-70 cursor-grab overflow-hidden rounded-full bg-slate-200 shadow-inner active:cursor-grabbing touch-none"><img ref={imageRef} src={source} alt="Crop preview" draggable={false} onLoad={(event) => setNaturalSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} style={{ width: imageWidth, height: imageHeight, transform: `translate3d(${imageX}px, ${imageY}px, 0)` }} className="pointer-events-none absolute left-0 top-0 max-w-none select-none will-change-transform" /></div><label className="mx-auto mt-6 block max-w-70 text-sm font-semibold text-slate-700">Zoom<input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => { const nextZoom = Number(event.target.value); setZoom(nextZoom); setOffset((current) => clampOffset(current, nextZoom)); }} className="mt-3 w-full accent-blue-600" /></label><label className="mt-4 block text-center text-sm font-semibold text-blue-600 hover:text-blue-700"><span>Choose a different photo</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile} /></label></>}
      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}<div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancel</button><button type="button" disabled={!source || saving} onClick={saveCrop} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Use photo'}</button></div>
    </div>
  </div>;
}
