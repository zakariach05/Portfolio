"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getLenisOptions } from "@/lib/lenis";

export const LenisContext = createContext<Lenis | null>(null);

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
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Mobile : pas de smooth scroll (coarse pointer) → on garde le scroll natif
    // Évite 15 kB d'exécution + rAF permanent sur CPU mobile (TBT)
    try {
      if (window.matchMedia("(pointer: coarse)").matches) {
        return;
      }
    } catch {
      /* ignore */
    }
    const instance = new Lenis(getLenisOptions());

    // ScrollTrigger doit suivre la position "virtuelle" de Lenis.
    instance.on("scroll", ScrollTrigger.update);

    // Lenis est piloté par le ticker GSAP → un seul rAF, animations synchro.
    const update = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Rappelle les limites de ScrollTrigger à l'initialisation.
    ScrollTrigger.config({ limitCallbacks: true });

    setLenis(instance);

    // Le contenu peut changer de hauteur juste après le premier rendu
    // (sections retirées/ajoutées, footer simplifié, polices & images qui
    // chargent). On resynchronise Lenis + ScrollTrigger une fois le DOM
    // stabilisé pour éviter tout offset de mesure périmé.
    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        instance.resize();
        ScrollTrigger.refresh();
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      gsap.ticker.remove(update);
      instance.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}