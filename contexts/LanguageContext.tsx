"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import fr from "@/locales/fr.json";
import enJson from "@/locales/en.json";
import { ScrollTrigger } from "@/lib/gsap";

export type Lang = "fr" | "en";
/** Shape of the dictionaries (FR is the reference; EN must mirror it). */
export type Messages = typeof fr;

const en = enJson as unknown as Messages;

const DICTS: Record<Lang, Messages> = { fr, en };

const STORAGE_KEY = "vo-lang";

function lookup(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc !== null && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj
    );
}

type LanguageValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translated string for a dot-path (e.g. "hero.scrollLabel"). Falls back to FR, then to the path itself. */
  t: (path: string) => string;
  /** Whole current dictionary (typed from FR). */
  dict: Messages;
};

const LanguageContext = createContext<LanguageValue | null>(null);

/**
 * Site language (FR/EN) — persisted in localStorage ("vo-lang", default "fr").
 * - syncs <html lang>
 * - refreshes ScrollTrigger positions after a switch (translated text
 *   changes section heights, pins depend on them)
 */
export default function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "fr" || saved === "en") setLangState(saved);
    } catch {
      /* storage unavailable — keep default */
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — language still applies for the session */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    const timer = window.setTimeout(() => {
      try {
        ScrollTrigger?.refresh();
      } catch {
        /* gsap not ready — harmless */
      }
    }, 60);
    return () => window.clearTimeout(timer);
  }, [lang]);

  const t = useCallback(
    (path: string): string => {
      const value = lookup(DICTS[lang], path) ?? lookup(fr, path);
      return typeof value === "string" ? value : path;
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, dict: DICTS[lang] }),
    [lang, setLang, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>.");
  }
  return ctx;
}
