/**
 * SiteBackground — ancien canvas #hero-3d-canvas.
 *
 * En legacy, ce canvas WebGL (hero-3d.js) affichait le bruit rouge animé,
 * mais son import CDN échouait → le canvas restait transparent et le fond
 * du <body> (bg-black) s'affichait. On reproduit donc ce rendu "inerte" :
 * un écran fixe noir, z-index 0, sans pointer-events.
 */
export default function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        background: "#000",
      }}
    />
  );
}