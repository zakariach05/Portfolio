"use client";

/**
 * Footer — version simplifiée (remplace l'ancien "F1 Premium" footer
 * + la section ZakariaFinale).
 *
 * Design inspiré de "Cronicle" : titre + un CTA + une rangée de liens
 * soulignés. Pas de GSAP, pas de parallax, pas de glitch effect.
 * Garde le thème noir/rouge du site. Textes FR/EN via locales/*.json.
 *
 * Le bas de page est un mot géant tronqué par le bord, sur lequel des
 * cubes 3D (FooterCubes) tombent et rebondissent.
 */
import dynamic from "next/dynamic";
import { useLanguage } from "@/contexts/LanguageContext";

/** Mot géant du bas de page. Change-le ici uniquement. */
const FOOTER_WORD = "ZAKARIA";

const FooterCubes = dynamic(() => import("@/components/FooterCubes"), {
  ssr: false,
});

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/zakaria-chamekh-996812319/" },
  { label: "GitHub", href: "https://github.com/zakariach05" },
  { label: "Instagram", href: "https://www.instagram.com/forev_60/" },
  { label: "Twitter / X", href: "https://x.com/ChamekhZak33734" },
];

export default function Footer() {
  const { t, dict } = useLanguage();
  return (
    <footer
      id="site-footer"
      className="relative z-30 w-full overflow-hidden bg-bg px-6 py-24 text-center md:py-32"
    >
      {/* Titre */}
      <h2 className="section-title mx-auto max-w-3xl font-nabla text-4xl uppercase tracking-tight text-ink md:text-6xl">
        {t("footer.titleWhite")}{" "}
        <span className="text-accent-bright">{t("footer.titleRed")}</span>
      </h2>

      {/* Liens : pages + réseaux, une seule rangée simple */}
      <nav
        aria-label="Footer links"
        className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
      >
        {[...dict.footer.links, ...SOCIAL_LINKS].map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-sm uppercase tracking-wide text-ink/70 underline underline-offset-4 decoration-ink/30 transition-colors duration-200 hover:text-accent-bright hover:decoration-accent-bright md:text-base"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Bas de page */}
      <p className="mt-20 text-[11px] uppercase tracking-widest text-ink/40">
        {t("footer.copyright")}
      </p>

      {/* Mot géant tronqué + cubes 3D */}
      <div className="fc-stage mt-6 -mx-6 -mb-24 md:-mb-32">
        <div className="fc-word-layer" aria-hidden="true">
          <span className="fc-word">{FOOTER_WORD}</span>
        </div>
        <FooterCubes
          hint={t("footer.cubesHint")}
          buttonLabel={t("footer.cubesButton")}
        />
      </div>
    </footer>
  );
}
