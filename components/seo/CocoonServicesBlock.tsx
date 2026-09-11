import Link from "next/link";
import { getAllCocoonPages } from "@/lib/seo-cocoon";

/**
 * Bloc "Expertise" sur la page mère (/) qui liste TOUTES les pages filles.
 * Maillage montant : transmet le PageRank vers le cocon et permet le crawl.
 * Placé idéalement entre Projects et Contact.
 */
export default function CocoonServicesBlock() {
  const pages = getAllCocoonPages();

  return (
    <section id="expertise-cocon" aria-labelledby="cocon-title" className="relative py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 font-mono text-xs tracking-[0.3em] text-red-500">EXPERTISE — CASABLANCA & MAROC</p>
          <h2 id="cocon-title" className="text-3xl font-black tracking-tighter text-white md:text-5xl">
            Développeur Web Full Stack à <span className="text-red-500">Casablanca</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
            Applications web complètes, performantes et sécurisées — du frontend React au backend Laravel, avec une exigence
            forte sur la sécurité OWASP. Découvrez mes services détaillés ci-dessous.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((p) => (
            <Link
              key={p.slug}
              href={`/services/${p.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition-all hover:border-red-500/40 hover:bg-white/[0.06]"
            >
              <h3 className="text-sm font-bold leading-snug text-white group-hover:text-red-400">{p.h1.split("—")[0].trim()}</h3>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">{p.description}</p>
              <span className="mt-3 inline-flex text-xs font-medium text-zinc-500 group-hover:text-red-500">En savoir plus →</span>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/services"
            className="inline-flex rounded-full border border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-red-500 hover:text-red-400"
          >
            Voir tous les services
          </Link>
        </div>
      </div>
    </section>
  );
}
