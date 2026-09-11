"use client";

/**
 * ServicesGrid — rangée horizontale accordéon (images 1 & 3) + icônes SVG.
 *
 * Layout : flex horizontal 6 cartes, hover = expansion (flex:3) + fond clair
 * #F0EFEA, texte noir, contenu complet ; compact = flex:1, fond sombre,
 * titre tronqué (nowrap/ellipsis), description/tags masqués.
 * - Idle : icône flotte (y 0→-4→0, 3.5s) + anneaux pointillés en rotation lente.
 * - Hover : 100% CSS (flex/background/color), pas de Framer variants (évite
 *   conflit avec flex).
 * - Entrée au scroll : GSAP + ScrollTrigger slide-in depuis la droite
 *   (x:150, opacity:0, power3.out, stagger 0.1, start "top 75%", once).
 * Accessibilité : prefers-reduced-motion → pas d'anim, cartes visibles.
 */
import { useEffect, useRef, type ReactElement } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export interface ServiceCardData {
  role: string;
  title: string;
  text: string;
  tags: string[];
}

interface ServicesGridProps {
  cards: ServiceCardData[];
}

/* ── Icônes SVG dessinées à la main (multi-couches) ──────────────────
   Chaque icône : couche statique + anneaux pointillés en rotation lente.
   stroke = currentColor (hérite de --card-color du rôle). */

function FrontendIcon() {
  return (
    <svg viewBox="0 0 96 96" width={64} height={64} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="14" y="18" width="68" height="60" rx="12" />
        <path d="M14 36 H82" />
        <circle cx="26" cy="27" r="3.5" fill="currentColor" stroke="none" />
        <circle cx="37" cy="27" r="3.5" fill="currentColor" stroke="none" />
        <circle cx="48" cy="27" r="3.5" fill="currentColor" stroke="none" />
        {/* Chevrons </> */}
        <path d="M40 50 L30 57 L40 64" />
        <path d="M56 50 L66 57 L56 64" />
      </g>
      {/* Anneau pointillé en rotation lente (derrière le code) */}
      <circle
        cx="48"
        cy="57"
        r="20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="6 9"
        strokeLinecap="round"
        className="ring-spin"
        style={{ animationDuration: "28s" }}
        opacity="0.6"
      />
    </svg>
  );
}

function BackendIcon() {
  return (
    <svg viewBox="0 0 96 96" width={64} height={64} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="18" y="20" width="60" height="56" rx="10" />
        <path d="M18 36 H78" />
        <path d="M18 52 H78" />
        <circle cx="30" cy="28" r="3" fill="currentColor" stroke="none" />
        <circle cx="30" cy="44" r="3" fill="currentColor" stroke="none" />
        <circle cx="30" cy="60" r="3" fill="currentColor" stroke="none" />
      </g>
      {/* Disque + anneau pointillé (rotation visible) */}
      <circle cx="62" cy="44" r="5" fill="currentColor" />
      <g
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="5 7"
        strokeLinecap="round"
        className="ring-spin"
        style={{ animationDuration: "22s", animationDirection: "reverse" }}
        opacity="0.7"
      >
        <circle cx="62" cy="44" r="13" />
      </g>
    </svg>
  );
}

function DesignIcon() {
  return (
    <svg viewBox="0 0 96 96" width={64} height={64} fill="none" aria-hidden="true">
      {/* 3 cercles concentriques (UI/UX) */}
      <g stroke="currentColor" strokeWidth="3">
        <circle cx="48" cy="44" r="30" />
        <circle cx="48" cy="44" r="20" />
        <circle cx="48" cy="44" r="10" />
      </g>
      {/* Aiguilles jumelles "radar" (formes symétriques → rotation centrée) */}
      <g
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="ring-spin"
        style={{ animationDuration: "18s" }}
        opacity="0.8"
      >
        <path d="M48 16 L48 24" />
        <circle cx="48" cy="20" r="3" fill="currentColor" stroke="none" />
        <path d="M48 64 L48 72" />
        <circle cx="48" cy="68" r="3" fill="currentColor" stroke="none" />
      </g>
      {/* Anneau pointillé en sens inverse, vitesse différente */}
      <circle
        cx="48"
        cy="44"
        r="34"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="3 8"
        strokeLinecap="round"
        className="ring-spin"
        style={{ animationDuration: "34s", animationDirection: "reverse" }}
        opacity="0.45"
      />
    </svg>
  );
}

function TestingIcon() {
  return (
    <svg viewBox="0 0 96 96" width={64} height={64} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Fiole */}
        <path d="M39 34 V24 H57 V34" />
        <rect x="30" y="34" width="36" height="42" rx="10" />
        {/* Bulles */}
        <circle cx="42" cy="50" r="2.5" fill="currentColor" stroke="none" opacity="0.7" />
        <circle cx="52" cy="62" r="2.5" fill="currentColor" stroke="none" opacity="0.7" />
        {/* Coche de validation */}
        <path d="M56 48 L66 58 L78 42" />
      </g>
      {/* Anneau pointillé en rotation (test "en cours") */}
      <circle
        cx="48"
        cy="52"
        r="36"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="5 9"
        strokeLinecap="round"
        className="ring-spin"
        style={{ animationDuration: "30s" }}
        opacity="0.5"
      />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg viewBox="0 0 96 96" width={64} height={64} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Nuage */}
        <path d="M32 62 a12 12 0 0 1 2 -23.5 A17 17 0 0 1 63 36 a13 13 0 0 1 1 26 Z" />
        {/* Flèche de déploiement */}
        <path d="M48 20 l0 -0" />
        <path d="M48 78 V24" />
        <path d="M40 32 L48 24 L56 32" />
      </g>
      {/* Anneau pointillé (synchro / CI-CD) */}
      <circle
        cx="48"
        cy="52"
        r="34"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 8"
        strokeLinecap="round"
        className="ring-spin"
        style={{ animationDuration: "26s", animationDirection: "reverse" }}
        opacity="0.55"
      />
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg viewBox="0 0 96 96" width={64} height={64} fill="none" aria-hidden="true">
      {/* Bouclier */}
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M48 14 L72 24 V52 C72 64 62 74 48 82 C34 74 24 64 24 52 V24 Z" />
        {/* Cadenas */}
        <rect x="40" y="50" width="16" height="12" rx="2.5" />
        <path d="M42 50 V46 A6 6 0 0 1 54 46 V50" />
        <circle cx="48" cy="56" r="1.8" fill="currentColor" stroke="none" />
        <path d="M48 57.8 V59.5" strokeWidth="2" />
      </g>
      {/* Anneau pointillé en rotation (cohérent avec QA & Cloud) */}
      <circle
        cx="48"
        cy="52"
        r="36"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="5 9"
        strokeLinecap="round"
        className="ring-spin"
        style={{ animationDuration: "30s" }}
        opacity="0.5"
      />
    </svg>
  );
}

const ROLE_ICONS: Record<string, () => ReactElement> = {
  "role-frontend": FrontendIcon,
  "role-backend": BackendIcon,
  "role-design": DesignIcon,
  "role-testing": TestingIcon,
  "role-cloud": CloudIcon,
  "role-security": SecurityIcon,
};

/* ── Accordéon horizontal : le hover est 100% CSS (flex + background).
   Les rotations des anneaux pointillés et le float idle des icônes sont
   en CSS pur (ring-spin / icon-float) — plus de Framer Motion (perf). */

export default function ServicesGrid({ cards }: ServicesGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  // Entrée au scroll : slide-in rapide depuis la droite, cascade (une seule fois).
  // Mobile : désactivé → TBT économisé, cartes visibles direct
  useEffect(() => {
    if (reduceMotion) return;
    try {
      if (window.matchMedia("(pointer: coarse), (max-width: 767px)").matches)
        return;
    } catch {
      /* ignore */
    }
    if (typeof gsap === "undefined") return;
    const grid = gridRef.current;
    if (!grid) return;

    const ctx = gsap.context(() => {
      gsap.from(".service-card", {
        x: 150,
        opacity: 0,
        duration: 0.45,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: grid,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });
    }, grid);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <div ref={gridRef} className="services-grid">
      {cards.map((card, index) => {
        const CardIcon = ROLE_ICONS[card.role] ?? FrontendIcon;
        return (
          <div key={card.role} className={`service-card ${card.role}`}>
            <div className="service-card-inner">
              <span className="service-card-number">{String(index + 1).padStart(2, "0")}</span>
              <div className="service-icon">
                <div
                  className="service-icon-float icon-float"
                  style={
                    reduceMotion
                      ? undefined
                      : { animationDelay: `${index * 0.3}s` }
                  }
                >
                  <CardIcon />
                </div>
              </div>
              <h3 className="service-card-title">{card.title}</h3>
              <p className="service-card-text">{card.text}</p>
              <div className="service-card-tags">
                {card.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}