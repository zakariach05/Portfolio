import type { Config } from "tailwindcss";

/** Strict-slate (custom dark palette) is the site's permanent theme. */
const config: Config = {
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
      },
      colors: {
        slate: {
          850: "#111111",
          900: "#000000",
        },
        accent: {
          DEFAULT: "#e50000",
          dim: "#b30000",
          bright: "#dc2626",
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
