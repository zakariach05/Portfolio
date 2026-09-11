"use client";

/**
 * PinnedOverlaps — portage de legacy/js/advanced-animations.js
 * (initPinnedOverlapEffects).
 *
 * - Empilement des sections via z-index croissants
 * - Pin de #projects (bottom bottom) sans spacing,
 *   pour que la section suivante glisse par-dessus
 * - Léger assombrissement + scale au moment du "recouvrement"
 *
 * NOTE : le pin de #contact (qui faisait glisser le footer par-dessus
 * la section contact) a été supprimé — le footer suit désormais le
 * contact en flux normal, sans recouvrement.
 *
 * IMPORTANT — le document peut changer de hauteur après le montage
 * (footer simplifié, sections retirées, polices/images chargées). Les pins
 * utilisent des end calculés sur la hauteur totale (`"max"`) ; on force donc
 * un `ScrollTrigger.refresh()` après création, et on tue proprement tous les
 * ScrollTriggers/tweens créés dans le cleanup pour éviter tout calcul périmé.
 */
import { useEffect } from "react";
import { onIdle } from "@/lib/defer";

export default function PinnedOverlaps() {
  useEffect(() => {
    // Mobile : pas de pin/scale (CPU + layout thrashing) — gain TBT majeur
    try {
      if (window.matchMedia("(pointer: coarse), (max-width: 768px)").matches)
        return;
    } catch {
      /* ignore */
    }

    let cancelled = false;
    let gsapRef: any = null;
    let ScrollTriggerRef: any = null;
    const createdTriggers: any[] = [];
    const createdTweens: any[] = [];
    let raf1 = 0;
    let raf2 = 0;

    const cancelIdle = onIdle(async () => {
      if (cancelled) return;
      const [{ gsap }] = await Promise.all([import("gsap")]);
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (cancelled) return;
      gsapRef = gsap;
      ScrollTriggerRef = ScrollTrigger;

      // 1. Stacking context (les ids morts ont été retirés)
      gsap.set("#projects", { zIndex: 40 });
      gsap.set("#signature-section", { zIndex: 50 });

      // 2. PIN PROJECTS
      const projectsSec = document.getElementById("projects");
      if (projectsSec) {
        createdTriggers.push(
          ScrollTrigger.create({
            trigger: projectsSec,
            start: "bottom bottom",
            end: () => "max",
            pin: true,
            pinSpacing: false,
          })
        );

        createdTweens.push(
          gsap.to(projectsSec, {
            scale: 0.95,
            opacity: 0.3,
            ease: "none",
            scrollTrigger: {
              trigger: projectsSec,
              start: "bottom bottom",
              end: () => "+=" + window.innerHeight * 1.5,
              scrub: true,
            },
          })
        );
      }

      // 4. Recalcule des positions une fois le DOM vraiment final
      //    (double rAF : après peinture + éventuel reflow des polices/images).
      raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      });
    });

    return () => {
      cancelled = true;
      cancelIdle();
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      createdTweens.forEach((tween: any) => tween.kill());
      createdTriggers.forEach((st: any) => st.kill());
      if (ScrollTriggerRef) {
        try {
          ScrollTriggerRef.refresh();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  return null;
}