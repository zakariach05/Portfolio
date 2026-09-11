import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Exports GSAP sans auto-register (évite coût synchrone au chargement initial).
 * Chaque composant enregistre via requestIdleCallback avant usage.
 * LenisProvider s'occupe du register principal en différé.
 */

export { gsap, ScrollTrigger };