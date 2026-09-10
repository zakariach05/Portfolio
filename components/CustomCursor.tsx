"use client";

/**
 * CustomCursor — portage de la section curseur de legacy/js/main.js.
 *
 * Uniquement sur pointeurs fins :
 *  - follower circulaire qui suit la souris (lerp)
 *  - états : .active-link / .active-project-view / .active-text-reveal
 *  - léger effet magnétique sur les liens (gsap)
 */
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dotEl = dotRef.current;
    const followerEl = followerRef.current;
    if (!cursor || !dotEl || !followerEl) return;

    const dot = dotEl;
    const follower = followerEl;
    if (!window.matchMedia("(pointer: fine)").matches) return;

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
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        moveCursor(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        moveCursor(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    function animateCursor() {
      dotX += (mouseX - dotX) * 1;
      dotY += (mouseY - dotY) * 1;
      dot.style.transform = `translate(${dotX}px, ${dotY}px)`;

      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.transform = `translate(${followerX}px, ${followerY}px)`;

      rafId = requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // ── États au survol (délégation d'événements) ──
    const handleHover = (e: MouseEvent | null) => {
      cursor.classList.remove(
        "active-project-view",
        "active-link",
        "active-text-reveal"
      );

      if (!e || !e.target) return;

      const target = e.target as Element;
      const projectCard = target.closest(".project-card-3d");
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
        const moveX = (e.clientX - centerX) * 0.3;
        const moveY = (e.clientY - centerY) * 0.3;

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

    const onDocMouseMove = (e: MouseEvent) => handleHover(e);
    const onDocMouseOut = (e: MouseEvent) => {
      handleHover(null);
      resetLinkPosition(e);
    };
    const onDocTouchStart = (e: TouchEvent) =>
      handleHover(e.touches[0] ? (e as unknown as MouseEvent) : null);
    const onDocTouchEnd = () =>
      window.setTimeout(() => handleHover(null), 300);
    const onMouseLeave = () => {
      cursor.style.opacity = "0";
    };
    const onMouseEnter = () => {
      cursor.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("mousemove", onDocMouseMove);
    document.addEventListener("mouseout", onDocMouseOut);
    document.addEventListener("touchstart", onDocTouchStart, { passive: true });
    document.addEventListener("touchend", onDocTouchEnd, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("mousemove", onDocMouseMove);
      document.removeEventListener("mouseout", onDocMouseOut);
      document.removeEventListener("touchstart", onDocTouchStart);
      document.removeEventListener("touchend", onDocTouchEnd);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={followerRef} className="cursor-follower">
        <span className="view-text">View</span>
      </div>
    </div>
  );
}