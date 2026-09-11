"use client";

/**
 * /projets — page dédiée à tous les projets : même effet que la section
 * #projects de la home (empilement sticky + stickers ANNÉE/NICHE latéraux)
 * appliqué à TOUS les projets (WORKS non restreint).
 */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { PROJECTS } from "@/lib/projects";
import RevealText from "@/components/RevealText";
import WorksStack from "@/components/WorksStack";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProjetsPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  useGSAP(
    () => {
      if (typeof gsap === "undefined") return;
      const section = sectionRef.current;
      if (!section) return;
      gsap.from("#projets-page .container", {
        scrollTrigger: {
          trigger: "#projets-page",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <main
      ref={sectionRef}
      id="projets-page"
      className="relative min-h-screen pt-32 pb-20 bg-white dark:bg-black transition-colors duration-300 overflow-clip"
    >
      <div className="container mx-auto px-6 relative z-10">
        <h1 className="text-4xl md:text-6xl font-[900] tracking-tighter uppercase leading-none mb-4 text-center">
          <RevealText as="span" fromColor="rgba(255,255,255,0.2)" toColor="#ffffff" stagger={0.05} className="text-black dark:text-white">
            {t("projectsPage.titleWhite")}
          </RevealText>{" "}
          <RevealText as="span" fromColor="rgba(248,113,113,0.25)" toColor="#ef4444" stagger={0.05} className="text-red-500">
            {t("projectsPage.titleRed")}
          </RevealText>
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-12">
          {t("projectsPage.subtitle")}
        </p>
      </div>

      <WorksStack projects={PROJECTS} />

      <Footer />
    </main>
  );
}