export interface TagGroup {
  label?: string;
  tags: string[];
}

export interface Project {
  /** Stable id used to look up the translated description in locales/*.json. */
  id: string;
  title: string;
  href: string;
  imageSrc: string;
  /** Dimensions réelles du fichier (pour next/image, anti-CLS). */
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  description: string;
  /** Année affichée dans le sticker YEAR de la section works (stacking). */
  year?: number;
  /** Niche / catégorie affichée dans le sticker NICHE (ex: "E-Commerce"). */
  niche?: string;
  /** Média de la card : "image" (défaut) ou "video" (thumbnail mp4 + play). */
  mediaType?: "image" | "video";
  /** Chemin mp4 utilisé en thumbnail ET dans la lightbox si mediaType === "video". */
  videoSrc?: string;
  /** Groupes de tags (frontend/backend/infra…). Si vide, tags simples. */
  groups?: TagGroup[];
  tags?: string[];
}

/**
 * Données des projets du portfolio — 1:1 avec la section #projects de
 * l'index.html original (ordre et contenu conservés).
 */
export const PROJECTS: Project[] = [
  {
    id: "hotel-cinco",
    title: "Hotel Cinco",
    href: "https://github.com/zakariach05/Hotel-Cinco",
    imageSrc: "/img/hotel-photo.png",
    imageWidth: 1915,
    imageHeight: 919,
    imageAlt: "Hotel Cinco",
    description: "Luxury Hotel Cinco Management System",
    year: 2026,
    niche: "Hospitality",
    tags: ["Java 17", "Spring Boot 3", "React 19", "TypeScript", "PostgreSQL 16", "Tailwind CSS 4", "Docker"],
  },
  {
    id: "info-aymane",
    title: "InfoAymane — Agence Marketing Digital",
    href: "https://agence-aymane-info.vercel.app/",
    imageSrc: "/img/agence-marketing-digital.png",
    imageWidth: 1917,
    imageHeight: 1079,
    imageAlt: "InfoAymane",
    description:
      "Votre partenaire digital de confiance. Agence spécialisée dans le marketing digital, la création web et la communication visuelle à Casablanca.",
    year: 2025,
    niche: "Digital Marketing",
    tags: ["Next.js", "TypeScript", "Vercel"],
  },
  {
    id: "immo-estrie",
    title: "Gestion immobilière de l'Estrie",
    href: "https://immoestrie.vercel.app/",
    imageSrc: "/img/gestion-immobilier-en estrie.png",
    imageWidth: 1919,
    imageHeight: 983,
    imageAlt: "Gestion immobilière de l'Estrie",
    description:
      "Site web professionnel pour une entreprise de gestion immobilière au Québec, avec présentation des services, design responsive et formulaire de contact intégré.",
    year: 2026,
    niche: "Real Estate",
    tags: ["Next.js", "React", "Tailwind CSS", "Sanity", "Web3Forms", "Framer Motion", "Vercel"],
  },
  {
    id: "casa-papel",
    title: "La Casa De Papel Game",
    href: "https://la-casa-depapel.netlify.app/",
    imageSrc: "/img/la-casa.png",
    imageWidth: 1365,
    imageHeight: 766,
    imageAlt: "La Casa De Papel",
    description: "Jeu interactif immersif basé sur la célèbre série. Testez vos connaissances.",
    year: 2025,
    niche: "Entertainment",
    tags: ["JavaScript", "CSS3"],
  },
  {
    id: "electro-05",
    title: "05-Electro",
    href: "https://github.com/zakariach05/05-Electro-profesionnels",
    imageSrc: "/img/05-Electro.png",
    imageWidth: 1366,
    imageHeight: 768,
    imageAlt: "05-Electro",
    description:
      "Plateforme e-commerce fullstack moderne avec gestion des produits, authentification, panier, commandes, paiement, comparaison et administration.",
    year: 2025,
    niche: "E-Commerce",
    groups: [
      { label: "Frontend", tags: ["React 19", "Tailwind CSS 3", "GSAP 3", "Three.js", "i18next"] },
      { label: "Backend", tags: ["Laravel 12", "PHP 8.2", "MySQL 8", "Redis", "Sanctum"] },
      { label: "Infrastructure", tags: ["Docker", "Nginx", "Git", "GitHub"] },
    ],
  },
  {
    id: "spark-vision",
    title: "Spark Vision",
    href: "https://sparkvision.ma",
    imageSrc: "/img/sparkvision.PNG",
    imageWidth: 1351,
    imageHeight: 650,
    imageAlt: "Spark Vision",
    description: "Solutions d’éclairage, d’électricité et d’innovation pour l’industrie.",
    year: 2025,
    niche: "AI-Powered Products",
    tags: ["WordPress", "Elementor"],
  },
  {
    id: "portfolio",
    title: "Mon Portfolio",
    href: "https://github.com/zakariach05/portfolio",
    imageSrc: "/img/portfolio.png",
    imageWidth: 1919,
    imageHeight: 1079,
    imageAlt: "Project Portfolio",
    description: "Design immersif avec Three.js et animations avancées GSAP.",
    year: 2026,
    niche: "Personal Branding",
    tags: ["Three.js", "GSAP", "Tailwind"],
  },
  {
    id: "meteo-05",
    title: "05 Météo App",
    href: "https://05-meteo.vercel.app/",
    imageSrc: "/img/meteo.png",
    imageWidth: 1365,
    imageHeight: 650,
    imageAlt: "Météo",
    description: "Application météo avec appels API instantanés et design soigné.",
    year: 2024,
    niche: "Weather App",
    tags: ["JavaScript-API", "CSS3"],
  },
  {
    id: "bibliotique",
    title: "Bibliotique",
    href: "https://bibliotique.vercel.app/",
    imageSrc: "/img/Bibliotique.png",
    imageWidth: 1346,
    imageHeight: 650,
    imageAlt: "Bibliotique",
    description: "Plateforme de gestion de bibliothèque moderne et intuitive.",
    year: 2024,
    niche: "Library",
    tags: ["React", "Tailwind"],
  },
];

/**
 * Sélection des projets pour la section "Works" (effet sticky-stacking).
 * Ordre d'empilement : le premier est la carte du bas, le dernier arrive
 * par-dessus en haut de la pile. 6 projets (Home) — "Autres projets" supprimé.
 */
export const WORKS: Project[] = [
  PROJECTS.find((p) => p.id === "hotel-cinco")!,       // 2026 · Hospitality
  PROJECTS.find((p) => p.id === "immo-estrie")!,       // 2026 · Real Estate
  PROJECTS.find((p) => p.id === "electro-05")!,        // 2025 · E-Commerce
  PROJECTS.find((p) => p.id === "portfolio")!,         // 2026 · Personal Branding
  PROJECTS.find((p) => p.id === "casa-papel")!,        // 2025 · Entertainment
  PROJECTS.find((p) => p.id === "spark-vision")!,      // 2025 · AI-Powered Products
];