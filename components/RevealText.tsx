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
import { createElement, useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "framer-motion";

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
};

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

export default function RevealText({
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
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Sauvegarde pour cleanup (restaure le HTML d'origine)
    const originalHTML = el.innerHTML;

    // Découpe en mots (DOM) — une seule fois
    splitTextNodes(el);

    const wordEls = el.querySelectorAll<HTMLElement>(".reveal-word");
    if (wordEls.length === 0) return;

    // Mobile tactile : pas de scrub (TBT) — affiche direct en couleur finale
    try {
      if (window.matchMedia("(pointer: coarse)").matches) {
        gsap.set(wordEls, { color: toColor });
        return () => {
          el.innerHTML = originalHTML;
        };
      }
    } catch {
      /* ignore */
    }

    if (reduceMotion) {
      gsap.set(wordEls, { color: toColor });
      return () => {
        el.innerHTML = originalHTML;
      };
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordEls,
        { color: fromColor },
        {
          color: toColor,
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

    return () => {
      ctx.revert();
      el.innerHTML = originalHTML;
    };
  }, [reduceMotion, stagger, start, end, scrub, fromColor, toColor, children]);

  return createElement(
    as as never,
    { ref: ref as never, className: `reveal-text ${className}`.trim(), style },
    children as never
  );
}
