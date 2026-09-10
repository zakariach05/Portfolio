import type { CSSProperties } from "react";

type LogoProps = {
  /**
   * Couleur UNIQUE qui pilote à la fois la bordure du cercle ET le "V"
   * (via currentColor) — impossible de les désynchroniser.
   * Accepte n'importe quelle couleur CSS ("#dc2626", "var(--logo-color)"…).
   */
  color?: string;
  /** Diamètre en px. */
  size?: number;
  /** Affiche l'anneau + le fond noir. `false` = "V" seul (à imbriquer
   * dans un bouton circulaire existant, ex. ScrollTopButton). */
  ring?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Si fourni : role="img" + <title> ; sinon aria-hidden (décoratif). */
  label?: string;
};

/**
 * Logo "V" circulaire — SVG (préféré au PNG car : net à toutes les
 * tailles/retina, une seule prop `color` recolore bordure + V de façon
 * atomique, aucune requête HTTP, thémable via variable CSS).
 *
 * Exemple rouge → bleu en une seule prop :
 *   <Logo color="#dc2626" size={44} />  // rouge
 *   <Logo color="#2563eb" size={44} />  // bleu
 */
export default function Logo({
  color = "#dc2626",
  size = 44,
  ring = true,
  className,
  style,
  label,
}: LogoProps) {
  return (
    <span
      className={className}
      style={{ display: "inline-flex", width: size, height: size, color, ...style }}
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
    >
      <svg
        viewBox="0 0 64 64"
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        {label ? <title>{label}</title> : null}
        {ring ? (
          <circle
            cx="32"
            cy="32"
            r="29"
            fill="#000000"
            stroke="currentColor"
            strokeWidth="3"
          />
        ) : null}
        <path
          d="M20 19 L32 45 L44 19"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
