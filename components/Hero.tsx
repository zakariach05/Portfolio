import Hero3DText from "@/components/Hero3DText";

/**
 * Hero — coque de section uniquement.
 * Tout le rendu (canvas 3D, texte, boutons, accessibilité) vit dans Hero3DText.
 */
export default function Hero() {
  return (
    <section id="home" style={{ position: "relative", zIndex: 1 }}>
      <Hero3DText />
    </section>
  );
}
