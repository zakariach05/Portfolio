"use client";

/**
 * ScrollTopButton — portage du bouton "retour en haut" de legacy/index.html
 * (logique de main.js) : ScrollIndicator fixe (anneau de progression avec
 * code couleur selon le pourcentage de scroll : indigo → bleu → rouge),
 * visible après 500px. La couleur du "V" est synchronisée avec l'anneau
 * via la seule variable `color` (currentColor).
 */
import { useEffect, useState } from "react";
import ScrollIndicator from "@/components/ScrollIndicator";
import { useLanguage } from "@/contexts/LanguageContext";

function colorFor(percent: number): { color: string; width: number } {
  if (percent > 0.99) return { color: "#dc2626", width: 4 };
  if (percent > 0.7) return { color: "#0077ff", width: 3.5 };
  return { color: "#2402e6", width: 3 };
}

export default function ScrollTopButton() {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState("#2402e6");
  const [ringWidth, setRingWidth] = useState(3);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent =
        total > 0 ? Math.min(Math.max(window.scrollY / total, 0), 1) : 0;
      const { color: nextColor, width: nextWidth } = colorFor(percent);
      const nextVisible = window.scrollY > 500;
      // Ne met à jour que ce qui change (pas de re-render inutile au scroll).
      setProgress((p) => (Math.abs(p - percent) < 0.001 ? p : percent));
      setColor((c) => (c === nextColor ? c : nextColor));
      setRingWidth((w) => (w === nextWidth ? w : nextWidth));
      setVisible((v) => (v === nextVisible ? v : nextVisible));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <ScrollIndicator
      id="scroll-top"
      progress={progress}
      color={color}
      ringWidth={ringWidth}
      rotation={progress * 360}
      background="#000000"
      label={t("common.backTop")}
      className={`scroll-top-progress${visible ? " show" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );
}
