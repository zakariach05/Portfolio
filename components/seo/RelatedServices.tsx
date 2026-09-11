import Link from "next/link";
import { getRelatedPages } from "@/lib/seo-cocoon";

type Props = { currentSlug: string };

/**
 * <RelatedServices> — bloc maillage en bas de chaque page fille.
 * Affiche 2-3 pages sœurs selon COCOON_RELATIONS.
 * Placé après le contenu principal, avant le CTA.
 */
export default function RelatedServices({ currentSlug }: Props) {
  const related = getRelatedPages(currentSlug);
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-services-title" className="mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
      <h2 id="related-services-title" className="mb-6 text-xl font-bold tracking-tight text-white">
        Services liés
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {related.map((page) => (
          <li key={page.slug}>
            <Link
              href={`/services/${page.slug}`}
              className="group flex flex-col rounded-xl border border-white/5 bg-black/20 p-5 transition-colors hover:border-red-500/30 hover:bg-white/[0.04]"
            >
              <span className="text-sm font-medium leading-snug text-white group-hover:text-red-400">
                {page.h1.split("—")[0].trim()}
              </span>
              <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                {page.description}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium tracking-wide text-red-500">
                Découvrir <span aria-hidden>→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center text-xs text-zinc-500">
        Retour à la{" "}
        <Link href="/" className="underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white/40">
          page d’accueil — développeur web full stack à Casablanca
        </Link>
      </p>
    </section>
  );
}
