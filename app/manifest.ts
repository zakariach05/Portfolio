import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zakaria Chamekh — Portfolio",
    short_name: "Zakaria Chamekh",
    description:
      "Portfolio de Zakaria Chamekh, développeur web full stack à Casablanca.",
    start_url: "/",
    display: "standalone",
    background_color: "#050203",
    theme_color: "#050203",
    lang: "fr",
    icons: [
      {
        src: "/NV-IMG/V.png",
        sizes: "384x384",
        type: "image/png",
      },
    ],
  };
}
