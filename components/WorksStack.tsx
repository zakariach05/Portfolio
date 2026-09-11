"use client";

/**
 * WorksStack — section de cartes projets en effet « sticky-stacking » (type
 * Awwwards), réutilisée sur la home (WORKS) et la page /projets (PROJECTS).
 *
 * Empilement :
 *  - .works-stack : hauteur N×100vh (N = nombre de projets, inline) → les
 *    cartes, toutes dans ce SEUL conteneur, sont en position: sticky; top ;
 *    pendant le scroll du conteneur chaque carte reste fixée à l'écran, puis
 *    la suivante (plus bas dans le DOM) monte au-dessus de la carte fixée.
 *  - Carte active = la DERNIÈRE carte de la pile dont le top est encore dans
 *    sa position sticky (top:100px). Mesurée au ticker GSAP (compatible
 *    Lenis) → robuste à la descente comme à la montée, et indépendante de
 *    la hauteur des sections précédant la pile. La carte active pilote les
 *    stickers latéraux ANNÉE (gauche) / NICHE (droite) ; les cartes
 *    recouvertes reçoivent scale(0.96)+assombrissement.
 *
 * Stickers latéraux fixes à l'écran (position: fixed; top 40vh), visibles
 * uniquement pendant la traversée de la pile (IntersectionObserver).
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "@/lib/gsap";
import { type Project } from "@/lib/projects";
import AppImage from "@/components/AppImage";
import { useLanguage } from "@/contexts/LanguageContext";

function WorksMedia({ project, eager }: { project: Project; eager: boolean }) {
  const isVideo = project.mediaType === "video" && project.videoSrc;
  if (isVideo) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        src={project.videoSrc}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
    );
  }
  return (
    <AppImage
      src={project.imageSrc}
      alt=""
      fill
      sizes="(min-width: 768px) 100vw, 100vw"
      loading={eager ? "eager" : "lazy"}
      priority={eager}
      aria-hidden="true"
    />
  );
}

interface WorksStackProps {
  projects: Project[];
  className?: string;
}

export default function WorksStack({ projects, className = "" }: WorksStackProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof gsap === "undefined") return;
    const root = rootRef.current;
    if (!root) return;

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>(".works-card")
    );
    if (cards.length === 0) return;

    // Helper live — le portal déplace les stickers vers document.body après
    // le premier rendu (isMounted). On requiert donc les nœuds à chaque toggle,
    // pas une NodeList figée au premier montage.
    const getMetas = () =>
      document.querySelectorAll<HTMLElement>(
        "[data-works-stickers] .works-side"
      );

    // Top sticky des cartes (lu du CSS .works-card → top: 100px), utilisé
    // pour savoir quelle carte est "collée" au premier plan.
    const stickyTop =
      parseFloat(getComputedStyle(cards[0]).top) || 100;

    let currentActive = 0;
    const setActive = (next: number) => {
      const clamped = Math.max(0, Math.min(cards.length - 1, next));
      if (clamped === currentActive) return;
      currentActive = clamped;
      cards.forEach((card, i) => {
        card.classList.toggle("is-stacked", i < clamped);
        card.classList.toggle("is-active", i === clamped);
      });
      setActiveIndex(clamped);
    };

    // Carte au premier plan = dernière carte dont le top a atteint la
    // position sticky → celle qui est visuellement par-dessus la pile.
    // Fonctionne à la descente ET à la montée (le callback se ré-exécute sur
    // chaque tick du scroll). Tant qu'aucune carte n'est collée (avant
    // d'atteindre la pile), on reste sur la carte la plus proche (index 0).
    const detectActive = () => {
      let active = 0;
      for (let i = 0; i < cards.length; i++) {
        if (cards[i].getBoundingClientRect().top <= stickyTop + 2) {
          active = i;
        }
      }
      return active;
    };

    // Ré-évaluation en continu via le ticker GSAP (piloté par Lenis) :
    // couvre la descente ET la montée, et les changements de contenu.
    const update = () => setActive(detectActive());
    gsap.ticker.add(update);

    // Stickers latéraux Année/Niche : visibles dès qu'une portion de la pile
    // entre à l'écran (threshold 0 — indispensable : le canvas mesure N×100vh,
    // le ratio d'intersection max serait ~100/N %, souvent < 15%).
    // isMounted en dépendance → après le portal vers body, l'observer est
    // recréé et la première entrée IO déclenche le toggle sur les nœuds portés.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const visible = entry.isIntersecting;
          getMetas().forEach((meta) =>
            meta.classList.toggle("is-visible", visible)
          );
        }
      },
      { threshold: 0 }
    );
    io.observe(root);
    // Si le canvas est déjà visible au moment où le portal s'active
    // (scroll déjà à l'intérieur de la pile), l'IO va quand même émettre
    // sa première entrée immédiatement — pas besoin de forcer un état.

    // Re-évalué après un changement de langue / DPI (hauteurs de texte).
    const onResize = () => setActive(currentActive);
    window.addEventListener("resize", onResize);

    return () => {
      gsap.ticker.remove(update);
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [projects, isMounted]);

  const activeProject = projects[activeIndex];

  // Stickers latéraux ANNÉE/NICHE : rendus via portal vers document.body.
  // Sur la home, la section #projects est placée en position: fixed et
  // pivotée par ScrollTrigger (PinnedOverlaps → transform: scale). Un
  // ancêtre transformé brise le position: fixed ; on les sort donc du
  // contexte CSS parent pour qu'ils restent fixés au viewport.
  const stickers = (
    <div data-works-stickers>
      {/* ANNÉE (gauche) / NICHE (droite), fixes à l'écran, mis à jour selon
          la carte active. */}
      <aside className="works-side works-side-year" aria-hidden="true">
        <span className="works-side-label">{t("projects.year")}</span>
        <span className="works-side-value" key={activeProject.year ?? "none"}>
          {activeProject.year ?? "—"}
        </span>
      </aside>
      <aside className="works-side works-side-niche" aria-hidden="true">
        <span className="works-side-label">{t("projects.niche")}</span>
        <span className="works-side-value" key={activeProject.niche ?? "none"}>
          {activeProject.niche ?? "—"}
        </span>
      </aside>
    </div>
  );

  return (
    <div ref={rootRef} className={`works-canvas relative z-10 ${className}`}>
      {isMounted ? createPortal(stickers, document.body) : stickers}

      <div
        className="works-stack"
        style={{ height: `${projects.length * 100}vh` }}
      >
        {projects.map((project, i) => (
          <article
            key={project.id}
            className={`works-card ${i === 0 ? "is-active" : ""}`}
          >
            {/* Badge en haut (logo miniature + nom + "See work") */}
            <header className="works-card-badge">
              <span className="works-card-badge-logo" aria-hidden="true">
                <AppImage
                  src={project.imageSrc}
                  alt=""
                  width={28}
                  height={28}
                  sizes="28px"
                  aria-hidden="true"
                />
              </span>
              <span className="works-card-badge-name">{project.title}</span>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="works-card-badge-link"
              >
                {t("projects.seeWork")} ↗
              </a>
            </header>

            <div className="works-card-media">
              <WorksMedia project={project} eager={i === 0} />
            </div>

            {/* Overlay bas-gauche : titre + description + tags */}
            <div className="works-card-overlay">
              <h3 className="works-card-title">{project.title}</h3>
              <p className="works-card-desc">{project.description}</p>
              <ul className="works-card-tags" aria-hidden="true">
                {(project.groups
                  ? project.groups.flatMap((g) => g.tags)
                  : project.tags ?? []
                )
                  .slice(0, 4)
                  .map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}