"use client";

/**
 * Projects — portage de la section #projects de legacy/index.html.
 *
 * Grille masonry (.projects-masonry) avec 9 projets (lib/projects.ts) :
 *  - révélation au scroll (fromTo y100/opacity0/scale.95)
 *  - desktop : parallax scrub + tilt 3D au survol (quickTo)
 *  - hover filtre sur l'image (voire .img-wrapper CSS)
 *  - 05-Electro : tags groupés (Frontend/Backend/Infrastructure)
 */
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { PROJECTS, type Project } from "@/lib/projects";
import SectionTitle from "@/components/SectionTitle";
import ProjectLightbox from "@/components/ProjectLightbox";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

function TopographicLines() {
  return (
    <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0,200 Q250,150 500,200 T1000,200" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M0,400 Q250,350 500,400 T1000,400" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M0,600 Q250,550 500,600 T1000,600" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M0,800 Q250,750 500,800 T1000,800" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M100,0 Q150,250 100,500 T100,1000" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M300,0 Q350,250 300,500 T300,1000" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M700,0 Q750,250 700,500 T700,1000" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M900,0 Q950,250 900,500 T900,1000" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const { t } = useLanguage();

  useGSAP(
    () => {
      if (typeof gsap === "undefined") return;

      const section = sectionRef.current;
      if (!section) return;

      // Fade-in du .container (comme main.js)
      gsap.from("#projects .container", {
        scrollTrigger: {
          trigger: "#projects",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      // Révélation des cartes au scroll
      section.querySelectorAll<HTMLElement>(".project-card").forEach((card) => {
        gsap.fromTo(
          card,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  const openProject = (project: Project) => setActiveProject(project);
  const closeProject = () => setActiveProject(null);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="py-20 bg-white dark:bg-black transition-colors duration-300 relative overflow-clip"
      style={{ position: "relative", zIndex: 30 }}
    >
      <TopographicLines />

      <div className="container mx-auto px-6 relative z-10">
        <SectionTitle white={t("projects.titleWhite")} red={t("projects.titleRed")} align="center" className="mb-14" />

        <div className="projects-lightbox-grid">
          {PROJECTS.map((project) => {
            const isVideo = project.mediaType === "video" && project.videoSrc;
            return (
              <button
                key={project.title}
                type="button"
                className="project-card"
                onClick={() => openProject(project)}
                aria-label={`${t("projects.openLabel")} ${project.title}`}
                aria-haspopup="dialog"
              >
                <span className="project-card-media">
                  {isVideo ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video
                      src={project.videoSrc}
                      muted
                      playsInline
                      preload="metadata"
                      aria-hidden="true"
                    />
                  ) : (
                    <Image
                      src={project.imageSrc}
                      alt=""
                      width={project.imageWidth}
                      height={project.imageHeight}
                      loading="lazy"
                      aria-hidden="true"
                    />
                  )}
                </span>

                <span className="project-tag">
                  {isVideo ? t("projects.tagVideo") : t("projects.tagImage")}
                </span>

                {isVideo && (
                  <span className="project-play" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                  </span>
                )}

                <span className="project-label">{project.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeProject && (
        <ProjectLightbox project={activeProject} onClose={closeProject} />
      )}
    </section>
  );
}