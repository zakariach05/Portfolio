"use client";

/**
 * VLogo — Logo "V" électrique (portage React de legacy/js/v-logo.js).
 *
 * Anime un canvas à partir des pixels du PNG source :
 *  - retrait du fond noir
 *  - pulsing rouge → blanc (t = |sin|), flash aléatoire + éclair
 *  - étincelles, léger jitter et parallaxe souris
 *
 * Utilisé sur : splash, header, section contact (mêmes options que l'original).
 */
import { useEffect, useRef } from "react";

type VLogoProps = {
  src: string;
  canvasId?: string;
  className?: string;
  style?: React.CSSProperties;
  glowScale?: number;
  jitterStrength?: number;
  moveStrength?: number;
};

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

export default function VLogo({
  src,
  canvasId,
  className,
  style,
  glowScale = 1,
  jitterStrength = 5,
  moveStrength = 20,
}: VLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const canvas = canvasEl;
    const ctxt = ctx;

    // Mobile (coarse + largeur ≤767 ; le headless PSI ne remonte pas coarse) :
    // pas de boucle rAF 60fps sur un canvas dans le header → logo statique
    // (une image dessinée + son glow rouge). Gros gain Style & Layout / CPU.
    const mobile =
      window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;

    const img = new Image();
    img.src = src;

    let originalPixels: Uint8ClampedArray | null = null;
    let animFrameId = 0;
    let isVisible = true;
    let sparks: Spark[] = [];

    // ── Visibilité (pause hors viewport, comme l'original) ──
    let io: IntersectionObserver | null = null;
    if (!mobile && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0].isIntersecting;
        },
        { rootMargin: "150px" }
      );
      io.observe(canvas);
    }

    // ── Parallaxe souris (fine pointers uniquement) ──
    let mouseX = 0,
      mouseY = 0,
      targetX = 0,
      targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      targetY =
        (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };

    if (
      window.matchMedia(
        "(pointer: fine), (min-width: 768px)"
      ).matches
    ) {
      window.addEventListener("mousemove", onMouseMove);
    }

    // ── Extraction des pixels ──
    function extractPixels() {
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      if (!W || !H) return;

      const MAX_RES = 384;
      const s = Math.min(1, MAX_RES / Math.max(W, H));
      const rw = Math.max(1, Math.round(W * s));
      const rh = Math.max(1, Math.round(H * s));

      canvas.width = rw;
      canvas.height = rh;

      ctxt.clearRect(0, 0, rw, rh);
      ctxt.drawImage(img, 0, 0, rw, rh);

      const imageData = ctxt.getImageData(0, 0, rw, rh);
      const data = imageData.data;
      const THRESHOLD = 55;

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

      originalPixels = new Uint8ClampedArray(data);
      ctxt.putImageData(imageData, 0, 0);

      const g = glowScale;
      canvas.style.filter =
        `drop-shadow(0 0 ${15 * g}px rgba(255,0,0,0.85)) ` +
        `drop-shadow(0 0 ${30 * g}px rgba(255,50,50,0.6))`;

      // Mobile : une seule image statique, pas de boucle d'animation.
      if (mobile) return;

      animFrameId = requestAnimationFrame(animateColor);
    }

    // ── Animation couleur + jitter + éclairs + étincelles ──
    function animateColor(timestamp: number) {
      if (!originalPixels) return;

      if (!isVisible) {
        animFrameId = requestAnimationFrame(animateColor);
        return;
      }

      const W = canvas.width;
      const H = canvas.height;

      mouseX += (targetX - mouseX) * 0.1;
      mouseY += (targetY - mouseY) * 0.1;

      const jX = (Math.random() - 0.5) * jitterStrength;
      const jY = (Math.random() - 0.5) * jitterStrength;
      canvas.style.transform =
        `translate(${mouseX * moveStrength + jX}px, ${
          mouseY * moveStrength + jY
        }px) ` + `rotate(${mouseX * 10}deg) scale(1.02)`;

      let t = Math.abs(Math.sin((timestamp / 400) * Math.PI));
      const isFlash = Math.random() < 0.08;
      if (isFlash) t = 1.2;

      const baseR = 180,
        baseG = 0,
        baseB = 0;
      const hitR = 255,
        hitG = 200,
        hitB = 200;

      const imageData = ctxt.createImageData(W, H);
      const data = imageData.data;
      const srcP = originalPixels;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = srcP[i + 3];
        if (alpha > 0) {
          data[i] = Math.min(255, baseR + (hitR - baseR) * t);
          data[i + 1] = Math.min(255, baseG + (hitG - baseG) * t);
          data[i + 2] = Math.min(255, baseB + (hitB - baseB) * t);
          data[i + 3] = alpha;
        }
      }

      ctxt.putImageData(imageData, 0, 0);

      if (isFlash) {
        drawLightningFlash(ctxt, W, H);
        for (let k = 0; k < 5; k++) {
          sparks.push({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 40,
            vy: (Math.random() - 0.5) * 40,
            life: 1,
          });
        }
      }

      drawSparks(ctxt);

      animFrameId = requestAnimationFrame(animateColor);
    }

    function drawLightningFlash(
      c: CanvasRenderingContext2D,
      W: number,
      H: number
    ) {
      c.save();
      c.globalCompositeOperation = "screen";
      c.lineCap = "round";

      let x = W * 0.5 + (Math.random() - 0.5) * 150;
      let y = 0;
      const endX = W * 0.5 + (Math.random() - 0.5) * 150;
      const endY = H;

      c.beginPath();
      c.moveTo(x, y);
      const steps = 8;
      for (let i = 0; i < steps; i++) {
        x += (endX - x) / (steps - i) + (Math.random() - 0.5) * 60;
        y += endY / steps;
        c.lineTo(x, y);
      }
      c.shadowBlur = 30;
      c.shadowColor = "#ff0000";
      c.strokeStyle = "#ffffff";
      c.lineWidth = 2 + Math.random() * 4;
      c.stroke();

      if (Math.random() > 0.5) {
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + (Math.random() - 0.5) * 100, y + 50);
        c.lineWidth = 1;
        c.stroke();
      }
      c.restore();
    }

    function drawSparks(c: CanvasRenderingContext2D) {
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.1;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        c.save();
        c.globalCompositeOperation = "screen";
        c.fillStyle = "#ffffff";
        c.shadowBlur = 10;
        c.shadowColor = "#ff0000";
        c.globalAlpha = s.life;
        c.beginPath();
        c.arc(s.x, s.y, Math.random() * 3 + 1, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    if (img.complete && img.naturalWidth > 0) {
      extractPixels();
    } else {
      img.onload = extractPixels;
    }

    return () => {
      cancelAnimationFrame(animFrameId);
      if (io) io.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [src, glowScale, jitterStrength, moveStrength]);

  return <canvas ref={canvasRef} id={canvasId} className={className} style={style} />;
}