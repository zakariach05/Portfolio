"use client";

/**
 * Projects — section #projects (home) : titre + WorksStack (empilement sticky
 * des projets type Awwwards) + bouton « Voir tous les projets » → /projets.
 */
import Link from "next/link";
import { WORKS } from "@/lib/projects";
import SectionTitle from "@/components/SectionTitle";
import WorksStack from "@/components/WorksStack";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Projects() {
  const { t } = useLanguage();

  return (
    <section
      id="projects"
      className="bg-black text-white relative"
      style={{ position: "relative", zIndex: 30 }}
    >
      <div className="container mx-auto px-6 pt-24 pb-8 relative z-10">
        <SectionTitle
          white={t("projects.titleWhite")}
          red={t("projects.titleRed")}
          align="center"
          className="mb-4"
        />
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        <p className="text-center text-white/50 uppercase tracking-[0.2em] text-xs mt-2">
          {"— 04 / Works —"}
        </p>
      </div>

      <WorksStack projects={WORKS} />

      {/* Bouton "View All Works" */}
      <div className="container mx-auto px-6 relative z-10 flex justify-center pb-24 pt-4">
        <Link
          href="/projets"
          className="inline-flex items-center gap-3 bg-white text-black font-bold uppercase tracking-[0.15em] px-10 py-5 rounded-full transition-all duration-300 hover:bg-accent-bright hover:text-white"
        >
          {t("projects.viewAllWorks")} ↗
        </Link>
      </div>
    </section>
  );
}