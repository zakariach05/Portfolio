"use client";

/**
 * About — introduction éditoriale + portrait flottant.
 *
 *  - Photo de fond (heroP1) délavée + dégradés, inchangée
 *  - Deux paragraphes exacts (locales/*.json) révélés mot par mot
 *  - Composition épurée : portrait seul, parallaxe pointeur (GSAP quickTo)
 *  - TechStack conservé tel quel
 *
 * Le mouvement est désactivé si prefers-reduced-motion ou pointeur grossier.
 */
import { useEffect, useRef } from "react";
import AppImage from "@/components/AppImage";
import TechStack from "@/components/TechStack";
import RevealText from "@/components/RevealText";
import SectionTitle from "@/components/SectionTitle";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { onIdle } from "@/lib/defer";
import styles from "./About.module.css";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const section = sectionRef.current;
    const scene = sceneRef.current;
    if (!section || !scene) return;

    let cancelled = false;
    const cleanups: Array<() => void> = [];

    const cancelIdle = onIdle(async () => {
      if (cancelled) return;
      const [{ gsap }] = await Promise.all([import("gsap")]);
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (cancelled) return;

      const tilt = scene.querySelector<HTMLElement>(`.${styles.tilt}`);
      const parts = scene.querySelectorAll<HTMLElement>("[data-enter]");

      const ctx = gsap.context(() => {
        if (tilt) {
          gsap.fromTo(
            tilt,
            { opacity: 0, scale: 0.9 },
            {
              opacity: 1,
              scale: 1,
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: { trigger: scene, start: "top 88%", once: true },
            }
          );
        }

        if (parts.length) {
          gsap.fromTo(
            parts,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.9,
              ease: "power2.out",
              stagger: 0.13,
              scrollTrigger: { trigger: scene, start: "top 88%", once: true },
            }
          );
        }
      }, scene);
      cleanups.push(() => ctx.revert());

      // Parallaxe très légère — pointeur fin uniquement.
      if (!tilt || !window.matchMedia("(pointer: fine)").matches) return;

      const rotateY = gsap.quickTo(tilt, "rotationY", {
        duration: 0.8,
        ease: "power3.out",
      });
      const rotateX = gsap.quickTo(tilt, "rotationX", {
        duration: 0.8,
        ease: "power3.out",
      });

      const onMove = (event: PointerEvent) => {
        const rect = scene.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        rotateY(x * 10);
        rotateX(-y * 7);
      };
      const onLeave = () => {
        rotateY(0);
        rotateX(0);
      };

      scene.addEventListener("pointermove", onMove);
      scene.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        scene.removeEventListener("pointermove", onMove);
        scene.removeEventListener("pointerleave", onLeave);
      });
    });

    return () => {
      cancelled = true;
      cancelIdle();
      cleanups.forEach((fn) => fn());
    };
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-24 bg-bg relative overflow-clip"
      style={{ position: "relative", zIndex: 30 }}
    >
      {/* Large Background Photo */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <AppImage
          src="/NV-IMG/hero-poster.webp"
          alt={t("about.bgAlt")}
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          loading="lazy"
          className="object-cover object-center filter grayscale contrast-125 mx-auto"
          style={{
            maxWidth: 1200,
            maskImage:
              "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-transparent to-transparent"></div>
      </div>

      {/* Gradient top — blends with the fixed background behind */}
      <div
        className="absolute top-0 left-0 w-full h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, var(--bg))", zIndex: 0 }}
      ></div>

      <div className="container mx-auto px-6 relative z-10">
        <SectionTitle white={t("about.titleWhite")} red={t("about.titleRed")} align="center" className="mb-16" />

        <div className={styles.introGrid}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>{t("about.profileLabel")}</p>

            <RevealText
              as="p"
              tone="ink"
              stagger={0.035}
              start="top 88%"
              end="bottom 55%"
              className={styles.lead}
            >
              {t("about.intro1")}
            </RevealText>

            <RevealText
              as="p"
              tone="ink"
              stagger={0.025}
              start="top 88%"
              end="bottom 55%"
              className={styles.body}
            >
              {t("about.intro2")}
            </RevealText>
          </div>

          <div className={styles.visualWrap}>
            <div
              ref={sceneRef}
              className={styles.scene}
              role="img"
              aria-label={t("about.sceneLabel")}
            >
              <div className={styles.tilt}>
                <div className={styles.portrait} data-enter>
                  <div className={styles.portraitInner}>
                    <AppImage
                      src="/NV-IMG/about-img.png"
                      alt=""
                      width={440}
                      height={567}
                      sizes="(max-width: 899px) 92vw, 440px"
                      loading="lazy"
                      className={styles.portraitImg}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THE TECH STACK (replaces marquee) */}
      <TechStack />
    </section>
  );
}
