"use client";

/**
 * LanguageSwitcher — compact FR/EN toggle used in the navbar pill.
 * (The curtain footer keeps its own EN/FR buttons, wired to the same context.)
 */
import { useLanguage, type Lang } from "@/contexts/LanguageContext";

const LANGS: Lang[] = ["fr", "en"];

export default function LanguageSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      className={`lang-switcher ${className}`}
      role="group"
      aria-label="Language / Langue"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          aria-label={l === "fr" ? t("common.switchToFr") : t("common.switchToEn")}
          className={`lang-sw-btn${lang === l ? " active" : ""}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
