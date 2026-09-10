"use client";

import SectionTitle from "@/components/SectionTitle";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Expertise — portage de la section #expertise de legacy/index.html.
 *
 * 5 cartes rôles (données traduites FR/EN depuis locales/*.json,
 * icônes locales par rôle).
 * La grille s'affiche en CSS (.expertise-grid) ; l'animation "shuffle"
 * (initExpertiseShuffle) n'était jamais invoquée en legacy → non migrée.
 */
const ICONS: Record<string, string> = {
  "role-frontend": "fas fa-desktop",
  "role-backend": "fas fa-server",
  "role-design": "fas fa-pen-nib",
  "role-testing": "fas fa-vial",
  "role-cloud": "fas fa-cloud",
};

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

        <div className="expertise-grid" id="expertise-stack">
          {dict.expertise.cards.map((card) => (
            <div className={`expertise-card ${card.role}`} key={card.role}>
              <div className="card-inner">
                <div className="card-icon">
                  <i className={ICONS[card.role] ?? "fas fa-code"}></i>
                </div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-text">{card.text}</p>
                <div className="card-tags">
                  {card.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}