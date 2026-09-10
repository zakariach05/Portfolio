"use client";

/**
 * Hero — portage de la section #home de legacy/index.html.
 *
 * Le panneau centré (hero-centered) est visible par défaut (opacity:1 en CSS) ;
 * après la fin du splash (useIntro().done), la révélation d'entrée joue :
 *  - desktop (>768px) : split des lignes du nom en lettres + mask reveal GSAP
 *  - mobile (<768px)  : simple fade + translateY
 */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useIntro } from "@/components/providers/IntroProvider";
import { useLenis } from "@/components/providers/LenisProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

/**
 * Circonférence exacte du cercle du badge (r = 78) : le texte est ajusté
 * dessus via textLength + lengthAdjust="spacing" → boucle parfaitement
 * uniforme (FR comme EN), sans gaps, rotation sans couture.
 */
const BADGE_CIRCUMFERENCE = 2 * Math.PI * 78;

export default function Hero() {
  const panelRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const { done } = useIntro();
  const lenis = useLenis();
  const { t } = useLanguage();

  const scrollToNext = () => {
    const target = document.getElementById("about");
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, { offset: 0 });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  useGSAP(
    () => {
      if (!done) return;
      const panel = panelRef.current;
      const nameEl = nameRef.current;
      if (!panel || typeof gsap === "undefined") return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const showPanel = () => {
        gsap.set(panel, { clearProps: "all" });
        panel.style.opacity = "1";
        panel.style.pointerEvents = "auto";
      };

      const mm = gsap.matchMedia();

      // Desktop (>768px) : nom découpé en lettres avec révélation
      mm.add("(min-width: 768px)", () => {
        try {
          const lines = nameEl
            ? gsap.utils.toArray<HTMLElement>(".hero-name-line", nameEl)
            : [];
          if (lines.length === 0) return;

          const originals = lines.map((l) => l.textContent || "");

          const chars: HTMLElement[] = [];
          lines.forEach((line) => {
            const text = line.textContent || "";
            line.textContent = "";
            [...text].forEach((ch) => {
              const s = document.createElement("span");
              s.textContent = ch;
              s.style.display = "inline-block";
              line.appendChild(s);
              chars.push(s);
            });
          });

          // État initial caché appliqué juste avant le play de la timeline
          gsap.set(chars, { yPercent: 115, opacity: 0 });
          gsap.set("#hero-role", { y: 28, opacity: 0 });
          gsap.set(".hero-description", { y: 22, opacity: 0 });
          gsap.set("#hero-cta-group a", { y: 18, opacity: 0 });

          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          tl.to(chars, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.04 }, 0.1)
            .to("#hero-role", { y: 0, opacity: 1, duration: 0.7 }, "-=0.3")
            .to(".hero-description", { y: 0, opacity: 1, duration: 0.7 }, "-=0.45")
            .to(
              "#hero-cta-group a",
              { y: 0, opacity: 1, stagger: 0.12, duration: 0.6 },
              "-=0.45"
            )
            .eventCallback("onComplete", showPanel);

          return () => {
            lines.forEach((l, i) => {
              l.textContent = originals[i];
            });
          };
        } catch (e) {
          console.warn("[HeroReveal] desktop reveal skipped:", e);
          showPanel();
        }
      });

      // Mobile (<768px) : fade simple
      mm.add("(max-width: 767px)", () => {
        try {
          gsap.fromTo(
            panel,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
          );
        } catch (e) {
          console.warn("[HeroReveal] mobile reveal skipped:", e);
          showPanel();
        }
      });

      return () => {
        mm.revert();
      };
    },
    { dependencies: [done], scope: panelRef }
  );

  return (
    <section id="home" style={{ position: "relative", zIndex: 1 }}>
      <div id="hero-sticky">
        <video
          className="hero-video-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/NV-IMG/heroP1.png"
          aria-hidden="true"
        >
          <source src="/NV-IMG/vidio/video_preview_h264.mp4" type="video/mp4" />
        </video>

        <div className="hero-video-overlay" aria-hidden="true" />

        <div
          ref={panelRef}
          id="hero-text-panel"
          className="hero-panel hero-centered"
          aria-label={t("hero.introLabel")}
        >
          <h1
            ref={nameRef}
            id="hero-name"
            className="hero-main-name"
            aria-label={t("hero.nameLabel")}
          >
            <span className="hero-name-line">ZAKARIA</span>
          </h1>
        </div>

        <button
          type="button"
          className="scroll-badge"
          aria-label={t("hero.scrollLabel")}
          onClick={scrollToNext}
        >
          <svg className="badge-ring" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <path
                id="scroll-badge-circle"
                d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"
                fill="none"
              />
            </defs>
            <text>
              <textPath
                href="#scroll-badge-circle"
                startOffset="0%"
                textLength={BADGE_CIRCUMFERENCE}
                lengthAdjust="spacing"
              >
                {t("hero.badgeText")}
              </textPath>
            </text>
          </svg>
          <span className="badge-arrow" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="12" y1="4" x2="12" y2="20" />
              <polyline points="6 14 12 20 18 14" />
            </svg>
          </span>
        </button>
      </div>
    </section>
  );
}