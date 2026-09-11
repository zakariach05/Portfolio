"use client";

/**
 * Marquee — portage de legacy/js/advanced-animations.js (initMarquee).
 *
 * Trois lignes défilantes (contenu dupliqué) :
 *  - marquee-1 : outline, ← (durée 20)
 *  - marquee-2 : filled, → (durée 25)
 *  - marquee-3 : keywords jaunes, ← (durée 15)
 *
 * Pause hors viewport (IntersectionObserver), ralenti sur touch,
 * ralentissement au survol d'un mot (pointeurs fins).
 */
import { useEffect, useRef } from "react";
import { onIdle } from "@/lib/defer";
import { useLanguage } from "@/contexts/LanguageContext";

type MarqueeLineProps = {
  lineClass: string;
  items: Array<{ word: string; sep: string; sepColor?: string; yellow?: boolean }>;
};

function MarqueeLine({ lineClass, items }: MarqueeLineProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isCoarse = window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;

    let cancelled = false;
    let tween: any = null;
    let gsapRef: any = null;
    let io: IntersectionObserver | null = null;
    let words: NodeListOf<HTMLElement> | null = null;
    let onEnter: (() => void) | null = null;
    let onLeave: (() => void) | null = null;

    const cancelIdle = onIdle(async () => {
      if (cancelled) return;
      const [{ gsap }] = await Promise.all([import("gsap")]);
      if (cancelled) return;
      gsapRef = gsap;

      const direction = lineClass === "marquee-1" || lineClass === "marquee-3" ? -1 : 1;
      const duration =
        lineClass === "marquee-1" ? 20 : lineClass === "marquee-2" ? 25 : 15;

      el.innerHTML += el.innerHTML;
      const width = el.scrollWidth / 2;

      gsap.set(el, { x: direction === -1 ? 0 : -width });

      tween = gsap.to(el, {
        x: direction === -1 ? -width : 0,
        duration,
        ease: "none",
        repeat: -1,
        modifiers: { x: gsap.utils.unitize((x: string) => parseFloat(x) % width) },
      });

      if (isCoarse) tween.timeScale(0.6);

      if (typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver(
          (entries) => {
            const entering = entries[0].isIntersecting;
            if (!tween) return;
            if (entering) tween.play();
            else tween.pause();
          },
          { rootMargin: "100px" }
        );
        io.observe(el);
      }

      if (!isCoarse) {
        words = el.querySelectorAll<HTMLElement>(".marquee-word");
        onEnter = () => gsap.to(tween, { timeScale: 0.1, duration: 0.5 });
        onLeave = () => gsap.to(tween, { timeScale: 1, duration: 0.5 });
        words.forEach((w) => {
          w.addEventListener("mouseenter", onEnter!);
          w.addEventListener("mouseleave", onLeave!);
        });
      }
    });

    return () => {
      cancelled = true;
      cancelIdle();
      if (words && onEnter && onLeave) {
        words.forEach((w) => {
          w.removeEventListener("mouseenter", onEnter!);
          w.removeEventListener("mouseleave", onLeave!);
        });
      }
      if (io) io.disconnect();
      if (tween) {
        try {
          tween.kill();
        } catch {
          /* ignore */
        }
      }
      // Restore original to avoid double duplication on HMR
      try {
        if (gsapRef) gsapRef.set(el, { clearProps: "x" });
      } catch {
        /* ignore */
      }
    };
  }, [lineClass]);

  return (
    <div className={`marquee-line ${lineClass}`} ref={ref}>
      {items.map((it, i) => (
        <span key={i}>
          <span
            className={it.yellow ? "marquee-word font-bold" : "marquee-word"}
            style={
              it.yellow
                ? { color: "#D4FF00", WebkitTextStroke: "0" }
                : undefined
            }
          >
            {it.word}
          </span>
          <span
            className="marquee-sep"
            style={it.sepColor ? { color: it.sepColor } : undefined}
          >
            {it.sep}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  const { t } = useLanguage();
  const webdev = t("marquee.webdev");
  return (
    <div
      id="marquee-section"
      style={{ padding: 0, background: "transparent" }}
    >
      <MarqueeLine
        lineClass="marquee-1"
        items={[
          { word: "CREATIVE DEVELOPER", sep: "◆" },
          { word: "REACT", sep: "◆" },
          { word: "THREE.JS", sep: "◆" },
          { word: "LARAVEL", sep: "◆" },
          { word: "FULL STACK", sep: "◆" },
          { word: "CREATIVE DEVELOPER", sep: "◆" },
          { word: "REACT", sep: "◆" },
          { word: "THREE.JS", sep: "◆" },
          { word: "LARAVEL", sep: "◆" },
          { word: "FULL STACK", sep: "◆" },
        ]}
      />
      <MarqueeLine
        lineClass="marquee-2"
        items={[
          { word: webdev, sep: "✦" },
          { word: "UI/UX DESIGN", sep: "✦" },
          { word: "WORDPRESS", sep: "✦" },
          { word: "WEBGL", sep: "✦" },
          { word: "GSAP", sep: "✦" },
          { word: webdev, sep: "✦" },
          { word: "UI/UX DESIGN", sep: "✦" },
          { word: "WORDPRESS", sep: "✦" },
          { word: "WEBGL", sep: "✦" },
          { word: "GSAP", sep: "✦" },
        ]}
      />
      <MarqueeLine
        lineClass="marquee-3"
        items={[
          { word: "HTML5", sep: "•", sepColor: "rgba(255,255,255,0.3)", yellow: true },
          { word: "CSS3", sep: "•", sepColor: "rgba(255,255,255,0.3)", yellow: true },
          { word: "JAVASCRIPT", sep: "•", sepColor: "rgba(255,255,255,0.3)", yellow: true },
          { word: "PHP", sep: "•", sepColor: "rgba(255,255,255,0.3)", yellow: true },
          { word: "MYSQL", sep: "•", sepColor: "rgba(255,255,255,0.3)", yellow: true },
          { word: "GIT", sep: "•", sepColor: "rgba(255,255,255,0.3)", yellow: true },
          { word: "ANIME.JS", sep: "•", sepColor: "rgba(255,255,255,0.3)", yellow: true },
          { word: "HTML5", sep: "•", sepColor: "rgba(255,255,255,0.3)", yellow: true },
          { word: "CSS3", sep: "•", sepColor: "rgba(255,255,255,0.3)", yellow: true },
          { word: "JAVASCRIPT", sep: "•", sepColor: "rgba(255,255,255,0.3)", yellow: true },
          { word: "PHP", sep: "•", sepColor: "rgba(255,255,255,0.3)", yellow: true },
          { word: "MYSQL", sep: "•", sepColor: "rgba(255,255,255,0.3)", yellow: true },
        ]}
      />
    </div>
  );
}