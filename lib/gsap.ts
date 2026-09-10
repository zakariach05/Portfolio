import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Enregistrement global des plugins GSAP.
 * Importé une seule fois par les composants client qui utilisent GSAP,
 * afin de garantir un singleton sans doublon de registration.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };