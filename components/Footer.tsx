"use client";

/**
 * Footer — version simplifiée (remplace l'ancien "F1 Premium" footer
 * + la section ZakariaFinale).
 *
 * Design inspiré de "Cronicle" : titre + un CTA + une rangée de liens
 * soulignés. Pas de GSAP, pas de parallax, pas de glitch effect.
 * Garde le thème noir/rouge du site. Textes FR/EN via locales/*.json.
 * Visuel bas de page optimisé via next/image.
 */
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

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
      className="relative z-30 w-full bg-black px-6 py-24 md:py-32 text-center"
    >
      {/* Titre */}
      <h2 className="mx-auto max-w-3xl font-outfit text-4xl md:text-6xl font-extrabold uppercase tracking-tight text-white">
        {t("footer.titleWhite")}{" "}
        <span className="text-accent-bright">{t("footer.titleRed")}</span>
      </h2>

      {/* CTA */}
      <div className="mt-8">
        <a
          href="/CV_Zakaria_Chamekh.pdf"
          download
          className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold uppercase tracking-wide text-black transition-colors duration-300 hover:bg-accent-bright hover:text-white"
        >
          {t("footer.cta")}
          <span aria-hidden>↗</span>
        </a>
      </div>

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
            className="text-sm md:text-base uppercase tracking-wide text-white/70 underline underline-offset-4 decoration-white/30 transition-colors duration-200 hover:text-accent-bright hover:decoration-accent-bright"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Bas de page */}
      <p className="mt-20 text-[11px] tracking-widest text-white/30 uppercase">
        {t("footer.copyright")}
      </p>

      {/* Visuel bas de footer (remplace le mot géant ZAKARIA) */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative mt-6 -mx-6 -mb-24 md:-mb-32 select-none overflow-hidden"
      >
        <Image
          src="/NV-IMG/vidio/footer%20video.png"
          alt=""
          width={1672}
          height={941}
          loading="lazy"
          draggable={false}
          className="block h-[36vh] min-h-[240px] w-full object-cover"
        />
        {/* Fondu haut pour fondre l'image dans le noir du footer */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent" />
      </div>
    </footer>
  );
}