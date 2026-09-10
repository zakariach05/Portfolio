import type { CSSProperties, MouseEvent } from "react";
import Logo from "@/components/Logo";

const RING_R = 22;
const RING_CIRC = 2 * Math.PI * RING_R;

type ScrollIndicatorProps = {
  /**
   * 0 → 1 : anneau partiel façon "loader" (état scroll actif).
   * `null` (défaut) : anneau complet (état repos).
   */
  progress?: number | null;
  /**
   * Variable UNIQUE : l'anneau ET le "V" héritent via `currentColor`.
   * Changer cette seule valeur change les deux automatiquement.
   */
  color?: string;
  /** Diamètre du SVG (défaut 50, comme le bouton d'origine). */
  size?: number;
  /** Fond du disque (défaut noir). */
  background?: string;
  /** Épaisseur de l'anneau. */
  ringWidth?: number;
  /**
   * Rotation (degrés) appliquée au seul arc de progression — ex.
   * `progress * 360` pour un tour complet piloté par le scroll.
   * Le "V" et le fond ne tournent pas. Défaut 0.
   */
  rotation?: number;
  label?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

/**
 * ScrollIndicator — bouton circulaire fixe : anneau de progression SVG +
 * "V" centré, synchronisés par une seule couleur (`currentColor`).
 *
 * Exemples :
 *   // État scroll actif — anneau partiel bleu + V bleu
 *   <ScrollIndicator progress={0.45} color="#3b82f6" label="Scroll progress" onClick={top} />
 *   // État repos — anneau complet rouge + V rouge
 *   <ScrollIndicator progress={null} color="#ef4444" background="#1a0505" label="Back to top" onClick={top} />
 */
export default function ScrollIndicator({
  progress = null,
  color = "#dc2626",
  size = 50,
  background = "#000000",
  ringWidth = 3,
  rotation = 0,
  label = "Scroll",
  id,
  className,
  style,
  onClick,
}: ScrollIndicatorProps) {
  const p =
    progress == null ? null : Math.min(Math.max(progress, 0), 1);

  return (
    <button
      type="button"
      id={id}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={className}
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        cursor: "pointer",
        color,
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          height: "100%",
        }}
      >
        <svg
          className="progress-ring"
          viewBox="0 0 50 50"
          style={{ width: size, height: size }}
        >
          {/* Fond du disque */}
          <circle cx="25" cy="25" r="25" fill={background} />
          {/* Piste fantôme (visible en mode loader) */}
          <circle
            cx="25"
            cy="25"
            r={RING_R}
            fill="none"
            stroke="currentColor"
            opacity={0.18}
            strokeWidth={ringWidth}
          />
          {/* Anneau : complet au repos, partiel selon le % en scroll.
              Départ en haut via le rotate(-90deg) du CSS (.progress-ring) ;
              `rotation` ajoute la rotation pilotée par le scroll. */}
          <circle
            className="progress-ring__circle"
            cx="25"
            cy="25"
            r={RING_R}
            fill="none"
            stroke="currentColor"
            strokeWidth={ringWidth}
            strokeLinecap="round"
            strokeDasharray={
              p == null ? undefined : `${p * RING_CIRC} ${RING_CIRC}`
            }
            transform={
              rotation ? `rotate(${rotation} 25 25)` : undefined
            }
          />
        </svg>
        {/* "V" hérite de la même couleur via currentColor → toujours synchro */}
        <Logo
          ring={false}
          color="currentColor"
          size={size * 0.6}
          className="scroll-top-logo"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </span>
    </button>
  );
}
