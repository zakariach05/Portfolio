"use client";

import SectionTitle from "@/components/SectionTitle";
import ServicesGrid from "@/components/ServicesGrid";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Expertise — portage de la section #expertise de legacy/index.html.
 *
 * 5 cartes rôles (données traduites FR/EN depuis locales/*.json) affichées
 * dans ServicesGrid : icônes SVG multi-couches animées (float idle, rotation
 * des couches, hover amplifié) + entrée au scroll GSAP (chute en rotation).
 */
export default function Expertise() {
  const { t, dict } = useLanguage();
  return (
    <section id="expertise" className="py-24 bg-black relative overflow-clip">
      <div className="container mx-auto px-6 relative z-10">
        <div className="section-header text-center mb-20">
          <SectionTitle
            white={t("expertise.titleWhite")}
            red={t("expertise.titleRed")}
            align="center"
            className="mb-4"
          />
          <div className="racing-stripe mx-auto"></div>
        </div>

        <ServicesGrid cards={dict.expertise.cards} />
      </div>
    </section>
  );
}