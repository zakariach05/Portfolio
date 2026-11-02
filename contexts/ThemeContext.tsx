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

export type Theme = "light" | "dark";

/** Must match the key used by the no-flash inline script in app/layout.tsx. */
const STORAGE_KEY = "theme";

const THEME_COLOR: Record<Theme, string> = {
  light: "#faf6f5",
  dark: "#050203",
};

type ThemeValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

function systemTheme(): Theme {
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  } catch {
    return "dark";
  }
}

function storedTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function currentTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return storedTheme() ?? systemTheme();
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  // Keep the legacy `.dark` selector working for the existing stylesheet.
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;

  let meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]'
  );
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = THEME_COLOR[theme];
}

/**
 * Site theme (light/dark) — persisted in localStorage under `theme`.
 *
 * The initial value is written to <html data-theme> by an inline script in the
 * document head, before first paint. This provider adopts that value on mount
 * (so hydration stays deterministic) and then keeps the DOM, `color-scheme`,
 * `theme-color` meta and the legacy `.dark` class in sync.
 *
 * Until the visitor toggles manually, the theme follows the OS preference.
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  // Deliberately "dark" so server and first client render agree. The real
  // value (already applied by the inline script) is adopted in the effect.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const initial = currentTheme();
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  // Follow OS changes only while no manual choice has been stored.
  useEffect(() => {
    let mq: MediaQueryList;
    try {
      mq = window.matchMedia("(prefers-color-scheme: light)");
    } catch {
      return;
    }
    const onChange = (event: MediaQueryListEvent) => {
      if (storedTheme()) return;
      const next: Theme = event.matches ? "light" : "dark";
      setThemeState(next);
      applyTheme(next);
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — the theme still applies for this session */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>.");
  }
  return ctx;
}
