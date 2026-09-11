"use client";

/**
 * Logo065Tooltip — enveloppe le logo V d'un tooltip « 05 » décoratif au
 * survol (double rappel de l'identité « zakariach05 »). Aucun lien, pur
 * accent visuel. Réduit les mouvements si prefers-reduced-motion.
 */
import { useState } from "react";
import type { ReactNode } from "react";

type Logo065TooltipProps = {
  children: ReactNode;
  className?: string;
};

export default function Logo065Tooltip({
  children,
  className,
}: Logo065TooltipProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className ?? ""}`.trim()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {hovered && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-full border border-red-600/40 bg-black/90 px-2.5 py-1 font-mono text-[11px] tracking-[0.2em] text-red-500 shadow-lg shadow-red-900/30 tooltip-pop"
        >
          05
        </span>
      )}
    </span>
  );
}