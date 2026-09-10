type JuiceLogoProps = {
  className?: string;
};

/**
 * JuiceLogo — le V rempli en rouge (même rendu que le splash une fois plein),
 * sous forme statique. Réutilise le masque /NV-IMG/logo.png + les couches
 * `.juice-base` / `.juice-fill` / `.juice-surface` définies pour le splash ;
 * la seule différence : le remplissage est déjà à 100% (`.juice-fill--full`),
 * aucune animation.
 */
export default function JuiceLogo({ className }: JuiceLogoProps) {
  return (
    <div className={`juice-logo ${className ?? ""}`.trim()} aria-hidden="true">
      <div className="juice-base" />
      <div className="juice-fill juice-fill--full" />
      <div className="juice-surface" />
    </div>
  );
}