import type { LenisOptions } from "lenis";

/**
 * Options Lenis identiques à celles de la version vanilla (js/main.js) :
 * - duration/easing identiques
 * - smoothWheel uniquement sur les dispositifs à pointeur précis
 * - syncTouch désactivé pour conserver le scroll natif mobile
 */
export function getLenisOptions(): LenisOptions {
  const isCoarsePointer =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  return {
    duration: isCoarsePointer ? 0.8 : 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !isCoarsePointer,
    syncTouch: false,
    touchMultiplier: 1.5,
    wheelMultiplier: 1.0,
    infinite: false,
    autoRaf: false,
  };
}