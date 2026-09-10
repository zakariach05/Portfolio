import type { gsap } from "gsap";

declare global {
  interface Window {
    zakariaAnimLoop?: ReturnType<typeof gsap.timeline>;
  }
}

export {};