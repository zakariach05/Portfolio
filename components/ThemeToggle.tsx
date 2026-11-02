"use client";

/**
 * ThemeToggle — round light/dark switch placed next to the FR/EN switcher.
 *
 * A single light-bulb icon communicates the action: unlit outline in dark
 * mode (click = turn the lights on), lit yellow bulb in light mode (click =
 * switch back to dark). Both bulbs are rendered and cross-faded by CSS from
 * <html data-theme>, so the correct one shows before hydration.
 * The accessible label follows the current theme and the FR/EN locale.
 */
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isLight = theme === "light";

  const label = isLight
    ? t("common.switchToDark")
    : t("common.switchToLight");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isLight}
      title={label}
      className={`theme-toggle ${className}`}
    >
      <span className="theme-toggle__icons" aria-hidden="true">
        {/* Bulb off — dark mode. */}
        <svg
          className="theme-toggle__icon theme-toggle__icon--off"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18h6M10 21h4" />
          <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
        </svg>
        {/* Bulb on — light mode. */}
        <svg
          className="theme-toggle__icon theme-toggle__icon--on"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18h6M10 21h4" />
          <path
            className="theme-toggle__bulb-glass"
            d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"
          />
          <path d="M12 .2v1M3.6 3.8l.7.7M20.4 3.8l-.7.7M1 10h1M22 10h1" />
        </svg>
      </span>
    </button>
  );
}
