"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/SectionTitle";
import { useLanguage } from "@/contexts/LanguageContext";

/** Icônes par position (les titres/descs/tags viennent de locales/*.json). */
const ICONS = [
  "fas fa-code",
  "fas fa-cube",
  "fas fa-shopping-cart",
  "fas fa-pen-nib",
  "fas fa-rocket",
  "fas fa-server",
];

export default function ServicesPage() {
  const { t, dict } = useLanguage();
  return (
    <main className="relative">
      {/* Services Hero */}
      <section
        id="services-page-hero"
        className="relative w-full min-h-[50vh] flex items-center justify-center pt-32 pb-16"
        style={{ zIndex: 20 }}
      >
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-[12vw] md:text-8xl font-[900] tracking-tighter text-white uppercase leading-none drop-shadow-2xl mix-blend-exclusion mb-6">
            {t("servicesPage.heroTitleWhite")}{" "}
            <span className="text-red-500">{t("servicesPage.heroTitleRed")}</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-400 max-w-2xl">
            {t("servicesPage.heroSub")}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section
        id="services-grid"
        className="py-16 md:py-24 relative overflow-clip"
        style={{ zIndex: 30 }}
      >
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {dict.servicesPage.items.map((s, i) => (
              <div
                key={s.title}
                className="p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 hover:border-red-500 transition-all duration-300 group shadow-2xl"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-500/30 transition-colors">
                  <i className={`${ICONS[i] ?? "fas fa-code"} text-3xl text-red-500`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{s.title}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">{s.desc}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {s.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-bold px-2 py-1 rounded bg-white/5 text-gray-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="racing-stripe w-full opacity-30 mt-10" />

      {/* Contact CTA */}
      <section
        className="py-24 relative overflow-clip text-center"
        style={{ zIndex: 30 }}
      >
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle
            white={t("servicesPage.ctaTitleWhite")}
            red={t("servicesPage.ctaTitleRed")}
            align="center"
            className="mb-8"
          />
          <Link
            href="/#contact"
            className="inline-block bg-red-600 border-2 border-transparent text-white px-10 py-4 font-bold rounded-full uppercase tracking-widest hover:bg-transparent hover:border-red-600 transition-all duration-300"
          >
            {t("servicesPage.ctaButton")}
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}