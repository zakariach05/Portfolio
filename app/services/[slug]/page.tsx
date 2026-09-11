import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COCOON_PAGES, COCOON_SLUGS } from "@/lib/seo-cocoon";
import InternalLink from "@/components/seo/InternalLink";
import RelatedServices from "@/components/seo/RelatedServices";
import ServiceSchema from "@/components/seo/ServiceSchema";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return COCOON_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const page = COCOON_PAGES[params.slug];
  if (!page) return {};
  const url = `https://zakariach05.vercel.app/services/${page.slug}`;
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      type: "article",
      locale: "fr_FR",
      siteName: "Zakaria Chamekh - Portfolio",
      images: [{ url: "/NV-IMG/og-image.png", width: 1200, height: 630, alt: page.h1 }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: ["/NV-IMG/og-image.png"],
    },
    robots: { index: true, follow: true },
  };
}

export default function ServicePage({ params }: Props) {
  const page = COCOON_PAGES[params.slug];
  if (!page) notFound();

  return (
    <main className="relative">
      <ServiceSchema slug={page.slug} />

      {/* Hero */}
      <section className="relative flex min-h-[52vh] items-center justify-center px-6 pb-16 pt-32">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-3 font-mono text-xs tracking-[0.3em] text-red-500">CASABLANCA — MAROC</p>
          <h1 className="text-3xl font-black leading-tight tracking-tighter text-white md:text-5xl">{page.h1}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">{page.description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/#contact"
              className="rounded-full bg-red-600 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-700"
            >
              Discuter de votre projet
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/15 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-white/30"
            >
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="container mx-auto max-w-4xl px-6">
        <ol className="flex flex-wrap gap-2 text-xs text-zinc-500">
          <li>
            <Link href="/" className="hover:text-white">
              Accueil
            </Link>
            <span className="mx-2">/</span>
          </li>
          <li>
            <Link href="/services" className="hover:text-white">
              Services
            </Link>
            <span className="mx-2">/</span>
          </li>
          <li aria-current="page" className="text-zinc-300">
            {page.serviceType}
          </li>
        </ol>
      </nav>

      {/* Contenu principal */}
      <article className="container mx-auto max-w-4xl px-6 py-12">
        <div className="prose prose-invert max-w-none prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-2xl prose-h2:font-bold prose-h2:text-white prose-h3:text-lg prose-h3:font-semibold prose-h3:text-zinc-100 prose-p:leading-relaxed prose-p:text-zinc-300 prose-a:text-red-400">
          <Content slug={page.slug} />
        </div>

        <RelatedServices currentSlug={page.slug} />

        {/* CTA final */}
        <div className="mt-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-8 text-center md:p-10">
          <h2 className="text-2xl font-black tracking-tight text-white">Prêt à démarrer ?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-red-100">
            Basé à Casablanca, j’accompagne startups, PME et indépendants au Maroc et à l’international. Réponse sous 24h, devis gratuit et sans engagement.
          </p>
          <Link
            href="/#contact"
            className="mt-6 inline-flex rounded-full bg-white px-8 py-3 text-xs font-bold uppercase tracking-widest text-red-600 transition-colors hover:bg-zinc-100"
          >
            Me contacter
          </Link>
          <p className="mt-3 text-xs text-red-200">
            Ou découvrez{" "}
            <Link href="/" className="underline decoration-white/40 underline-offset-4 hover:text-white">
              mon approche full stack à Casablanca
            </Link>
            .
          </p>
        </div>
      </article>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Contenu 600-900 mots par page — H2/H3, maillage contextuel, exemples portfolio
// ---------------------------------------------------------------------------

function Content({ slug }: { slug: string }) {
  switch (slug) {
    case "developpement-web-full-stack-casablanca":
      return <FullStackContent />;
    case "developpeur-react-nextjs-casablanca":
      return <ReactContent />;
    case "developpeur-laravel-maroc":
      return <LaravelContent />;
    case "securite-applications-web-owasp":
      return <SecuriteContent />;
    case "audit-securite-web-casablanca":
      return <AuditContent />;
    case "creation-site-web-professionnel-maroc":
      return <CreationContent />;
    default:
      return null;
  }
}

/* ===================================================================
   PAGE 1 — FULL STACK (exemple complet 800+ mots)
   =================================================================== */
function FullStackContent() {
  return (
    <>
      <p className="lead text-lg leading-relaxed text-zinc-200">
        Vous cherchez un <strong>développeur web full stack à Casablanca</strong> capable de porter votre projet de l’idée au
        déploiement, sans jongler entre trois prestataires ? Je conçois des applications web complètes — frontend moderne,
        backend robuste et sécurité intégrée — pour des entreprises marocaines qui veulent aller vite sans sacrifier la qualité.
      </p>

      <h2>Qu’est-ce qu’un développeur full stack apporte à votre projet ?</h2>
      <p>
        Un développeur full stack maîtrise l’ensemble de la chaîne : interface utilisateur, logique métier, base de données,
        API, authentification, hébergement et sécurité. Contrairement à une équipe fragmentée, un seul interlocuteur garantit
        la cohérence technique, réduit les coûts de coordination et accélère les livraisons. À Casablanca, où beaucoup de
        projets démarrent en mode lean, cette polyvalence est décisive.
      </p>
      <p>
        Concrètement, je prends en charge le <strong>frontend</strong> avec <InternalLink href="/services/developpeur-react-nextjs-casablanca">mes services de développement React et Next.js à Casablanca</InternalLink>{" "}
        (SSR/SSG, performance Lighthouse 95+, accessibilité), le <strong>backend</strong> avec{" "}
        <InternalLink href="/services/developpeur-laravel-maroc">mes services de développement Laravel au Maroc</InternalLink> (API REST, PostgreSQL/MySQL, JWT, rôles) et la{" "}
        <InternalLink href="/services/securite-applications-web-owasp">sécurisation OWASP de vos applications</InternalLink> dès le premier sprint.
        Résultat : une application cohérente, maintenable et prête à scaler.
      </p>

      <h2>Ma stack full stack — choisie pour la performance et la durabilité</h2>
      <h3>Frontend : React, Next.js, TypeScript, Tailwind</h3>
      <p>
        J’utilise Next.js App Router pour le rendu hybride (SSR pour le SEO, SSG pour la vitesse, RSC pour réduire le JS
        client). Chaque page est optimisée : images WebP avec <code>next/image</code>, fonts <code>display:swap</code>,
        code-splitting automatique. Exemple : le CRM hôtelier <em>Hotel Cinco</em> (Spring Boot + React 19) et la plateforme
        <em>Info Aymane</em> (Next.js) atteignent un LCP &lt; 1s sur mobile.
      </p>
      <h3>Backend : Laravel, Node.js, Spring Boot</h3>
      <p>
        Laravel pour les API métier rapides à itérer, Node.js pour le temps réel, Spring Boot pour les domaines hôteliers
        complexes. Tous les backends exposent des API documentées, versionnées, avec tests Postman/Jest et migrations
        versionnées. Le projet <em>Electro 05</em> (e-commerce) tourne sur un backend Laravel + MySQL avec gestion de stock
        temps réel et paiements sécurisés.
      </p>
      <h3>Base de données & infra</h3>
      <p>
        PostgreSQL pour les données critiques, MySQL pour les CMS, Redis pour le cache. Déploiement sur Vercel (frontend) et
        VPS/Docker (backend), CI/CD, sauvegardes quotidiennes, monitoring. Chaque livraison passe par un build optimisé
        (ex : ce portfolio : 179 kB First Load).
      </p>

      <h2>Exemples concrets de mon portfolio</h2>
      <p>
        Mon approche full stack se voit dans mes réalisations : <em>Hotel Cinco</em> — gestion hôtelière complète avec
        calendrier, facturation et rôles ; <em>Immo Estrie</em> — plateforme immobilière avec cartes et filtres avancés ;
        <em>Portfolio personnel</em> — Next.js 14, animations GSAP, score desktop 94. Chaque projet est visible depuis la{" "}
        <Link href="/projets" className="text-red-400 underline decoration-red-500/30 underline-offset-4 hover:text-red-300">
          page projets — mes réalisations full stack
        </Link>{" "}
        et illustre un périmètre différent (hospitality, real estate, e-commerce).
      </p>

      <h2>Pourquoi me confier votre développement full stack à Casablanca ?</h2>
      <ul>
        <li>
          <strong>Un seul interlocuteur, zéro friction</strong> : je parle aussi bien design (Figma) que SQL et DevOps.
        </li>
        <li>
          <strong>Sécurité by design</strong> : chaque feature est revue OWASP Top 10 (XSS, CSRF, SQLi, IDOR) — voir{" "}
          <InternalLink href="/services/audit-securite-web-casablanca">mon audit de sécurité web à Casablanca</InternalLink>.
        </li>
        <li>
          <strong>Présence locale</strong> : basé à Casablanca, disponible pour ateliers en présentiel, mais stack 100% remote-friendly.
        </li>
        <li>
          <strong>Transparence</strong> : devis détaillé, repo Git partagé, démos hebdomadaires, documentation.
        </li>
      </ul>

      <h2>Comment se déroule une mission full stack ?</h2>
      <p>
        1) <strong>Cadrage</strong> (1-2 jours) : atelier besoins, maquettes, choix stack. 2) <strong>MVP</strong> (2-4 semaines) :
        frontend + API + auth. 3) <strong>Itérations</strong> : features métier, tests, hardening OWASP. 4){" "}
        <strong>Déploiement</strong> : Vercel/VPS, domaine, SSL, analytics (Clarity). 5) <strong>Maintenance</strong> : correctifs, évolutions, sauvegardes. Vous repartez avec un code propre, documenté et déployé — et un lien direct vers{" "}
        <InternalLink href="/">mon expertise de développeur web full stack à Casablanca</InternalLink> pour vos prochains besoins.
      </p>
    </>
  );
}

function ReactContent() {
  return (
    <>
      <p className="lead text-lg text-zinc-200">
        Besoin d’un <strong>développeur React & Next.js à Casablanca</strong> pour une interface qui ne rame jamais ? Je
        transforme vos maquettes Figma en applications React ultra-rapides, SEO-friendly et accessibles.
      </p>
      <h2>Pourquoi React + Next.js ?</h2>
      <p>
        React pour la composabilité, Next.js pour le rendu hybride, le routing App Router et l’optimisation d’images. C’est
        la stack qui permet d’atteindre 95+ Lighthouse tout en gardant un DX optimal. Mon portfolio lui-même tourne sur
        Next.js 14 avec un First Load de 179 kB.
      </p>
      <h2>Ce que je livre</h2>
      <h3>Performance & SEO technique</h3>
      <p>
        SSR/SSG, <code>next/image</code> WebP, fonts <code>display:swap</code>, code-splitting, métadonnées dynamiques. Le
        projet <em>Info Aymane</em> (Next.js) illustre cette approche. Pour une vision d’ensemble, voyez mon{" "}
        <InternalLink href="/services/developpement-web-full-stack-casablanca">service de développement web full stack à Casablanca</InternalLink>.
      </p>
      <h3>Animations utiles, pas gadget</h3>
      <p>
        GSAP + Lenis pour des micro-interactions fluides, désactivées sur mobile pour préserver la batterie. L’accessibilité
        reste prioritaire (<code>prefers-reduced-motion</code> respecté).
      </p>
      <h2>Portfolio React</h2>
      <p>
        Outre <em>Info Aymane</em>, le projet <em>Meteo 05</em> (React) et ce portfolio démontrent ma maîtrise du
        composant, du state et du rendu serveur. Chaque composant est pensé pour être réutilisable et testable. La{" "}
        <InternalLink href="/services/securite-applications-web-owasp">sécurité OWASP de vos apps React</InternalLink> est intégrée dès le
        départ (sanitization, CSP).
      </p>
      <h2>Processus</h2>
      <p>
        Maquettes → design system Tailwind → composants → intégration API (souvent{" "}
        <InternalLink href="/services/developpeur-laravel-maroc">backend Laravel au Maroc</InternalLink>) → tests → déploiement Vercel. Vous suivez
        chaque PR sur GitHub. Et si vous démarrez de zéro, ma{" "}
        <InternalLink href="/services/creation-site-web-professionnel-maroc">offre de création de site web professionnel au Maroc</InternalLink>{" "}
        couvre le parcours complet.
      </p>
    </>
  );
}

function LaravelContent() {
  return (
    <>
      <p className="lead text-lg text-zinc-200">
        Votre frontend est prêt mais le backend freine ? En tant que <strong>développeur Laravel au Maroc</strong>, je
        construis des API et backends qui tiennent la charge, restent lisibles et se sécurisent facilement.
      </p>
      <h2>Laravel : pourquoi c’est le bon choix backend</h2>
      <p>
        Eloquent, migrations, queues, Horizon, Sanctum/JWT, Policies — Laravel accélère sans enfermer. Je l’associe à
        MySQL/PostgreSQL et Redis. Le e-commerce <em>Electro 05</em> et la gestion hôtelière <em>Hotel Cinco</em>{" "}
        (Spring Boot côté métier complexe, Laravel côté API rapide) en sont la preuve.
      </p>
      <h2>Ce que je construis</h2>
      <h3>API REST propres & documentées</h3>
      <p>
        Versionnage, pagination, filtres, validation FormRequest, tests Postman. Authentification JWT avec refresh, rôles et
        permissions. Chaque endpoint est loggé et rate-limité. Besoin d’une vue d’ensemble ? Mon{" "}
        <InternalLink href="/services/developpement-web-full-stack-casablanca">service full stack à Casablanca</InternalLink> détaille l’intégration
        frontend-backend.
      </p>
      <h3>Performance & sécurité</h3>
      <p>
        Requêtes N+1 éradiquées (eager loading), cache Redis, queues pour les tâches lourdes. Côté sécurité, chaque API
        passe la checklist <InternalLink href="/services/securite-applications-web-owasp">OWASP Top 10</InternalLink> (injection, auth broken,
        exposure). Pour un diagnostic existant, voir{" "}
        <InternalLink href="/services/audit-securite-web-casablanca">l’audit de sécurité web à Casablanca</InternalLink>.
      </p>
      <h2>Exemples portfolio</h2>
      <p>
        <em>Electro 05</em> : catalogue, panier, paiements, stock temps réel. <em>Hotel Cinco</em> : planning, facturation,
        multi-rôles. Code disponible en démo sur{" "}
        <Link href="/projets" className="text-red-400 underline underline-offset-4">
          mes projets backend
        </Link>
        .
      </p>
    </>
  );
}

function SecuriteContent() {
  return (
    <>
      <p className="lead text-lg text-zinc-200">
        Une faille OWASP peut coûter des données clients et votre réputation. Je sécurise vos applications web selon le
        référentiel <strong>OWASP Top 10</strong>, de l’audit initial au hardening continu.
      </p>
      <h2>OWASP Top 10 — appliqué, pas théorique</h2>
      <p>
        Injection, authentification défaillante, exposition de données, XXE, contrôle d’accès brisé, mauvaise config, XSS,
        désérialisation, composants vulnérables, logging insuffisant — chaque risque est checklisté dans le code et l’infra.
        Mon background full stack (React/Laravel) me permet de corriger à la source, pas seulement de signaler.
      </p>
      <h2>Méthodologie</h2>
      <h3>1. Cartographie & tests</h3>
      <p>
        Reconnaissance, tests manuels + automatisés, revue de code. Les applications Laravel et React que je développe
        intègrent déjà ces garde-fous — voyez{" "}
        <InternalLink href="/services/developpeur-laravel-maroc">mes services Laravel au Maroc</InternalLink> et{" "}
        <InternalLink href="/services/developpeur-react-nextjs-casablanca">React à Casablanca</InternalLink>.
      </p>
      <h3>2. Hardening</h3>
      <p>
        CSP, HttpOnly/Secure cookies, CSRF tokens, validation stricte, rate limiting, chiffrement at-rest, logs centralisés.
        Chaque correctif est testé et documenté.
      </p>
      <h2>Besoin d’un diagnostic ?</h2>
      <p>
        Si vous soupçonnez une faille, commencez par{" "}
        <InternalLink href="/services/audit-securite-web-casablanca">mon audit de sécurité web à Casablanca</InternalLink> — rapport
        priorisé et plan de correction inclus. Pour une vision globale, revenez à{" "}
        <InternalLink href="/services/developpement-web-full-stack-casablanca">l’offre full stack à Casablanca</InternalLink>.
      </p>
    </>
  );
}

function AuditContent() {
  return (
    <>
      <p className="lead text-lg text-zinc-200">
        Vous voulez savoir où vous en êtes vraiment ? Mon <strong>audit de sécurité web à Casablanca</strong> fournit un
        diagnostic OWASP clair, priorisé et actionnable — pas un PDF générique.
      </p>
      <h2>Ce que couvre l’audit</h2>
      <p>
        Scope défini ensemble (site vitrine, e-commerce, API Laravel, SPA React). Tests boîte noire + revue de code si accès
        fourni. Chaque finding est noté CVSS, avec preuve de concept et recommandation précise.
      </p>
      <h3>Livrables</h3>
      <ul>
        <li>Rapport exécutif (risques métier) + technique (reproduce steps)</li>
        <li>Matrice OWASP Top 10 avec statut</li>
        <li>Plan de correction priorisé (quick wins vs. chantiers)</li>
        <li>Re-test inclus après correctifs</li>
      </ul>
      <p>
        L’audit s’appuie sur mon expertise{" "}
        <InternalLink href="/services/securite-applications-web-owasp">sécurité OWASP</InternalLink> et mon expérience
        backend <InternalLink href="/services/developpeur-laravel-maroc">Laravel</InternalLink> — je corrige ce que je
        trouve.
      </p>
      <h2>Pour qui ?</h2>
      <p>
        E-commerces, SaaS, sites vitrines avec données clients, administrations. Basé à Casablanca, j’interviens sur site ou
        à distance. Après l’audit, beaucoup de clients enchaînent avec{" "}
        <InternalLink href="/services/developpement-web-full-stack-casablanca">une refonte full stack sécurisée</InternalLink>.
      </p>
    </>
  );
}

function CreationContent() {
  return (
    <>
      <p className="lead text-lg text-zinc-200">
        Vous lancez votre activité au Maroc ? Je crée votre <strong>site web professionnel</strong> — vitrine crédible,
        e-commerce qui convertit ou application sur-mesure — avec design, SEO et sécurité inclus.
      </p>
      <h2>Quelle offre pour quel besoin ?</h2>
      <h3>Site vitrine</h3>
      <p>
        Présentation claire, temps de chargement &lt; 1s, SEO local Casablanca, formulaire de contact et analytics. Idéal
        pour indépendants et cabinets. Design minimaliste inspiré de mon portfolio (desktop 94 Lighthouse).
      </p>
      <h3>E-commerce</h3>
      <p>
        WordPress/WooCommerce ou React + Laravel API selon le catalogue. Paiements, stock, livraison — exemple{" "}
        <em>Electro 05</em>. Chaque boutique est durcie OWASP (voir{" "}
        <InternalLink href="/services/securite-applications-web-owasp">sécurité applicative</InternalLink>).
      </p>
      <h3>Sur-mesure</h3>
      <p>
        Besoin métier complexe (hôtellerie, immobilier) ? Stack{" "}
        <InternalLink href="/services/developpement-web-full-stack-casablanca">full stack à Casablanca</InternalLink> avec{" "}
        <InternalLink href="/services/developpeur-react-nextjs-casablanca">frontend React</InternalLink> et{" "}
        <InternalLink href="/services/developpeur-laravel-maroc">backend Laravel</InternalLink>. Maquettes Figma, itérations
        hebdomadaires, formation à la prise en main.
      </p>
      <h2>Pourquoi moi plutôt qu’une agence ?</h2>
      <p>
        Un interlocuteur expert, des coûts maîtrisés, un code que vous possédez. Basé à Casablanca, je connais le marché
        local et reste disponible après livraison (maintenance, évolutions).
      </p>
    </>
  );
}
