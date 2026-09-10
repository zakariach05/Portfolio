"use client";

/**
 * ProjectLightbox — overlay inline (même page, aucune navigation) pour afficher
 * le média d'un projet en grand :
 *  - image → <Image> plein format (next/image, dims depuis lib/projects.ts)
 *  - vidéo → <video controls autoPlay playsInline> (arrêté à la fermeture)
 *
 * Fermeture : bouton ×, clic en dehors du média, ou touche Échap.
 * Au montage : focus sur « Fermer », scroll bloqué (body + Lenis), débloqué
 * au démontage (effet propre, refs pour éviter le re-run null→instance).
 */
import { useEffect, useRef } from "react";
import Image from "next/image";
import { useLenis } from "@/components/providers/LenisProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Project } from "@/lib/projects";
import type Lenis from "lenis";

export default function ProjectLightbox({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const lenis = useLenis();
  const lenisRef = useRef<Lenis | null>(null);
  lenisRef.current = lenis;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const { t, dict } = useLanguage();
  // Description traduite (fallback : description FR de lib/projects.ts).
  const description =
    dict.projects.items.find((item) => item.id === project.id)?.description ??
    project.description;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };

    lenisRef.current?.stop();
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenisRef.current?.start();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isVideo = project.mediaType === "video" && project.videoSrc;

  return (
    <div
      className="project-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        ref={closeRef}
        type="button"
        className="project-lightbox-close"
        onClick={onClose}
        aria-label={t("lightbox.closeLabel")}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        {t("lightbox.close")}
      </button>

      <div className="project-lightbox-inner">
        {isVideo ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            key={project.videoSrc}
            src={project.videoSrc}
            controls
            autoPlay
            playsInline
          />
        ) : (
          <Image
            src={project.imageSrc}
            alt={project.imageAlt}
            width={project.imageWidth}
            height={project.imageHeight}
          />
        )}

        <div className="project-lightbox-caption">
          <h3>{project.title}</h3>
          <p>{description}</p>
          {project.href && (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="project-lightbox-link"
            >
              {t("lightbox.viewProject")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}