"use client";

/**
 * NavigationDots — portage de legacy/js/scroll-manager.js :
 * points de navigation fixes à droite + détection de section active
 * via IntersectionObserver. Le scroll vers une section passe par Lenis.
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "@/components/providers/LenisProvider";
import { useLanguage } from "@/contexts/LanguageContext";

const SECTIONS = [
  "#home",
  "#about",
  "#expertise",
  "#projects",
  "#contact",
  "#site-footer",
];

export default function NavigationDots() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const pathname = usePathname();
  const { lang, t } = useLanguage();

  useEffect(() => {
    // Les dots n'existent que sur la page d'accueil (comme l'original)
    if (pathname !== "/") return;

    const container = containerRef.current;
    if (!container) return;

    const dots: HTMLButtonElement[] = [];
    let activeIndex = 0;

    const getSection = (i: number) => document.querySelector(SECTIONS[i]);

    const navigateTo = (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= SECTIONS.length) return;
      const target = getSection(targetIndex);
      if (!target) return;

      if (lenis) {
        lenis.scrollTo(target as HTMLElement, {
          offset: 0,
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        (target as HTMLElement).scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    const updateActiveDot = (index: number) => {
      dots.forEach((dot, i) => {
        if (i === index) {
          dot.style.background = "#DC2626";
          dot.style.width = "10px";
          dot.style.height = "10px";
          dot.style.boxShadow = "0 0 8px rgba(220,38,38,0.6)";
        } else {
          dot.style.background = "rgba(255,255,255,0.3)";
          dot.style.width = "8px";
          dot.style.height = "8px";
          dot.style.boxShadow = "none";
        }
      });
    };

    // ── Construction des dots ──
    SECTIONS.forEach((sec, i) => {
      const dot = document.createElement("button");
      dot.className = "nav-dot";
      dot.setAttribute("aria-label", `${t("dots.goTo")}${sec.replace("#", "")}`);
      dot.dataset.index = String(i);
      dot.style.cssText = `
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        padding: 0;
      `;
      dot.addEventListener("click", () => navigateTo(i));
      container.appendChild(dot);
      dots.push(dot);
    });
    updateActiveDot(0);

    // ── Observateur de section active ──
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = SECTIONS.indexOf("#" + entry.target.id);
            if (idx !== -1) {
              activeIndex = idx;
              updateActiveDot(idx);
              window.dispatchEvent(
                new CustomEvent("sectionChange", {
                  detail: { index: idx, id: entry.target.id },
                })
              );
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    SECTIONS.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      dots.forEach((dot) => dot.remove());
    };
  }, [lenis, pathname, lang, t]);

  return (
    <div
      ref={containerRef}
      id="nav-dots-container"
      className="fixed right-6 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-3 pointer-events-auto"
    />
  );
}