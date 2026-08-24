"use client";

import { useRef, useState } from "react";
import {
  DEFAULT_IMAGE_BG,
  normalizeHex,
  openSystemEyedropper,
  pickColorAtPoint,
  sampleImageBackground,
} from "@/lib/image-bg";

export function ImageBgPicker({
  imageSrc,
  value,
  onChange,
}: {
  imageSrc: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);

  async function autoDetect() {
    if (!imageSrc) return;
    setBusy(true);
    try {
      onChange(await sampleImageBackground(imageSrc));
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  async function eyedropper() {
    setBusy(true);
    try {
      const color = await openSystemEyedropper();
      if (color) onChange(color);
      else setPicking(true);
    } catch {
      setPicking(true);
    } finally {
      setBusy(false);
    }
  }

  function onPreviewClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (!picking || !imgRef.current) return;
    onChange(pickColorAtPoint(imgRef.current, e.clientX, e.clientY, e.currentTarget.getBoundingClientRect()));
    setPicking(false);
  }

  return (
    <div className="mt-4 rounded-lg border border-line bg-sand/40 p-4">
      <p className="field-label">Фон под фото в каталоге</p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">
        Подберите цвет фона packshot — карточка на сайте совпадёт с фото. Кликните по превью или используйте пипетку.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <input
            type="color"
            value={normalizeHex(value)}
            onChange={(e) => onChange(normalizeHex(e.target.value))}
            className="h-10 w-10 cursor-pointer rounded border border-line bg-paper p-0.5"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(normalizeHex(e.target.value))}
            placeholder={DEFAULT_IMAGE_BG}
            className="field !w-[108px] !py-2 font-mono text-[13px]"
            spellCheck={false}
          />
        </label>

        <button type="button" className="btn btn-soft btn-sm" disabled={!imageSrc || busy} onClick={autoDetect}>
          С фото
        </button>
        <button type="button" className="btn btn-soft btn-sm" disabled={busy} onClick={eyedropper}>
          Пипетка
        </button>
        <button
          type="button"
          className={`btn btn-soft btn-sm ${picking ? "ring-2 ring-olive" : ""}`}
          disabled={!imageSrc}
          onClick={() => setPicking((v) => !v)}
        >
          {picking ? "Кликните по фото…" : "С превью"}
        </button>
      </div>

      {imageSrc && (
        <button
          type="button"
          onClick={onPreviewClick}
          className={`relative mt-3 block h-[120px] w-full max-w-[200px] overflow-hidden rounded-card border border-line ${
            picking ? "cursor-crosshair ring-2 ring-olive" : "cursor-default"
          }`}
          style={{ backgroundColor: value }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imgRef} src={imageSrc} alt="" className="h-full w-full object-contain p-2" crossOrigin="anonymous" />
        </button>
      )}
    </div>
  );
}
