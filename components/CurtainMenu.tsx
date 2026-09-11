"use client";

/**
 * CurtainMenu — navbar "pill" + menu curtain (inspiré du concept montré,
 * adapté au thème du site : fond noir, accent rouge #DC2626, Getai Grotesk,
 * logo = V rempli en rouge (JuiceLogo, même visuel que le splash), police mono = JetBrains Mono).
 *
 *  - Pill fixe en haut : logo V (→ accueil), liens avec texte glissant
 *    (right→left), bouton grille (::) qui ouvre le rideau.
 *  - Curtain : monte de translateY(100%) → 0 (0.7s cubic-bezier), coins
 *    mono (infos), gros liens display getai, footer copyright + EN/FR,
 *    ticker réagissant à la direction du scroll (pendant qu'il temps).
 *  - Le bouton grille devient X quand le menu est ouvert.
 *  - Accessibilité : aria-expanded/controls, focus-visible, Esc pour fermer,
 *    prefers-reduced-motion respecté (transitions coupées + ticker arrêté).
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import JuiceLogo from "@/components/JuiceLogo";
import Logo065Tooltip from "@/components/Logo065Tooltip";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLenis } from "@/components/providers/LenisProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { COCOON_PAGES } from "@/lib/seo-cocoon";

type NavItemProps = {
  label: string;
  href: string;
  className?: string;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
};

/** Lien avec double texte glissant (l'ancien texte sort à gauche, le nouveau arrive). */
function SlidingLink({ label, href, className, onNavClick }: NavItemProps) {
  return (
    <a
      href={href}
      onClick={(e) => onNavClick(e, href)}
      className={`sliding-link group ${className ?? ""}`}
    >
      <span className="sliding-link-top">{label}</span>
      <span className="sliding-link-bottom" aria-hidden="true">
        {label}
      </span>
    </a>
  );
}

export default function CurtainMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const toggle = () => setOpen((o) => !o);

  const isHome = pathname === "/";
  const NAV = [
    { label: t("nav.about"), href: isHome ? "#about" : "/#about" },
    { label: t("nav.work"), href: isHome ? "#projects" : "/#projects" },
    { label: t("nav.services"), href: "/services" },
    { label: t("nav.contact"), href: isHome ? "#contact" : "/#contact" },
  ];
  const CURTAIN = [
    { label: t("curtain.about"), href: isHome ? "#about" : "/#about" },
    { label: t("curtain.work"), href: isHome ? "#projects" : "/#projects" },
    { label: t("curtain.services"), href: "/services" },
    { label: t("curtain.contact"), href: isHome ? "#contact" : "/#contact" },
  ];

  // ── Navigation pilotée (scroll Lenis + transition pages) ──
  const onNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    close();
    const [path, hash] = href.split("#");
    const targetHash = hash ? `#${hash}` : null;

    if (path.startsWith("/services") || path.startsWith("/projets")) {
      router.push(href.split("#")[0]);
      return;
    }
    if (!targetHash) {
      // lien "accueil" → haut de page
      if (lenis) lenis.scrollTo(0);
      return;
    }
    if (path === "" || path === pathname) {
      // même page → scroll Lenis vers l'ancre, sans laisser le "#" dans l'URL
      window.setTimeout(() => {
        if (lenis) lenis.scrollTo(targetHash, { offset: 0 });
        history.replaceState(null, "", window.location.pathname);
      }, 40);
      return;
    }
    // autre page avec ancre → naviguer (URL propre), puis scroller après rendu
    router.push(path);
    window.setTimeout(() => {
      if (lenis) lenis.scrollTo(targetHash, { offset: 0 });
      history.replaceState(null, "", path);
    }, 550);
  };

  // ── Verrouiller le scroll quand le menu est ouvert (via Lenis) ──
  useEffect(() => {
    if (open) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
    return () => {
      lenis?.start();
    };
  }, [open, lenis]);

  // ── Échap ferme le menu ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Ancre arrivée sur l'autre page (fragment) ──
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash;
      window.setTimeout(() => {
        if (lenis) lenis.scrollTo(hash, { offset: 0 });
        history.replaceState(null, "", window.location.pathname);
      }, 350);
    }
  }, [lenis]);

  // ── Scramble léger du lien SERVICES au survol (façon "texte vivant") ──
  const prefersReduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <>
      {/* ══════════ NAVBAR PILL ══════════ */}
      <nav
        aria-label={t("nav.mainNav")}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-between gap-4
          w-[min(960px,calc(100%-2rem))] h-16 px-4 md:px-6 rounded-full
          backdrop-blur-md border transition-all duration-500
          ${open
            ? "bg-transparent border-transparent backdrop-blur-none"
            : "bg-white/5 border-white/10 shadow-lg shadow-black/40"
          }`}
      >
        {/* Logo V électrique → accueil */}
        {isHome ? (
          <a
            href="#home"
            aria-label={t("nav.backTop")}
            onClick={(e) => {
              e.preventDefault();
              close();
              if (lenis) lenis.scrollTo(0);
            }}
            className="w-12 h-12 flex items-center justify-center shrink-0"
          >
            <Logo065Tooltip>
              <JuiceLogo className="juice-logo--sm" />
            </Logo065Tooltip>
          </a>
        ) : (
          <Link
            href="/"
            aria-label={t("nav.backHome")}
            className="w-12 h-12 flex items-center justify-center shrink-0"
          >
            <Logo065Tooltip>
              <JuiceLogo className="juice-logo--sm" />
            </Logo065Tooltip>
          </Link>
        )}

        {/* Liens centraux (slide) — masqués sur petit écran */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {NAV.map((item) => (
            <li key={item.label}>
              <SlidingLink
                label={item.label}
                href={item.href}
                onNavClick={onNavClick}
                className={`nav-slide text-xs font-mono tracking-[0.25em] ${
                  open ? "text-white/90" : "text-gray-300"
                }`}
              />
            </li>
          ))}
        </ul>

        {/* Sélecteur de langue FR/EN — toujours visible dans la pill */}
        <LanguageSwitcher />

        {/* Bouton grille ⇄ X */}
        <button
          type="button"
          onClick={toggle}
          aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
          aria-expanded={open}
          aria-controls="curtain"
          className="menu-toggle-btn w-10 h-10 rounded-full border flex items-center justify-center
            transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500
            focus-visible:outline-offset-2 shrink-0"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            className={`grid-icon transition-all duration-300 ${
              open ? "opacity-0 rotate-45" : "opacity-100"
            }`}
            aria-hidden="true"
          >
            <rect x="0" y="0" width="7" height="7" rx="1.5" fill="#ffffff" />
            <rect x="11" y="0" width="7" height="7" rx="1.5" fill="#ffffff" />
            <rect x="0" y="11" width="7" height="7" rx="1.5" fill="#ffffff" />
            <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#ffffff" />
          </svg>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            className={`close-icon absolute transition-all duration-300 ${
              open ? "opacity-100 rotate-0" : "opacity-0 -rotate-45"
            }`}
            aria-hidden="true"
          >
            <rect x="8" y="0" width="2" height="18" rx="1" fill="#DC2626" />
            <rect x="0" y="8" width="18" height="2" rx="1" fill="#DC2626" />
          </svg>
        </button>
      </nav>

      {/* ══════════ CURTAIN ══════════ */}
      <div
        id="curtain"
        className={`curtain ${open ? "curtain--open" : ""}`}
        aria-hidden={!open}
      >
        <TickerGlow running={open && !prefersReduced()} />

        {/* Coins (infos) */}
        <div className="curtain-corners px-6 md:px-14 pt-24 font-mono text-[11px] md:text-xs leading-relaxed tracking-[0.15em] text-gray-400">
          <div>
            {t("curtain.name")}
            <br />
            {t("curtain.role")}
            <br />
            {t("curtain.city")}
          </div>
          <div className="text-right">
            {t("curtain.available")}
            <br />
            {t("curtain.newProjects")}
            <br />
            CHAMEKHZAKARIA95@GMAIL.COM
          </div>
        </div>

        {/* Gros liens centre */}
        <div className="curtain-links">
          {CURTAIN.map((item) => (
            <SlidingLink
              key={item.label}
              label={item.label}
              href={item.href}
              onNavClick={onNavClick}
              className="curtain-link font-getai uppercase"
            />
          ))}
        </div>

        {/* Sous-menu Services — cocon sémantique (crawlabilité) */}
        <div className="curtain-services-submenu mx-auto max-w-3xl px-6 text-center">
          <p className="mb-3 font-mono text-[10px] tracking-[0.25em] text-zinc-500">SERVICES DÉTAILLÉS</p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.values(COCOON_PAGES).map((p) => (
              <Link
                key={p.slug}
                href={`/services/${p.slug}`}
                onClick={close}
                className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-medium tracking-wide text-zinc-300 transition-colors hover:border-red-500/40 hover:text-white"
              >
                {p.serviceType}
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="curtain-footer px-6 md:px-14 pb-8 md:pb-10 flex items-end justify-between font-mono text-[11px] text-gray-500">
          <span>{t("curtain.copyright")}</span>
          <div className="lang-toggle flex gap-2">
            <button
              type="button"
              aria-pressed={lang === "en"}
              className={`lang-btn${lang === "en" ? " active" : ""}`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              type="button"
              aria-pressed={lang === "fr"}
              className={`lang-btn${lang === "fr" ? " active" : ""}`}
              onClick={() => setLang("fr")}
            >
              FR
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/** Ticker en fond du curtain, réagit à la vitesse/direction du scroll page. */
function TickerGlow({ running }: { running: boolean }) {
  const trackRef = useTickerRef(running);
  return (
    <div className="pointer-events-none absolute top-0 left-0 right-0 overflow-hidden select-none">
      <div ref={trackRef} className="ticker-track whitespace-nowrap will-change-transform">
        <span className="ticker-text font-getai uppercase">
          PORTFOLIO — CREATOR — ENGINEER — CASABLANCA — PORTFOLIO — CREATOR — ENGINEER — CASABLANCA —
        </span>
      </div>
    </div>
  );
}

function useTickerRef(running: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) return;
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let x = 0;
    let velocity = 0.6;
    let lastScroll = window.scrollY;
    let raf = 0;

    const onScroll = () => {
      const current = window.scrollY;
      const delta = current - lastScroll;
      lastScroll = current;
      if (delta > 0) {
        velocity = Math.min(3.5, 0.6 + Math.abs(delta) * 0.15);
      } else if (delta < 0) {
        velocity = -Math.min(2, Math.abs(delta) * 0.12);
      }
      window.clearTimeout((window as unknown as { _tvReset?: number })._tvReset);
      (window as unknown as { _tvReset?: number })._tvReset =
        window.setTimeout(() => {
          velocity = 0.6;
        }, 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const move = () => {
      x -= velocity;
      el.style.transform = `translateX(${x}px)`;
      if (Math.abs(x) > el.scrollWidth / 3) x = 0;
      raf = requestAnimationFrame(move);
    };
    raf = requestAnimationFrame(move);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout((window as unknown as { _tvReset?: number })._tvReset);
      el.style.transform = "";
    };
  }, [running]);

  return ref;
}