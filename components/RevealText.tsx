"use client";

/**
 * RevealText — effet "scroll reveal text" réutilisable (site complet).
 *
 * - Découpe le texte en mots (<span class="reveal-word">) — alternative
 *   gratuite à GSAP SplitText (payant). Gère tout children React (string,
 *   JSX mixte avec badges, <strong>, <br/>, etc.) en ne découpant que les
 *   nœuds texte, sans casser le markup existant.
 * - Chaque mot part de rgba(255,255,255,0.2) et passe à 1 au scroll,
 *   scrubbé (lié au scroll, pas temporel).
 * - Un ScrollTrigger par instance : trigger = le bloc lui-même,
 *   start "top 80%" → end "bottom 40%" (props ajustables).
 * - Respecte prefers-reduced-motion : affiche direct en blanc.
 * - Usage : <RevealText as="h2">Mon titre</RevealText>
 *   ou <RevealText as="p">Texte avec <span className="badge">badge</span></RevealText>
 *   Classe .reveal-text exposée. Aussi auto-init sur tout .reveal-text du DOM
 *   (si l'utilisateur ajoute juste la classe sans le composant).
 */
import {
  createElement,
  isValidElement,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { onIdle } from "@/lib/defer";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useTheme } from "@/contexts/ThemeContext";

type RevealTone = "ink" | "accent";

type RevealTextProps = {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span";
  className?: string;
  style?: React.CSSProperties;
  stagger?: number;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  fromColor?: string;
  toColor?: string;
  /** Theme-aware palette. Overrides fromColor/toColor and follows theme changes. */
  tone?: RevealTone;
};

/** Builds an rgba() string from a CSS colour-channel variable (e.g. "26 13 15"). */
function channelsToRgba(value: string, alpha: number): string | null {
  const channels = value.trim().split(/\s+/).join(", ");
  if (!channels) return null;
  return `rgba(${channels}, ${alpha})`;
}

function toneColors(el: HTMLElement, tone: RevealTone) {
  const styles = getComputedStyle(el);
  const variable = tone === "accent" ? "--accent-rgb" : "--ink-rgb";
  const channels = styles.getPropertyValue(variable);
  const from = channelsToRgba(channels, tone === "accent" ? 0.25 : 0.2);
  const to = channelsToRgba(channels, 1);
  return from && to ? { from, to } : null;
}

function splitTextNodes(root: HTMLElement) {
  const walker: Node[] = Array.from(root.childNodes);
  for (const node of walker) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (!text.trim()) continue;
      const parts = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      for (const part of parts) {
        if (part === "") continue;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement("span");
          span.className = "reveal-word";
          span.textContent = part;
          frag.appendChild(span);
        }
      }
      node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.classList.contains("reveal-word")) continue;
      if (["SCRIPT", "STYLE", "SVG", "PATH", "CIRCLE", "RECT", "G"].includes(el.tagName)) continue;
      if (el.className && typeof el.className === "string" && el.className.includes("rounded")) {
        continue;
      }
      // Garde le dégradé du tagline (text-transparent bg-clip) intact
      if (el.classList.contains("text-transparent")) continue;
      splitTextNodes(el);
    }
  }
}

export default function RevealText(props: RevealTextProps) {
  // Le composant découpe ses textes dans le DOM et restaure son HTML au
  // cleanup : sur un changement de langue (children différents), React doit
  // repartir d'une instance neuve, sinon l'ancien texte est réinjecté.
  return <RevealTextInner key={plainText(props.children)} {...props} />;
}

function plainText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(plainText).join("|");
  if (isValidElement(node)) {
    return plainText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

function RevealTextInner({
  children,
  as = "p",
  className = "",
  style,
  stagger = 0.05,
  start = "top 80%",
  end = "bottom 40%",
  scrub = true,
  fromColor = "rgba(255,255,255,0.2)",
  toColor = "rgba(255,255,255,1)",
  tone,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { theme } = useTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Theme-aware palette, resolved at run time so it follows theme switches.
    const themed = tone ? toneColors(el, tone) : null;
    const resolvedFrom = themed?.from ?? fromColor;
    const resolvedTo = themed?.to ?? toColor;

    // Sauvegarde pour cleanup (restaure le HTML d'origine)
    const originalHTML = el.innerHTML;

    // Découpe en mots (DOM) — une seule fois
    splitTextNodes(el);

    const wordEls = el.querySelectorAll<HTMLElement>(".reveal-word");
    if (wordEls.length === 0) return;

    let cancelled = false;
    let ctx: any = null;
    let gsapRef: any = null;
    let ScrollTriggerRef: any = null;

    const cancelIdle = onIdle(async () => {
      if (cancelled) return;
      const [{ gsap }] = await Promise.all([import("gsap")]);
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (cancelled) return;
      gsapRef = gsap;
      ScrollTriggerRef = ScrollTrigger;

      // Mobile : pas de scrub (TBT) — affiche direct en couleur finale
      try {
        if (window.matchMedia("(pointer: coarse), (max-width: 767px)").matches) {
          gsap.set(wordEls, { color: resolvedTo });
          return;
        }
      } catch {
        /* ignore */
      }

      if (reduceMotion) {
        gsap.set(wordEls, { color: resolvedTo });
        return;
      }

      ctx = gsap.context(() => {
        gsap.fromTo(
          wordEls,
          { color: resolvedFrom },
          {
            color: resolvedTo,
            stagger,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start,
              end,
              scrub: scrub === true ? true : scrub,
            },
          }
        );
      }, el);
    });

    return () => {
      cancelled = true;
      cancelIdle();
      if (ctx) {
        try {
          ctx.revert();
        } catch {
          /* ignore */
        }
      } else if (gsapRef && ScrollTriggerRef) {
        // Cleanup any ScrollTriggers that may have been created before ctx revert
        try {
          ScrollTriggerRef.getAll().forEach((st: any) => {
            if (st.trigger === el) st.kill();
          });
        } catch {
          /* ignore */
        }
      }
      // Restore original HTML in all cases
      try {
        el.innerHTML = originalHTML;
      } catch {
        /* ignore */
      }
    };
  }, [reduceMotion, stagger, start, end, scrub, fromColor, toColor, tone, theme, children]);

  return createElement(
    as as never,
    { ref: ref as never, className: `reveal-text ${className}`.trim(), style },
    children as never
  );
}
