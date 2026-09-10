"use client";

/**
 * Header — portage du header de legacy/index.html.
 *
 *  - Logo V électrique (canvas), lien retour en haut (href="#")
 *  - Lien SERVICES avec effet scramble + glitch, vers /services
 *  - Effet au scroll : fond flouté après 50px (comme l'original)
 */
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import VLogo from "@/components/VLogo";

export default function Header() {
  const pathname = usePathname();
  const isServices = pathname === "/services";
  const headerRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLAnchorElement>(null);

  // ── Effet au scroll (bg blur après 50px) ──
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let ticking = false;

    const updateHeader = () => {
      if (window.scrollY > 50) {
        header.classList.add(
          "bg-white/80",
          "dark:bg-black/80",
          "backdrop-blur-md",
          "py-4",
          "shadow-lg"
        );
        header.classList.remove("py-6");
      } else {
        header.classList.remove(
          "bg-white/80",
          "dark:bg-black/80",
          "backdrop-blur-md",
          "py-4",
          "shadow-lg"
        );
        header.classList.add("py-6");
      }
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateHeader);
          ticking = true;
        }
      },
      { passive: true }
    );

    return () =>
      window.removeEventListener("scroll", updateHeader);
  }, []);

  // ── Effet scramble sur le lien SERVICES ──
  useEffect(() => {
    const el = servicesRef.current;
    if (!el) return;

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let interval: number | null = null;

    const onMouseOver = () => {
      let iteration = 0;
      const originalValue = el.dataset.value || "";
      const arrow = el.querySelector(".arrow");
      const arrowContent = arrow ? arrow.outerHTML : "";

      if (interval) window.clearInterval(interval);

      interval = window.setInterval(() => {
        el.innerHTML =
          originalValue
            .split("")
            .map((letter, index) => {
              if (index < iteration) return originalValue[index];
              return letters[Math.floor(Math.random() * 26)];
            })
            .join("") + (arrowContent ? ` ${arrowContent}` : "");

        if (iteration >= originalValue.length) {
          if (interval) window.clearInterval(interval);
        }

        iteration += 1 / 3;
      }, 30);
    };

    el.addEventListener("mouseover", onMouseOver);

    return () => {
      el.removeEventListener("mouseover", onMouseOver);
      if (interval) window.clearInterval(interval);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      id="main-header"
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 flex justify-between items-center transition-all duration-300"
    >
      {isServices ? (
        <Link
          href="/"
          id="header-logo-link"
          className="flex items-center justify-center order-1 relative"
          style={{ width: 80, height: 80 }}
          aria-label="Retour à l'accueil"
        >
          <VLogo
            src="/NV-IMG/V.png"
            canvasId="header-v-canvas"
            glowScale={0.8}
            jitterStrength={2.5}
            moveStrength={8}
          />
        </Link>
      ) : (
        <a
          href="#home"
          id="header-logo-link"
          className="flex items-center justify-center order-1 relative"
          style={{ width: 80, height: 80 }}
          aria-label="Retour en haut"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <VLogo
            src="/NV-IMG/V.png"
            canvasId="header-v-canvas"
            glowScale={0.8}
            jitterStrength={2.5}
            moveStrength={8}
          />
        </a>
      )}

      {isServices ? (
        <Link
          ref={servicesRef}
          href="/"
          className="glitch-link scramble-text order-2"
          data-value="ACCUEIL"
        >
          ACCUEIL <span className="arrow">↗</span>
        </Link>
      ) : (
        <Link
          ref={servicesRef}
          href="/services"
          className="glitch-link scramble-text order-2"
          data-text="SERVICES"
          data-value="SERVICES"
        >
          SERVICES <span className="arrow">↗</span>
        </Link>
      )}
    </header>
  );
}