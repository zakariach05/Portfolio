import { getCocoonPage } from "@/lib/seo-cocoon";

type Props = { slug: string };

/**
 * Service JSON-LD (schema.org/Service) + BreadcrumbList
 * Injecté dans chaque page fille du cocon.
 */
export default function ServiceSchema({ slug }: Props) {
  const page = getCocoonPage(slug);
  if (!page) return null;

  const baseUrl = "https://zakariach05.vercel.app";
  const url = `${baseUrl}/services/${slug}`;

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.serviceType,
    serviceType: page.serviceType,
    provider: {
      "@type": "Person",
      name: "Zakaria Chamekh",
      url: baseUrl,
    },
    areaServed: [
      { "@type": "City", name: "Casablanca" },
      { "@type": "Country", name: "Morocco" },
    ],
    url,
    description: page.description,
    keywords: page.keywords.join(", "),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: `${baseUrl}/services`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.serviceType,
        item: url,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  );
}
