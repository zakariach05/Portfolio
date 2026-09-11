"use client";

/**
 * SplashScreen — "V Logo · Juice Fill".
 *
 * Le V (masqué par `/NV-IMG/logo.png`) se remplit une seule fois de bas en
 * haut (juice dégradé) : base grise → remplissage rouge 1600ms (delay 150ms)
 * → hold 350ms → fade-out 600ms, pendant lesquels le contenu se révèle
 * (via onReveal → IntroProvider `done`). Timing ~2.5s au total.
 *
 * + Skip sessionStorage (`vo-splash-seen`) : ne rejoue qu'une fois par session.
 * + `prefers-reduced-motion` : pas d'animation, le contenu débarque direct.
 *
 * Robuste (leçon de l'ancien splash qui gelait le scroll) : effet mono-run [],
 * Lenis lu via refs (null → instance ne relance pas l'effet), garde `finished`
 * idempotente, et déverrouillage overflow + lenis.start() aussi bien à la fin
 * qu'au cleanup.
 */
import { useEffect, useRef } from "react";
import { useLenis } from "@/components/providers/LenisProvider";
import { ScrollTrigger } from "@/lib/gsap";
import type Lenis from "lenis";

const FILL_DELAY_MS = 150;
const FILL_DURATION_MS = 450; // 1600 → 450 (LCP : h1 = élément LCP ; 2.1 s de splash = -1.5 s)
const HOLD_MS = 150; // 350 → 150
const FADE_MS = 350; // 600 → 350

const HIDE_AT_MS = FILL_DELAY_MS + FILL_DURATION_MS + HOLD_MS; // 750
const COMPLETE_AT_MS = HIDE_AT_MS + FADE_MS; // 1100

const SEEN_KEY = "vo-splash-seen";

type SplashScreenProps = {
  /** fin du remplissage → le contenu (héro) peut commencer sa révélation */
  onReveal: () => void;
  /** fade terminé → le splash peut être démonté sans coupure visuelle */
  onComplete: () => void;
};

export default function SplashScreen({
  onReveal,
  onComplete,
}: SplashScreenProps) {
  const splashRef = useRef<HTMLDivElement>(null);

  // Lenis arrive façon asynchrone (null → instance) : on lit la version la plus
  // récente via des refs pour ne jamais relancer l'effet à ce changement.
  const lenis = useLenis();
  const lenisRef = useRef<Lenis | null>(null);
  lenisRef.current = lenis;

  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const splash = splashRef.current;
    if (!splash) return;

    let finished = false;
    let hideTimer = 0;
    let completeTimer = 0;
    const body = document.body;

    const unlockScroll = () => {
      body.style.overflow = "";
      lenisRef.current?.start();
    };

    // Idempotent : ne se termine qu'une fois (le cleanup appelle aussi close()).
    const close = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(hideTimer);
      window.clearTimeout(completeTimer);
      onCompleteRef.current();
    };

    const skipToEnd = () => {
      unlockScroll();
      onRevealRef.current();
      close();
    };

    // Pas d'animation pour les personnes sensibles au mouvement.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Mobile : le splash coûte ~2.1 s de LCP (h1 masqué). On saute entièrement
    // → le héro peint immédiatement. (pointer: coarse) ne remonterait pas en
    // headless (Lighthouse PSI virtuel) → on ajoute la règle de largeur ≤767.
    const skipForMobile = window.matchMedia(
      "(pointer: coarse), (max-width: 767px)"
    ).matches;

    // Déjà vu dans cette session → skip direct.
    let seen = false;
    try {
      seen =
        typeof sessionStorage !== "undefined" &&
        sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }

    if (reduced || seen || skipForMobile) {
      skipToEnd();
      return;
    }

    // Verrouillage du scroll pendant le splash.
    lenisRef.current?.stop();
    body.style.overflow = "hidden";

    // Le remplissage termine → le splash part en fade pendant que le contenu
    // se révèle derrière (pas de flash : le splash couvre encore).
    hideTimer = window.setTimeout(() => {
      splash.classList.add("splash-screen--hide");
      onRevealRef.current();
      ScrollTrigger.refresh();
      lenisRef.current?.resize();
    }, HIDE_AT_MS);

    // Le fade est fini → démontage propre (sans coupure).
    completeTimer = window.setTimeout(() => {
      unlockScroll();
      onCompleteRef.current();
    }, COMPLETE_AT_MS);

    // Vu pour la session courante (ne masque pas la 1re visite).
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* sessionStorage indisponible : pas grave */
    }

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(completeTimer);
      unlockScroll();
      close();
    };
  }, []);

  return (
    <div
      ref={splashRef}
      id="splash-screen"
      className="splash-screen"
      aria-hidden="true"
    >
      <div className="juice-stage" aria-hidden="true">
        <div className="juice-base" />
        <div className="juice-fill" />
        <div className="juice-surface" />
      </div>
    </div>
  );
}