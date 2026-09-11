"use client";

/**
 * About — portage de la section #about de legacy/index.html.
 *
 *  - Photo de fond (heroP1) délavée + dégradés noirs
 *  - Manifesto : lignes reveal-type (CSS back/front) animées au scroll
 *    via initAboutReveal (rotateX/z/skewY scrub + tilt souris)
 *  - Bande marquee full-width (3 lignes) avec filtre SVG liquid-distort
 *  - Grille stats (ENSAM / ISFO / Full Stack)
 *  Textes FR/EN via locales/*.json (mots-clés tech en badges).
 */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import AppImage from "@/components/AppImage";
import Marquee from "@/components/Marquee";
import RevealText from "@/components/RevealText";
import SectionTitle from "@/components/SectionTitle";
import { useLanguage } from "@/contexts/LanguageContext";

/** Badge mot-clé technique (même style que les anciens badges React/Laravel). */
const TECH_BADGE_CLASS =
  "bg-white/10 px-2 py-1 rounded text-white font-semibold border border-white/20 hover:border-red-500 transition-colors cursor-default";

function renderTechBadges(items: string[]) {
  return items.map((tech, i) => (
    <span key={tech}>
      {i > 0 && ", "}
      <span className={TECH_BADGE_CLASS}>{tech}</span>
    </span>
  ));
}

/** Styles d'icônes par position (titres/textes depuis dict.about.cards). */
const CARD_STYLES = [
  {
    icon: "fas fa-graduation-cap",
    box: "bg-red-500/20",
    iconColor: "text-red-500",
    hover: "hover:border-red-500",
  },
  {
    icon: "fas fa-certificate",
    box: "bg-red-500/20",
    iconColor: "text-red-500",
    hover: "hover:border-red-500",
  },
  {
    icon: "fas fa-code-branch",
    box: "bg-white/10",
    iconColor: "text-white",
    hover: "hover:border-white",
  },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t, dict } = useLanguage();

  useGSAP(
    () => {
      if (typeof gsap === "undefined") return;

      const finePointer = window.matchMedia("(pointer: fine)").matches;

      sectionRef.current
        ?.querySelectorAll<HTMLElement>(".reveal-type")
        .forEach((el) => {
          const container = el.querySelector<HTMLElement>(
            ".perspective-container"
          );
          if (!container) return;

          gsap.fromTo(
            container,
            { rotateX: 45, z: -500, opacity: 0, skewY: 5 },
            {
              rotateX: 0,
              z: 0,
              opacity: 1,
              skewY: 0,
              ease: "power4.out",
              scrollTrigger: {
                trigger: el,
                start: "top 95%",
                end: "bottom 20%",
                scrub: 1.5,
              },
            }
          );

          if (finePointer) {
            const rotY = gsap.quickTo(container, "rotationY", {
              duration: 0.6,
              ease: "power2.out",
            });
            const rotX = gsap.quickTo(container, "rotationX", {
              duration: 0.6,
              ease: "power2.out",
            });

            const onMove = (e: MouseEvent) => {
              const r = el.getBoundingClientRect();
              const x = (e.clientX - r.left) / r.width - 0.5;
              const y = (e.clientY - r.top) / r.height - 0.5;
              rotY(x * 20);
              rotX(-y * 20);
            };
            const onLeave = () => {
              rotY(0);
              rotX(0);
            };

            el.addEventListener("mousemove", onMove);
            el.addEventListener("mouseleave", onLeave);
          }
        });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-24 bg-black relative overflow-clip"
      style={{ position: "relative", zIndex: 30 }}
    >
      {/* Large Background Photo */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <AppImage
          src="/NV-IMG/about-bg.webp"
          alt={t("about.bgAlt")}
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          loading="lazy"
          className="object-cover object-center filter grayscale contrast-125 mx-auto"
          style={{
            maxWidth: 1200,
            maskImage:
              "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent"></div>
      </div>

      {/* Gradient top — blends with the fixed background behind */}
      <div
        className="absolute top-0 left-0 w-full h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #000)", zIndex: 0 }}
      ></div>

      <div className="container mx-auto px-6 relative z-10">
        <SectionTitle white={t("about.titleWhite")} red={t("about.titleRed")} align="center" className="mb-16" />

        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="manifesto-line mb-1 reveal-type" data-speed="0.1">
            <div className="perspective-container">
              <span className="back">CREATOR</span>
              <span className="front">CREATOR</span>
            </div>
          </div>
          <div className="racing-stripe my-2"></div>
          <div className="manifesto-line mb-4 reveal-type" data-speed="0.2">
            <div className="perspective-container">
              <span className="back">ENGINEER</span>
              <span className="front">ENGINEER</span>
            </div>
          </div>
          <h3
            className="manifesto-line font-bold mb-6 text-white reveal-type"
            style={{
              fontSize: "clamp(1.5rem, 3.5vw, 3rem)",
              lineHeight: 1.2,
              display: "block",
            }}
          >
            <div className="perspective-container">
              <RevealText as="div" stagger={0.04}>
                {t("about.tagline1")}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">
                  {t("about.tagline2")}
                </span>
              </RevealText>
            </div>
          </h3>

          <div className="space-y-6 text-lg font-medium leading-relaxed">
            <div className="reveal-type" data-speed="0.1">
              <div className="perspective-container">
                <RevealText as="div" stagger={0.03} className="text-gray-300">
                  <p>
                    {t("about.para1a")}{" "}
                    <span className="text-red-500 font-bold">
                      {t("about.para1city")}
                    </span>
                    {t("about.para1b")}
                    {renderTechBadges(dict.about.frontend)}
                    {t("about.para1c")}
                    {renderTechBadges(dict.about.backend)}
                    {t("about.para1d")}
                    {renderTechBadges(dict.about.databases)}
                    {t("about.para1e")}
                  </p>
                </RevealText>
              </div>
            </div>
            <div className="reveal-type" data-speed="0.15">
              <div className="perspective-container">
                <RevealText as="div" stagger={0.03} className="text-gray-300">
                  <p>
                    {t("about.para2a")}{" "}
                    <strong className="text-white">
                      {t("about.para2companies")}
                    </strong>{" "}
                    {t("about.para2b")}
                  </p>
                </RevealText>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THE MARQUEE */}
      <div
        className="relative z-10 my-24 py-10 bg-black/40 backdrop-blur-sm border-y border-white/10"
        style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)", overflow: "hidden" }}
      >
        <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
          <defs>
            <filter id="liquid-distort">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.015"
                numOctaves="3"
                result="noise"
                seed="2"
              >
                <animate
                  attributeName="baseFrequency"
                  values="0.015;0.025;0.015"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="G"
                id="liquid-map"
              >
                <animate
                  attributeName="scale"
                  values="0;18;0"
                  dur="0.6s"
                  begin="indefinite"
                  fill="freeze"
                  id="liquid-anim"
                />
              </feDisplacementMap>
            </filter>
          </defs>
        </svg>

        <Marquee />
      </div>

      {/* Modern Stats / Info Grid */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {dict.about.cards.map((card, i) => {
            const style = CARD_STYLES[i] ?? CARD_STYLES[0];
            return (
              <div
                key={card.title}
                className={`p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 ${style.hover} transition-all duration-300`}
              >
                <div
                  className={`w-12 h-12 ${style.box} rounded-xl flex items-center justify-center mb-4`}
                >
                  <i className={`${style.icon} text-2xl ${style.iconColor}`}></i>
                </div>
                <h4 className="font-bold text-white text-xl mb-2">
                  {card.title}
                </h4>
                <p className="text-gray-400">{card.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}