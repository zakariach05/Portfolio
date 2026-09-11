"use client";

/**
 * Hero — portage de la section #home de legacy/index.html.
 *
 * Le panneau centré (hero-centered) est visible par défaut (opacity:1 en CSS) ;
 * après la fin du splash (useIntro().done), la révélation d'entrée joue :
 *  - desktop (>768px) : split des lignes du nom en lettres + mask reveal GSAP
 *  - mobile (<768px)  : simple fade + translateY
 */
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { useIntro } from "@/components/providers/IntroProvider";
import { useLenis } from "@/components/providers/LenisProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import AppImage from "@/components/AppImage";
import { heroVideoSources, shouldPlayHeroVideo } from "@/lib/heroVideo";
import { onIdle } from "@/lib/defer";

/**
 * Circonférence exacte du cercle du badge (r = 78) : le texte est ajusté
 * dessus via textLength + lengthAdjust="spacing" → boucle parfaitement
 * uniforme (FR comme EN), sans gaps, rotation sans couture.
 */
const BADGE_CIRCUMFERENCE = 2 * Math.PI * 78;

/**
 * HeroVideo — vidéo d'arrière-plan avec lazy loading + data-saver.
 *
 * - playVideo : décidé côté client (effectiveType 2g/3g, save-data,
 *   prefers-reduced-data). Sinon → une AppImage statique légère.
 * - preload="none" → la vidéo n'est chargée qu'après DOMContentLoaded +
 *   petit délai (IntersectionObserver si dispo), pour ne pas bloquer le LCP.
 * - poster = frame de chargement (aucun écran noir/flash).
 * - playsInline muted autoPlay loop → autoplay iOS/Android.
 * - sources : WebM (VP9) d'abord, MP4 (H.264) en fallback, CDN ou local.
 */
function HeroVideo() {
  const vidRef = useRef<HTMLVideoElement>(null);
  const [decide, setDecide] = useState<{ playVideo: boolean; meta: string } | null>(null);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    const d = shouldPlayHeroVideo();
    setDecide({ playVideo: d.playVideo, meta: d.playVideo ? "video" : d.reason });
  }, []);

  // Activer le chargement tardif sans bloquer le FCP/LCP.
  useEffect(() => {
    if (!decide?.playVideo) return;
    let cancelled = false;

    const enable = () => {
      if (cancelled) return;
      setCanPlay(true);
    };

    const t = window.setTimeout(enable, 250); // laisse le poster s'afficher d'abord
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [decide?.playVideo]);

  // Lancer la lecture une fois les sources prêtes (chargés depuis preload="none").
  useEffect(() => {
    if (!canPlay) return;
    const vid = vidRef.current;
    if (!vid) return;
    vid.preload = "auto";
    // Décoche "pause" implicite: autoplay géré par l'attribut + reload pour
    // récupérer les <source> nouvellement disponibles.
    if (vid.readyState >= 1) {
      vid.play().catch(() => {});
    } else {
      vid.oncanplay = () => vid.play().catch(() => {});
    }
    return () => {
      vid.oncanplay = null;
    };
  }, [canPlay]);

  // Pas de vidéo tant que la décision n'est PAS playVideo === true (SSR inclus) :
  // le <video> (mp4 1.4 MB) n'est JAMAIS rendu sur mobile ni avant hydratation.
  // → zéro requête média mobile, LCP = poster léger.
  if (!decide?.playVideo) {
    return (
      <AppImage
        src="/NV-IMG/hero-poster.webp"
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="hero-video-bg"
        aria-hidden="true"
      />
    );
  }

  return (
    <video
      ref={vidRef}
      className="hero-video-bg"
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      poster="/NV-IMG/hero-poster.webp"
      aria-hidden="true"
    >
      {heroVideoSources().map((s) => (
        <source key={s.type} src={s.src} type={s.type} />
      ))}
    </video>
  );
}

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
      if (!panel) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (window.matchMedia("(pointer: coarse), (max-width: 767px)").matches) return;

      let mm: ReturnType<typeof import("gsap").gsap.matchMedia> | null = null;
      let cancelled = false;

      const cancelIdle = onIdle(async () => {
        if (cancelled) return;
        const [{ gsap }] = await Promise.all([import("gsap")]);
        if (cancelled) return;
        const showPanel = () => {
          gsap.set(panel, { clearProps: "all" });
          panel.style.opacity = "1";
          panel.style.pointerEvents = "auto";
        };
        mm = gsap.matchMedia();
        mm.add("(min-width: 768px)", () => {
          try {
            const lines = nameEl ? gsap.utils.toArray<HTMLElement>(".hero-name-line", nameEl) : [];
            if (lines.length === 0) return;
            const originals = lines.map((l) => l.textContent || "");
            const chars: HTMLElement[] = [];
            lines.forEach((line) => {
              const text = line.textContent || "";
              line.textContent = "";
              ;[...text].forEach((ch) => {
                const s = document.createElement("span");
                s.textContent = ch;
                s.style.display = "inline-block";
                line.appendChild(s);
                chars.push(s);
              });
            });
            gsap.set(chars, { yPercent: 115, opacity: 0 });
            gsap.set("#hero-role", { y: 28, opacity: 0 });
            gsap.set(".hero-description", { y: 22, opacity: 0 });
            gsap.set("#hero-cta-group a", { y: 18, opacity: 0 });
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.to(chars, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.04 }, 0.1)
              .to("#hero-role", { y: 0, opacity: 1, duration: 0.7 }, "-=0.3")
              .to(".hero-description", { y: 0, opacity: 1, duration: 0.7 }, "-=0.45")
              .to("#hero-cta-group a", { y: 0, opacity: 1, stagger: 0.12, duration: 0.6 }, "-=0.45")
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
        mm.add("(max-width: 767px)", () => {
          try {
            gsap.fromTo(panel, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" });
          } catch (e) {
            console.warn("[HeroReveal] mobile reveal skipped:", e);
            const { gsap: g } = require("gsap");
            g.set(panel, { clearProps: "all" });
            panel.style.opacity = "1";
            panel.style.pointerEvents = "auto";
          }
        });
      });

      return () => {
        cancelled = true;
        cancelIdle();
        if (mm) mm.revert();
      };
    },
    { dependencies: [done], scope: panelRef }
  );

  return (
    <section id="home" style={{ position: "relative", zIndex: 1 }}>
      <div id="hero-sticky">
        <HeroVideo />

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
            <span className="hero-name-line">CHAMEKH</span>
          </h1>
          <p id="hero-role" className="hero-sub-name">
            {t("hero.role")}
          </p>
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