"use client";

/**
 * lib/heroVideo.ts — sélection et chargement de la vidéo d'arrière-plan du hero.
 *
 * Objectifs :
 *  - CDN d'abord (Cloudflare Stream / Bunny / Cloudinary), fallback serveur local.
 *  - WebM (VP9) préféré quand supporté, fallback MP4 (H.264).
 *  - Connexion lente (2G/3G) ou "Save-Data"/prefers-reduced-data → image
 *    statique seule (la vidéo n'est jamais chargée).
 *  - Lazy loading : préload="none", activation après le DOM + léger délai,
 *    pour ne pas bloquer le LCP / FCP.
 *
 * Les URLs CDN se configurent via NEXT_PUBLIC_HERO_VIDEO_CDN dans .env.local :
 *   NEXT_PUBLIC_HERO_VIDEO_CDN=https://example.b-cdn.net/nv-hero
 * (le code lit le nom du fichier à la fin de chaque URL pour déduire la
 *  ressource CDN correspondante).
 */

/** Résolution max mobile retenue : 720p / bitrate ~1–2 Mbps (voir le script scripts/encode-video.ps1). */
export const HERO_VIDEO_LOCAL = {
  mp4: "/NV-IMG/vidio/video_preview_h264.mp4",
};

/** URL CDN configurée (vide = locale). */
function cdnBase(): string {
  return (
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_HERO_VIDEO_CDN) ||
    ""
  ).replace(/\/+$/, "");
}

/**
 * Source vidéo disponible localement. Le WebM n'est pas inclus tant qu'il
 * n'est pas généré, afin d'éviter une requête 404 inutile avant le fallback.
 */
export function heroVideoSources(): { src: string; type: string }[] {
  const base = cdnBase();
  const src = (file: string) => `${base}/${file}`;

  const sources: { src: string; type: string }[] = [];
  sources.push({ src: base ? src("video_preview_h264.mp4") : HERO_VIDEO_LOCAL.mp4, type: "video/mp4" });
  return sources;
}

export type VideoDecision =
  | { playVideo: true; effectiveType: string }
  | { playVideo: false; reason: string };

/** Vraie décision, exécutée côté client (markup déjà rendu, décision JS). */
export function shouldPlayHeroVideo(): VideoDecision {
  if (typeof window === "undefined") {
    return { playVideo: false, reason: "ssr" };
  }

  // Mobile : écran tactile/coarse pointer → image statique (économise 1.4 MB + décode)
  // C'est le gain #1 pour le TBT/LCP mobile (72→90+). Vidéo réservée au desktop fine pointer.
  try {
    if (window.matchMedia("(pointer: coarse)").matches) {
      return { playVideo: false, reason: "coarse-pointer" };
    }
    if (window.matchMedia("(max-width: 768px)").matches) {
      return { playVideo: false, reason: "mobile-viewport" };
    }
  } catch {
    /* non supporté → ignorer */
  }

  // prefers-reduced-data (support limité, Safari/iOS ≥16)
  try {
    if (
      window.matchMedia("(prefers-reduced-data: reduce)").matches
    ) {
      return { playVideo: false, reason: "prefers-reduced-data" };
    }
  } catch {
    /* non supporté → ignorer */
  }

  // navigator.connection.effectiveType (Chromium) → 2g/3g lents → statique
  const nav = navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      saveData?: boolean;
    };
  };
  const effectiveType = nav.connection?.effectiveType ?? "unknown";
  const saveData = nav.connection?.saveData ?? false;

  if (saveData) {
    return { playVideo: false, reason: "save-data" };
  }
  if (effectiveType === "2g" || effectiveType === "3g") {
    return { playVideo: false, reason: effectiveType };
  }

  return { playVideo: true, effectiveType };
}
