"use client";

import { useSyncExternalStore } from "react";

/**
 * Hook `prefers-reduced-motion` (remplacement de `useReducedMotion` de
 * framer-motion, dont le bundling coûtait ~37 KB + ~250 ms de script au
 * chargement de la page d'accueil).
 */
function subscribe(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener?.("change", callback);
  return () => mq.removeEventListener?.("change", callback);
}

function getSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot() {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}