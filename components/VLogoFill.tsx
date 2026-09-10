"use client";

/**
 * VLogoFill — "liquid fill" rouge sur le logo V du header.
 *
 * Le logo V existant est un CANVAS (électrique, pulsant rouge/blanc) basé sur
 * l'extraction de pixels du PNG /NV-IMG/V.png. On réutilise la MÊME forme
 * (même extraction pixels, mêmes seuils) : on ne dessine que la couche
 * "liquide" ROUGE, clipée par un rectangle qui monte du bas vers le haut
 * selon fillProgress (0 → vide, 100 → plein). La forme blanche "verre" est
 * portée par le VLogo électrique situé dessous.
 *
 * Dessin uniquement sur changement de fillProgress (aucun rAF continu) → GPU-cheap.
 */
import { useEffect, useRef } from "react";

type VLogoFillProps = {
  fillProgress: number; // 0 à 100
  className?: string;
  src?: string;
};

const THRESHOLD = 55;

export default function VLogoFill({
  fillProgress,
  className,
  src = "/NV-IMG/V.png",
}: VLogoFillProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Uint8ClampedArray | null>(null);

  // Extraction des pixels du V (same shape que VLogo).
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = src;
    let cancelled = false;

    const extract = () => {
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      if (!W || !H) return;

      const MAX_RES = 384;
      const s = Math.min(1, MAX_RES / Math.max(W, H));
      const rw = Math.max(1, Math.round(W * s));
      const rh = Math.max(1, Math.round(H * s));

      canvasEl.width = rw;
      canvasEl.height = rh;

      ctx.clearRect(0, 0, rw, rh);
      ctx.drawImage(img, 0, 0, rw, rh);

      const imageData = ctx.getImageData(0, 0, rw, rh);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const brightness = data[i] + data[i + 1] + data[i + 2];
        if (brightness < THRESHOLD) {
          data[i + 3] = 0;
        } else if (brightness < THRESHOLD * 2) {
          data[i + 3] = Math.round(
            (255 * (brightness - THRESHOLD)) / THRESHOLD
          );
        }
      }

      pixelsRef.current = new Uint8ClampedArray(data);
      ctx.putImageData(imageData, 0, 0);
      if (!cancelled) redraw();
    };

    const onLoad = () => {
      if (img.complete && img.naturalWidth > 0) extract();
    };

    if (img.complete && img.naturalWidth > 0) {
      extract();
    } else {
      img.onload = onLoad;
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Redessin quand la progression change.
  useEffect(() => {
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillProgress]);

  function redraw() {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const W = canvasEl.width;
    const H = canvasEl.height;
    const srcP = pixelsRef.current;
    if (!W || !H || !srcP) return;

    ctx.clearRect(0, 0, W, H);

    const p = Math.max(0, Math.min(100, fillProgress));
    if (p <= 0) return;

    const fillH = (H * p) / 100;
    if (fillH <= 0) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, H - fillH, W, fillH);
    ctx.clip();

    const imgData = ctx.createImageData(W, H);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const a = srcP[i + 3];
      if (a > 0) {
        d[i] = 220;
        d[i + 1] = 38;
        d[i + 2] = 38;
        d[i + 3] = a;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    ctx.restore();
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{
        filter:
          fillProgress > 0
            ? "drop-shadow(0 0 10px rgba(220,38,38,0.6))"
            : "none",
      }}
    />
  );
}