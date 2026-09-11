"use client";

/**
 * CustomCursor — portage de la section curseur de legacy/js/main.js.
 *
 * Uniquement sur pointeurs fins + hover souris :
 *  - follower circulaire qui suit la souris (lerp, lag fluide via rAF)
 *  - survol d'une carte projet (.project-card) : le curseur natif est
 *    masqué (cursor:none) et le cercle grossit (30 → 110px) avec le texte
 *    VOIR / VIEW au centre — apparition/disparition douce (scale + opacity)
 *  - états : .active-project-view / .active-link / .active-text-reveal
 *  - léger effet magnétique sur les liens (gsap)
 * Désactivé sur mobile/tablette (pas de souris tactile : pointer:coarse).
 */
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const cursor = cursorRef.current;
    const dotEl = dotRef.current;
    const followerEl = followerRef.current;
    if (!cursor || !dotEl || !followerEl) return;

    const dot = dotEl;
    const follower = followerEl;

    // Strictement souris (aucun tactile) : "hover:hover + pointer:fine".
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let mouseX = 0,
      mouseY = 0,
      dotX = 0,
      dotY = 0,
      followerX = 0,
      followerY = 0;
    let rafId = 0;

    const moveCursor = (clientX: number, clientY: number) => {
      mouseX = clientX;
      mouseY = clientY;
      cursor.style.opacity = "1";
    };

    const onMouseMove = (e: MouseEvent) => moveCursor(e.clientX, e.clientY);

    function animateCursor() {
      dotX += (mouseX - dotX) * 1;
      dotY += (mouseY - dotY) * 1;
      dot.style.transform = `translate(${dotX}px, ${dotY}px)`;

      // lerp léger → mouvement fluide non saccadé ("lag")
      followerX += (mouseX - followerX) * 0.16;
      followerY += (mouseY - followerY) * 0.16;

      // Centrage : le follower a une taille variable (30px → 110px), on
      // compense par la moitié réelle pour que le cercle reste sur le pointeur.
      const halfW = follower.offsetWidth / 2;
      const halfH = follower.offsetHeight / 2;
      follower.style.transform = `translate(${followerX - halfW}px, ${followerY - halfH}px)`;

      rafId = requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // ── États au survol (délégation d'événements) ──
    const handleHover = (e: MouseEvent | null, clientX?: number, clientY?: number) => {
      cursor.classList.remove(
        "active-project-view",
        "active-link",
        "active-text-reveal"
      );

      if (!e || !e.target) return;

      const target = e.target as Element;
      // Cartes projets (home + /projets) ; garde le sélecteur legacy
      // .project-card-3d au cas où.
      const projectCard = target.closest(
        ".project-card, .project-card-3d, .works-card"
      );
      const link = target.closest(
        "a, button, .nav-link-item, .tech-item"
      ) as HTMLElement | null;
      const textReveal = target.closest(".hover-reveal");

      if (projectCard) {
        cursor.classList.add("active-project-view");
      } else if (textReveal) {
        cursor.classList.add("active-text-reveal");
      } else if (link) {
        cursor.classList.add("active-link");

        const rect = link.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const cx = clientX ?? e.clientX;
        const cy = clientY ?? e.clientY;
        const moveX = (cx - centerX) * 0.3;
        const moveY = (cy - centerY) * 0.3;

        gsap.to(link, { x: moveX, y: moveY, duration: 0.3, ease: "power2.out" });
      }
    };

    const resetLinkPosition = (e: MouseEvent) => {
      const link = (e.target as Element).closest(
        "a, button, .nav-link-item, .tech-item"
      ) as HTMLElement | null;
      if (link) {
        gsap.to(link, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)",
        });
      }
    };

    const onDocMouseMove = (e: MouseEvent) => handleHover(e, e.clientX, e.clientY);
    const onDocMouseOut = (e: MouseEvent) => {
      handleHover(null);
      resetLinkPosition(e);
    };
    const onMouseLeave = () => {
      cursor.style.opacity = "0";
    };
    const onMouseEnter = () => {
      cursor.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousemove", onDocMouseMove);
    document.addEventListener("mouseout", onDocMouseOut);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousemove", onDocMouseMove);
      document.removeEventListener("mouseout", onDocMouseOut);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={followerRef} className="cursor-follower">
        <span className="view-text">{t("cursor.view")}</span>
      </div>
    </div>
  );
}