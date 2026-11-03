"use client";

/**
 * TechStack — 3-column grid section : deux clusters de logos flottants qui
 * avancent comme un compteur (conveyor) + un texte centré.
 *
 * Chaque logo est affiché sans conteneur : pas de tuile, de bordure, de fond
 * ni d'ombre. Une animation de flottement lente, propre à chaque icône, et
 * une parallaxe pointeur très légère (desktop) donnent la profondeur.
 */

import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// ── Config ──────────────────────────────────────────────────────────────────
const INTERVAL_MS = 2000;
type Direction = "down" | "up";
const DIRECTION_LEFT: Direction = "down";
const DIRECTION_RIGHT: Direction = "down";
const RIGHT_OFFSET_MS = 0;

/** Nombre de slots visibles (0 = haut, 4 = bas, 2 = centre). */
const SLOT_COUNT = 5;
/** Durée du glissement d'un slot au suivant. */
const MOVE_MS = 600;

// ── Icônes ──────────────────────────────────────────────────────────────────
type StackIcon = {
  name: string;
  /** `null` → texte UML (pas de logo officiel). */
  src: string | null;
  /** Inverse l'icône en thème sombre (SVG noir → blanc). */
  invert?: boolean;
  /** Inverse l'icône en thème clair (SVG blanc → noir). */
  invertLight?: boolean;
};

/** Colonne de gauche — ces icônes n'apparaissent que dans ce cluster. */
const LEFT_ICONS: StackIcon[] = [
  { name: "React", src: "/icons/react.svg" },
  {
    name: "Next.js",
    src: "/icons/nextjs.svg",
    invert: true,
  },
  { name: "TypeScript", src: "/icons/typescript.svg" },
  { name: "UML", src: null },
  { name: "Figma", src: "/icons/figma.svg" },
  { name: "Vercel", src: "/NV-IMG/vercel.svg", invertLight: true },
  { name: "Tailwind CSS", src: "/icons/tailwindcss.svg" },
  { name: "Sanity CMS", src: "/icons/sanity.svg" },
  { name: "Supabase", src: "/icons/supabase.svg" },
  { name: "Resend", src: "/icons/resend.svg", invertLight: true },
];

/** Colonne de droite — ces icônes n'apparaissent que dans ce cluster. */
const RIGHT_ICONS: StackIcon[] = [
  {
    name: "PostgreSQL",
    src: "/icons/postgresql.svg",
  },
  { name: "Git", src: "/icons/git.svg" },
  {
    name: "GitHub",
    src: "/icons/github.svg",
    invert: true,
  },
  { name: "Docker", src: "/icons/docker.svg" },
  { name: "Redux", src: "/icons/redux.svg" },
  {
    name: "Google Search Console",
    src: "/NV-IMG/google-search-console.svg",
  },
  {
    name: "PageSpeed Insights",
    src: "/NV-IMG/pagespeed-insights.svg",
  },
];

// ── State machine du conveyor ───────────────────────────────────────────────
type BeltItem = {
  uid: number;
  icon: StackIcon;
  /** Slot visuel : -1 = au-dessus (entrée), 0..4 = visibles, 5 = en dessous. */
  slot: number;
  /** Animation d'entrée jouée au montage de la tuile. */
  enter?: "down" | "up";
};

const initialBelt = (icons: StackIcon[]): BeltItem[] =>
  icons.slice(0, SLOT_COUNT).map((icon, i) => ({ uid: i, icon, slot: i }));

function useConveyor(
  icons: StackIcon[],
  active: boolean,
  direction: Direction,
  offsetMs: number,
  reset: boolean
) {
  const [items, setItems] = useState<BeltItem[]>(() => initialBelt(icons));
  const itemsRef = useRef<BeltItem[]>(items);
  /** Curseur dans la liste : les icônes suivantes attendent leur tour. */
  const cursorRef = useRef<number>(SLOT_COUNT % icons.length);
  const uidRef = useRef(SLOT_COUNT);
  const dir = direction === "up" ? -1 : 1;

  // prefers-reduced-motion : on réaffiche simplement les 5 premières icônes.
  useEffect(() => {
    if (!reset) return;
    const fresh = icons.slice(0, SLOT_COUNT).map((icon, i) => ({
      uid: uidRef.current++,
      icon,
      slot: i,
    }));
    itemsRef.current = fresh;
    cursorRef.current = SLOT_COUNT % icons.length;
    setItems(fresh);
  }, [reset, icons]);

  useEffect(() => {
    if (!active || !icons.length) return;

    let cancelled = false;
    let timer: number | undefined;
    const timeouts: number[] = [];

    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timeouts.push(id);
    };

    const tick = () => {
      const current = itemsRef.current;
      // L'icône suivante vient du curseur : la liste boucle dans l'ordre,
      // les icônes non affichées attendent simplement leur tour.
      const next = icons[cursorRef.current % icons.length];
      cursorRef.current = (cursorRef.current + 1) % icons.length;

      const uid = uidRef.current++;
      const targetSlot = dir === 1 ? 0 : SLOT_COUNT - 1;

      // 1. Tout le monde descend d'un slot. La nouvelle tuile montre déjà le
      //    slot cible : une animation CSS d'entrée la fait glisser depuis
      //    hors champ (opacité 0 + blur) vers ce slot. Aucun second render
      //    n'est nécessaire, donc un rAF throttlé ne peut pas la perdre.
      itemsRef.current = current
        .map((item) => ({ ...item, slot: item.slot + dir }))
        .concat({
          uid,
          icon: next,
          slot: targetSlot,
          enter: dir === 1 ? "down" : "up",
        });
      setItems([...itemsRef.current]);

      // 2. Une fois la sortie terminée, on retire la tuile hors slots et on
      //    efface le marqueur d'entrée (l'animation CSS ne doit pas rester
      //    attachée à la tuile quand elle glisse vers le slot suivant).
      later(() => {
        itemsRef.current = itemsRef.current
          .filter((item) => item.slot >= 0 && item.slot < SLOT_COUNT)
          .map((item) => (item.enter ? { ...item, enter: undefined } : item));
        setItems([...itemsRef.current]);
      }, MOVE_MS + 120);

      timer = window.setTimeout(tick, INTERVAL_MS);
    };

    timer = window.setTimeout(tick, INTERVAL_MS + offsetMs);

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
      for (const id of timeouts) window.clearTimeout(id);
    };
  }, [active, dir, icons, offsetMs]);

  return items;
}

// ── Tuile ───────────────────────────────────────────────────────────────────
/** Rythme de flottement propre à chaque logo (durée, décalage, inclinaison). */
function floatStyle(name: string): CSSProperties {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 9973;
  }
  const rotate = ((hash % 7) - 3) * 0.7;
  return {
    "--ts-float-duration": `${7 + (hash % 5)}s`,
    "--ts-float-delay": `-${1 + (hash % 6)}s`,
    "--ts-float-rotate": `${rotate.toFixed(1)}deg`,
    "--ts-float-rotate-back": `${(-rotate).toFixed(1)}deg`,
  } as CSSProperties;
}

function BeltTile({ item }: { item: BeltItem }) {
  const icon = item.icon;
  const slotClass =
    item.slot < 0
      ? "ts-slot--1"
      : item.slot > SLOT_COUNT - 1
        ? "ts-slot-5"
        : `ts-slot-${item.slot}`;

  return (
    <div
      className={`ts-tile-item ${slotClass}${item.enter ? ` ts-enter-${item.enter}` : ""}`}
      style={floatStyle(icon.name)}
    >
      <div className="ts-tile" title={icon.name}>
        {icon.src === null ? (
          <span className="ts-uml-text">UML</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- icônes SVG distantes/locales, next/image inutile
          <img
            src={icon.src}
            alt={icon.name}
            width={64}
            height={64}
            className="ts-icon-content"
            data-invert-dark={icon.invert ? "true" : undefined}
            data-invert-light={icon.invertLight ? "true" : undefined}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
    </div>
  );
}

function Cluster({
  side,
  items,
}: {
  side: "left" | "right";
  items: BeltItem[];
}) {
  return (
    <div
      className={`ts-cluster ts-cluster--${side}`}
      aria-hidden="true"
    >
      {items.map((item) => (
        <BeltTile key={item.uid} item={item} />
      ))}
    </div>
  );
}

// ── Composant principal ─────────────────────────────────────────────────────
export default function TechStack() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [running, setRunning] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Pause des timers hors écran / onglet caché / reduced motion.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;

    const sync = () => {
      const isReduced = motionQuery.matches;
      setReduced(isReduced);
      setRunning(inView && !document.hidden && !isReduced);
    };

    sync();

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { threshold: 0.05 }
    );
    observer.observe(section);

    const onVisibility = () => sync();
    const onMotion = () => sync();
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener("change", onMotion);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotion);
    };
  }, []);

  // Parallaxe pointeur très légère sur les clusters — desktop uniquement.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const fine = window.matchMedia("(pointer: fine)");
    const wide = window.matchMedia("(min-width: 901px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || !wide.matches || motion.matches) return;

    let x = 0;
    let y = 0;

    const paint = () => {
      section.style.setProperty("--ts-px", `${x.toFixed(2)}px`);
      section.style.setProperty("--ts-py", `${y.toFixed(2)}px`);
    };

    const onMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
      y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
      paint();
    };

    const onLeave = () => {
      x = 0;
      y = 0;
      paint();
    };

    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave);

    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      section.style.removeProperty("--ts-px");
      section.style.removeProperty("--ts-py");
    };
  }, []);

  const leftItems = useConveyor(
    LEFT_ICONS,
    running,
    DIRECTION_LEFT,
    0,
    reduced
  );
  const rightItems = useConveyor(
    RIGHT_ICONS,
    running,
    DIRECTION_RIGHT,
    RIGHT_OFFSET_MS,
    reduced
  );

  return (
    <section
      ref={sectionRef}
      id="tech-stack"
      className="ts-section"
      aria-label={t("stack.label")}
    >
      <Cluster side="left" items={leftItems} />

      {/* ── Col 2: Center text ── */}
      <div className="ts-center">
        <p className="ts-label">{t("stack.label")}</p>
        <h2 className="ts-heading">
          <span className="ts-heading--muted">{t("stack.line1")}</span>
          <br />
          <span className="ts-heading--white">{t("stack.line2")}</span>
        </h2>
        <p className="ts-para">{t("stack.para")}</p>
        <a href="#projects" className="ts-btn">
          {t("stack.btn")}
        </a>
      </div>

      <Cluster side="right" items={rightItems} />
    </section>
  );
}
