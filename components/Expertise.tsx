"use client";

import SectionTitle from "@/components/SectionTitle";
import ExpertiseTunnel from "@/components/ExpertiseTunnel";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Expertise — « tunnel fold slider » WebGL.
 *
 * Les 7 cartes photo (/public/NV-IMG/Domaine-Dexpe/) défilent sur une ellipse :
 * la caméra est à l'intérieur du tunnel. Le tunnel gère lui-même la physique,
 * les accents dark/light, la pause hors écran et le fallback grille statique
 * (WebGL indisponible / reduced motion).
 */
export default function Expertise() {
  const { t, dict } = useLanguage();

  return (
    <section id="expertise" className="py-24 bg-bg relative overflow-clip">
      <div className="container mx-auto px-6 relative z-10">
        <div className="section-header text-center mb-12">
          <SectionTitle
            white={t("expertise.titleWhite")}
            red={t("expertise.titleRed")}
            align="center"
            className="mb-4"
          />
          <div className="racing-stripe mx-auto"></div>
        </div>

        <ExpertiseTunnel
          domains={dict.expertise.cards}
          labels={{ region: t("expertise.region") }}
        />
      </div>
    </section>
  );
}
