/**
 * lib/seo-cocoon.ts — Configuration du cocon sémantique
 *
 * Page mère : / (développeur web full stack Casablanca)
 * 6 pages filles : chaque entrée = 1 requête longue traine
 *
 * Utilisé par :
 * - app/services/[slug]/page.tsx (generateMetadata, generateStaticParams, contenu)
 * - components/seo/RelatedServices.tsx (maillage interne automatique)
 * - app/sitemap.ts (génération sitemap)
 * - components/seo/CocoonServicesBlock.tsx (bloc sur la page mère)
 */

export type CocoonPage = {
  slug: string;
  /** Requête cible exacte */
  query: string;
  /** H1 de la page */
  h1: string;
  /** <title> (55-60 chars) */
  title: string;
  /** meta description (150-160 chars) */
  description: string;
  /** Mots-clés secondaires pour le contenu */
  keywords: string[];
  /** Priorité sitemap */
  priority: number;
  /** Changefreq sitemap */
  changeFrequency: "weekly" | "monthly";
  /** Service schema — type */
  serviceType: string;
};

export const COCOON_PAGES: Record<string, CocoonPage> = {
  "developpement-web-full-stack-casablanca": {
    slug: "developpement-web-full-stack-casablanca",
    query: "développeur web full stack Casablanca",
    h1: "Développeur Web Full Stack à Casablanca — Applications Web Complètes & Sécurisées",
    title: "Développeur Web Full Stack Casablanca | Zakaria Chamekh",
    description:
      "Développeur web full stack à Casablanca : React, Next.js, Laravel & Node.js. Applications web performantes, sécurisées (OWASP) et sur-mesure. Devis gratuit.",
    keywords: [
      "développeur web full stack Casablanca",
      "développeur full stack Maroc",
      "création application web Casablanca",
      "développeur React Laravel Casablanca",
    ],
    priority: 0.9,
    changeFrequency: "monthly",
    serviceType: "Développement Web Full Stack",
  },
  "developpeur-react-nextjs-casablanca": {
    slug: "developpeur-react-nextjs-casablanca",
    query: "développeur React Next.js Casablanca",
    h1: "Développeur React & Next.js à Casablanca — Interfaces Modernes & Ultra-Performantes",
    title: "Développeur React Next.js Casablanca | Zakaria Chamekh",
    description:
      "Expert React & Next.js à Casablanca : interfaces modernes, SSR/SSG, performance Lighthouse 95+. Création d'applications React sur-mesure au Maroc.",
    keywords: [
      "développeur React Casablanca",
      "développeur Next.js Casablanca",
      "expert React Maroc",
      "création application React",
    ],
    priority: 0.8,
    changeFrequency: "monthly",
    serviceType: "Développement React & Next.js",
  },
  "developpeur-laravel-maroc": {
    slug: "developpeur-laravel-maroc",
    query: "développeur Laravel Maroc",
    h1: "Développeur Laravel au Maroc — Backends Robustes & API Sécurisées",
    title: "Développeur Laravel Maroc | API & Backend Sécurisé — Zakaria Chamekh",
    description:
      "Développeur Laravel au Maroc : API REST, backends robustes, MySQL/PostgreSQL, authentification JWT. Backend scalable et sécurisé pour votre projet.",
    keywords: [
      "développeur Laravel Maroc",
      "expert Laravel Casablanca",
      "création API Laravel",
      "backend Laravel Maroc",
    ],
    priority: 0.8,
    changeFrequency: "monthly",
    serviceType: "Développement Backend Laravel",
  },
  "securite-applications-web-owasp": {
    slug: "securite-applications-web-owasp",
    query: "sécurité applications web OWASP",
    h1: "Sécurité des Applications Web OWASP — Audit & Hardening à Casablanca",
    title: "Sécurité Applications Web OWASP | Zakaria Chamekh — Casablanca",
    description:
      "Sécurité des applications web selon OWASP Top 10 : audit, hardening, protection XSS/CSRF/SQLi. Expert sécurité web à Casablanca, Maroc.",
    keywords: [
      "sécurité applications web OWASP",
      "OWASP Top 10 Maroc",
      "hardening application web",
      "sécurité web Casablanca",
    ],
    priority: 0.8,
    changeFrequency: "monthly",
    serviceType: "Sécurité des Applications Web",
  },
  "audit-securite-web-casablanca": {
    slug: "audit-securite-web-casablanca",
    query: "audit sécurité web Casablanca",
    h1: "Audit de Sécurité Web à Casablanca — Diagnostic Complet OWASP",
    title: "Audit Sécurité Web Casablanca | Diagnostic OWASP — Zakaria Chamekh",
    description:
      "Audit de sécurité web à Casablanca : diagnostic OWASP, tests d'intrusion, rapport détaillé et plan de correction. Sécurisez votre site web au Maroc.",
    keywords: [
      "audit sécurité web Casablanca",
      "audit OWASP Maroc",
      "test intrusion web Casablanca",
      "diagnostic sécurité site web",
    ],
    priority: 0.8,
    changeFrequency: "monthly",
    serviceType: "Audit de Sécurité Web",
  },
  "creation-site-web-professionnel-maroc": {
    slug: "creation-site-web-professionnel-maroc",
    query: "création site web professionnel Maroc",
    h1: "Création de Site Web Professionnel au Maroc — Vitrine, E-commerce & Sur-Mesure",
    title: "Création Site Web Professionnel Maroc | Zakaria Chamekh",
    description:
      "Création de site web professionnel au Maroc : vitrine, e-commerce WordPress, React. Design premium, SEO, performance et sécurité inclus. Devis gratuit.",
    keywords: [
      "création site web professionnel Maroc",
      "création site vitrine Maroc",
      "création site e-commerce Maroc",
      "agence web Casablanca",
    ],
    priority: 0.8,
    changeFrequency: "monthly",
    serviceType: "Création de Site Web Professionnel",
  },
};

/** Liste ordonnée des slugs (pour sitemap, static params, bloc mère) */
export const COCOON_SLUGS = Object.keys(COCOON_PAGES);

/**
 * Table de maillage interne contextuel.
 * Chaque page fille lie vers 2-3 autres filles complémentaires.
 * La page mère est toujours liée en plus (hors table).
 */
export const COCOON_RELATIONS: Record<string, string[]> = {
  "developpement-web-full-stack-casablanca": [
    "developpeur-react-nextjs-casablanca",
    "developpeur-laravel-maroc",
    "securite-applications-web-owasp",
  ],
  "developpeur-react-nextjs-casablanca": [
    "developpement-web-full-stack-casablanca",
    "securite-applications-web-owasp",
    "creation-site-web-professionnel-maroc",
  ],
  "developpeur-laravel-maroc": [
    "developpement-web-full-stack-casablanca",
    "securite-applications-web-owasp",
    "audit-securite-web-casablanca",
  ],
  "securite-applications-web-owasp": [
    "developpeur-laravel-maroc",
    "audit-securite-web-casablanca",
    "developpement-web-full-stack-casablanca",
  ],
  "audit-securite-web-casablanca": [
    "securite-applications-web-owasp",
    "developpeur-laravel-maroc",
    "developpement-web-full-stack-casablanca",
  ],
  "creation-site-web-professionnel-maroc": [
    "developpement-web-full-stack-casablanca",
    "developpeur-react-nextjs-casablanca",
    "securite-applications-web-owasp",
  ],
};

/**
 * Ancres variées par lien (évite la sur-optimisation).
 * Clé = `${from}->${to}`
 */
export const COCOON_ANCHORS: Record<string, string[]> = {
  "developpement-web-full-stack-casablanca->developpeur-react-nextjs-casablanca": [
    "mes services de développement React et Next.js à Casablanca",
    "expertise React & Next.js sur-mesure",
  ],
  "developpement-web-full-stack-casablanca->developpeur-laravel-maroc": [
    "mes services de développement Laravel au Maroc",
    "backend Laravel robuste et sécurisé",
  ],
  "developpement-web-full-stack-casablanca->securite-applications-web-owasp": [
    "sécurisation OWASP de vos applications",
    "expertise en sécurité des applications web",
  ],
  "developpeur-react-nextjs-casablanca->developpement-web-full-stack-casablanca": [
    "développement web full stack à Casablanca",
    "approche full stack complète",
  ],
  "developpeur-react-nextjs-casablanca->securite-applications-web-owasp": [
    "sécuriser vos applications React selon OWASP",
    "audit de sécurité OWASP",
  ],
  "developpeur-laravel-maroc->securite-applications-web-owasp": [
    "sécurisation des backends Laravel selon OWASP",
    "sécurité applicative OWASP",
  ],
};

export function getCocoonPage(slug: string): CocoonPage | undefined {
  return COCOON_PAGES[slug];
}

export function getRelatedPages(slug: string): CocoonPage[] {
  const related = COCOON_RELATIONS[slug] ?? [];
  return related.map((s) => COCOON_PAGES[s]).filter(Boolean);
}

export function getAllCocoonPages(): CocoonPage[] {
  return COCOON_SLUGS.map((s) => COCOON_PAGES[s]);
}
