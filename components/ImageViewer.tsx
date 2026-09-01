"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent, type WheelEvent as RWheelEvent } from "react";
import type { TabletImage } from "@/types/tablet";
import { imagePath } from "@/lib/base-path";

const MIN_SCALE = 0.5;
const MAX_SCALE = 6;

export function ImageViewer({ images }: { images: TabletImage[] }) {
  const [index, setIndex] = useState(-1);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const reset = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  const open = (i: number) => {
    setIndex(i);
    reset();
  };
  const close = () => setIndex(-1);

  useEffect(() => {
    if (index < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, images.length]);

  const zoomBy = (factor: number) => {
    setScale((s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s * factor)));
  };

  if (images.length === 0) return null;

  const current = images[index];
  const shown = index >= 0 && current;

  const onPointerDown = (e: RPointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, tx, ty };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: RPointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setTx(dragRef.current.tx + dx);
    setTy(dragRef.current.ty + dy);
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };
  const onWheel = (e: RWheelEvent) => {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15);
  };

  return (
    <>
      {/* 缩略图触发 */}
      {images.map((img, i) => (
        <button
          key={i}
          type="button"
          onClick={() => open(i)}
          className="group relative block w-full overflow-hidden rounded-md border border-ink-200 bg-paper-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePath(img.path)}
            alt={img.caption || `碑刻图片 ${i + 1}`}
            loading="lazy"
            className="w-full object-contain max-h-72 transition group-hover:opacity-90"
          />
          <span className="absolute bottom-2 right-2 rounded bg-ink-800/70 px-2 py-1 text-xs text-paper-50">
            点击放大
          </span>
        </button>
      ))}

      {/* 大图查看器 */}
      {shown && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-ink-900/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="碑刻图片查看器"
        >
          <div className="flex items-center justify-between px-4 py-3 text-paper-50">
            <div className="text-sm text-paper-100/80">
              {index + 1} / {images.length}
              {current.caption ? ` · ${current.caption}` : ""}
            </div>
            <button
              onClick={close}
              className="rounded px-3 py-1.5 text-lg leading-none hover:bg-ink-700"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>

          <div
            className="relative flex-1 touch-none overflow-hidden cursor-grab active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onWheel={onWheel}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePath(current.path)}
              alt={current.caption || "碑刻图片"}
              draggable={false}
              className="absolute left-1/2 top-1/2 max-h-[85vh] max-w-[95vw] select-none"
              style={{
                transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${scale})`,
                transition: dragRef.current ? "none" : "transform 0.15s ease-out",
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-3">
            <button
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
              disabled={images.length <= 1}
              className="rounded bg-ink-700 px-4 py-2 text-paper-50 hover:bg-ink-600 disabled:opacity-40"
            >
              ← 上一张
            </button>
            <button
              onClick={() => zoomBy(1 / 1.3)}
              className="rounded bg-ink-700 px-3 py-2 text-paper-50 hover:bg-ink-600"
            >
              −
            </button>
            <button
              onClick={() => zoomBy(1.3)}
              className="rounded bg-ink-700 px-3 py-2 text-paper-50 hover:bg-ink-600"
            >
              +
            </button>
            <button
              onClick={reset}
              className="rounded bg-ink-700 px-3 py-2 text-paper-50 hover:bg-ink-600"
            >
              重置
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              disabled={images.length <= 1}
              className="rounded bg-ink-700 px-4 py-2 text-paper-50 hover:bg-ink-600 disabled:opacity-40"
            >
              下一张 →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
