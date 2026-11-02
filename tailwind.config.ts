import type { Config } from "tailwindcss";

/**
 * The site is token-driven: every semantic colour resolves to the CSS
 * variables declared in styles/globals.css. Switching `data-theme` on <html>
 * therefore re-colours the whole UI without touching component code.
 */
const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-outfit)", "sans-serif"],
        outfit: ["var(--font-outfit)", "sans-serif"],
        rubik: ["Rubik Storm", "cursive"],
        bebas: ["var(--font-bebas)", "cursive"],
        getai: ["var(--font-getai)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
        architects: ["var(--font-architects)", "cursive"],
        nabla: ["'Nabla'", "var(--font-nabla)", "cursive"],
      },
      colors: {
        // Semantic theme tokens (see styles/globals.css).
        bg: "rgb(var(--bg-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        elevated: "rgb(var(--elevated-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        muted: "rgb(var(--muted-rgb) / <alpha-value>)",
        line: "rgb(var(--line-rgb) / <alpha-value>)",
        btn: {
          DEFAULT: "rgb(var(--btn-bg-rgb) / <alpha-value>)",
          fg: "rgb(var(--btn-fg-rgb) / <alpha-value>)",
          hover: "rgb(var(--btn-hover-rgb) / <alpha-value>)",
        },
        slate: {
          850: "#111111",
          900: "#000000",
        },
        accent: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
          dim: "rgb(var(--accent-dim-rgb) / <alpha-value>)",
          bright: "rgb(var(--accent-rgb) / <alpha-value>)",
        },
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
