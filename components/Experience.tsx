"use client";

/**
 * Experience — journal éditorial interactif.
 *
 *  - Ligne de temps fine qui se dessine au scroll (GSAP ScrollTrigger)
 *  - Grands numéros 01 / 02 avec entrée en perspective
 *  - Chaque entrée s'incline très légèrement au pointeur (CSS 3D + GSAP)
 *  - Détails dépliables : contexte, contribution, implémentation, résultats
 *  - Mobile / reduced-motion : animations désactivées, contenu intact
 *
 * Les données viennent de locales/*.json (aucune expérience inventée).
 */
import { useEffect, useRef, useState } from "react";
import RevealText from "@/components/RevealText";
import SectionTitle from "@/components/SectionTitle";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { onIdle } from "@/lib/defer";
import { ScrollTrigger } from "@/lib/gsap";
import styles from "./Experience.module.css";

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t, dict } = useLanguage();
  const reduceMotion = usePrefersReducedMotion();
  const [openItems, setOpenItems] = useState<number[]>([]);
  const didMount = useRef(false);

  const toggle = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Le dépliage change la hauteur du document au-dessus de #projects (pinné) :
  // on recalcule les ScrollTrigger une fois la transition terminée.
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 700);
    return () => window.clearTimeout(timer);
  }, [openItems]);

  useEffect(() => {
    if (reduceMotion) return;

    const root = sectionRef.current;
    if (!root) return;

    let cancelled = false;
    const cleanups: Array<() => void> = [];

    const cancelIdle = onIdle(async () => {
      if (cancelled) return;
      const [{ gsap }] = await Promise.all([import("gsap")]);
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (cancelled) return;

      const timelineWrap = root.querySelector<HTMLElement>(`.${styles.timelineWrap}`);
      const track = root.querySelector<HTMLElement>(`.${styles.trackFill}`);
      const numbers = root.querySelectorAll<HTMLElement>(`.${styles.number}`);
      const inners = root.querySelectorAll<HTMLElement>(`.${styles.inner}`);
      const trigger = timelineWrap ?? root;

      const ctx = gsap.context(() => {
        if (track) {
          gsap.fromTo(
            track,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger,
                start: "top 78%",
                end: "bottom 72%",
                scrub: 1.2,
              },
            }
          );
        }

        if (numbers.length) {
          gsap.from(numbers, {
            opacity: 0,
            yPercent: 35,
            rotateX: -55,
            transformPerspective: 800,
            transformOrigin: "50% 100%",
            duration: 1,
            ease: "power3.out",
            stagger: 0.18,
            scrollTrigger: { trigger, start: "top 82%", once: true },
          });
        }

        inners.forEach((inner) => {
          const items = inner.querySelectorAll<HTMLElement>("[data-stagger]");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: inner, start: "top 88%", once: true },
          });

          tl.from(inner, {
            opacity: 0,
            y: 46,
            rotateX: 8,
            transformPerspective: 1100,
            transformOrigin: "50% 100%",
            duration: 1,
            ease: "power3.out",
          });

          if (items.length) {
            tl.from(
              items,
              {
                opacity: 0,
                y: 12,
                duration: 0.6,
                ease: "power2.out",
                stagger: 0.08,
              },
              "-=0.55"
            );
          }
        });
      }, root);
      cleanups.push(() => ctx.revert());

      // Inclinaison 3D très légère — pointeur fin et écran large uniquement.
      if (
        !window.matchMedia("(pointer: fine)").matches ||
        !window.matchMedia("(min-width: 900px)").matches
      ) {
        return;
      }

      inners.forEach((inner) => {
        const tilt = inner.querySelector<HTMLElement>(`.${styles.tilt}`);
        if (!tilt) return;

        const rotateY = gsap.quickTo(tilt, "rotationY", {
          duration: 0.7,
          ease: "power2.out",
        });
        const rotateX = gsap.quickTo(tilt, "rotationX", {
          duration: 0.7,
          ease: "power2.out",
        });

        const onMove = (event: PointerEvent) => {
          const rect = inner.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          rotateY(x * 4);
          rotateX(-y * 3);
        };
        const onLeave = () => {
          rotateY(0);
          rotateX(0);
        };

        inner.addEventListener("pointermove", onMove);
        inner.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          inner.removeEventListener("pointermove", onMove);
          inner.removeEventListener("pointerleave", onLeave);
        });
      });
    });

    return () => {
      cancelled = true;
      cancelIdle();
      cleanups.forEach((fn) => fn());
    };
  }, [reduceMotion]);

  return (
    <section ref={sectionRef} id="experience" className={`${styles.section} relative`}>
      <div className="container mx-auto px-6 relative z-10">
        <div className={styles.header}>
          <div className={styles.headingBlock}>
            <SectionTitle
              white={t("experience.titleWhite")}
              red={t("experience.titleRed")}
              align="left"
            />
            <div className={`racing-stripe ${styles.stripe}`} />
          </div>
          <p className={styles.region}>{t("experience.region")}</p>
        </div>

        <div className={styles.timelineWrap}>
          <div className={styles.track} aria-hidden="true">
            <span className={styles.trackFill} />
          </div>

          <ol className={styles.timeline}>
            {dict.experience.items.map((item, index) => {
              const open = openItems.includes(index);
              const panelId = `experience-panel-${index}`;
              const titleId = `experience-title-${index}`;
              const toggleLabel = open
                ? t("experience.collapse")
                : t("experience.expand");

              return (
                <li key={item.number} className={styles.entry}>
                  <div className={styles.number} aria-hidden="true">
                    {item.number}
                  </div>

                  <div className={styles.rail} aria-hidden="true">
                    <span className={styles.dot} />
                  </div>

                  <div className={styles.body}>
                    <div className={styles.inner}>
                      <div className={styles.tilt}>
                        <p className={styles.kicker} data-stagger>
                          <span>{item.period}</span>
                          <i>·</i>
                          <span>{item.location}</span>
                        </p>

                        <h3 id={titleId} className={styles.company} data-stagger>
                          <RevealText as="span" tone="ink" stagger={0.04}>
                            {item.company}
                          </RevealText>
                        </h3>

                        <p className={styles.role} data-stagger>
                          {item.role}
                        </p>

                        <p className={styles.project} data-stagger>
                          <span>{t("experience.projectLabel")}</span>{" "}
                          {item.project}
                        </p>

                        <button
                          type="button"
                          className={`${styles.toggle} ${open ? styles.toggleOpen : ""}`}
                          aria-expanded={open}
                          aria-controls={panelId}
                          aria-label={`${toggleLabel} — ${item.company}`}
                          onClick={() => toggle(index)}
                          data-stagger
                        >
                          <span>{toggleLabel}</span>
                          <span className={styles.plus} aria-hidden="true">
                            +
                          </span>
                        </button>

                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={titleId}
                          aria-hidden={!open}
                          className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
                        >
                          <div className={styles.panelInner}>
                            <div className={styles.panelGrid}>
                              <div className={styles.block}>
                                <h4>{dict.experience.labels.problem}</h4>
                                <p>{item.problem}</p>
                                <h4>{dict.experience.labels.solution}</h4>
                                <p>{item.solution}</p>
                              </div>

                              <div className={styles.block}>
                                <h4>{dict.experience.labels.contribution}</h4>
                                <ul className={styles.list}>
                                  {item.contribution.map((line) => (
                                    <li key={line}>{line}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className={styles.block}>
                                <h4>{dict.experience.labels.implementation}</h4>
                                <ul className={styles.tags}>
                                  {item.implementation.map((tech) => (
                                    <li key={tech}>{tech}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className={`${styles.block} ${styles.wide}`}>
                                <h4>{dict.experience.labels.impact}</h4>
                                <p>{item.impact}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
