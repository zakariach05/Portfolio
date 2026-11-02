"use client";

import dynamic from "next/dynamic";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./Hero3DText.module.css";

/**
 * Même coque HTML que Hero3DText avant l'hydratation : le canvas est transparent
 * jusqu'à l'initialisation de Three.js, donc ce shell ne change aucun pixel.
 * Il conserve aussi le H1 et les liens clavier pendant le code-splitting.
 */
function HeroLoading() {
  const { t } = useLanguage();
  const role = t("hero.roleShort");
  const projectsLabel = t("hero.ctaProjects");
  const contactLabel = t("hero.ctaContact");
  const ariaLabel = t("hero.canvasLabel");

  return (
    <div className={styles.visual}>
      <h1 className={styles.srOnly}>Zakaria Chamekh — {role}</h1>
      <canvas
        className={styles.canvas}
        aria-label={ariaLabel}
        role="img"
      />
      <div className={styles.srLinks}>
        <a className={styles.srLink} href="#projects">
          {projectsLabel}
        </a>
        <a className={styles.srLink} href="#contact">
          {contactLabel}
        </a>
      </div>
    </div>
  );
}

// Le canvas Three.js reste visuellement identique, mais son code lourd n'est
// plus dans le chemin critique du premier rendu.
const Hero3DText = dynamic(() => import("@/components/Hero3DText"), {
  ssr: false,
  loading: () => <HeroLoading />,
});

/**
 * Hero — coque de section uniquement.
 * Tout le rendu (canvas 3D, texte, boutons, accessibilité) vit dans Hero3DText.
 */
export default function Hero() {
  return (
    <section id="home" style={{ position: "relative", zIndex: 1 }}>
      <Hero3DText />
    </section>
  );
}
