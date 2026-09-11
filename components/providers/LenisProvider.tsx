"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onIdle } from "@/lib/defer";
import { getLenisOptions } from "@/lib/lenis";

export const LenisContext = createContext<import("lenis").default | null>(null);

/** Accès à l'instance Lenis depuis n'importe quel composant client. */
export function useLenis() {
  return useContext(LenisContext);
}

/**
 * LenisProvider — smooth scroll global du site.
 *
 * Initialisé UNE seule fois, au niveau layout. Synchronisation avec GSAP :
 *   - lenis.on("scroll", ScrollTrigger.update)  → ScrollTrigger suit Lenis
 *   - gsap.ticker.add(...)                       → Lenis suit le ticker GSAP
 *
 * Cleanup complet au unmount (lenis.destroy, ticker supprimé) pour éviter
 * toute fuite mémoire en React.
 */
export default function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<import("lenis").default | null>(null);

  useEffect(() => {
    // Mobile : pas de smooth scroll → immédiat
    try {
      if (window.matchMedia("(pointer: coarse), (max-width: 767px)").matches) {
        return;
      }
    } catch {
      /* ignore */
    }

    // TBT FIX: différer l'initialisation lourde (Lenis + GSAP) après le premier paint
    // via requestIdleCallback (fallback setTimeout 300ms). Évite le long task 1581ms @932ms.
    let cancelled = false;
    let instance: import("lenis").default | null = null;
    let cleanupTicker: (() => void) | null = null;
    let raf1 = 0;
    let raf2 = 0;

    const cancelIdle = onIdle(async () => {
      if (cancelled) return;
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      instance = new Lenis(getLenisOptions());
      instance.on("scroll", ScrollTrigger.update);
      const update = (time: number) => instance!.raf(time * 1000);
      gsap.ticker.add(update);
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.config({ limitCallbacks: true });
      setLenis(instance);

      raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          instance?.resize();
          ScrollTrigger.refresh();
        });
      });

      cleanupTicker = () => {
        gsap.ticker.remove(update);
      };
    });

    return () => {
      cancelled = true;
      cancelIdle();
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      if (cleanupTicker) cleanupTicker();
      if (instance) instance.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}