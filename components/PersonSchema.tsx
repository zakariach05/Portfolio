// components/PersonSchema.tsx
export default function PersonSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Zakaria Chamekh",
    jobTitle: "Développeur Web Full Stack",
    url: "https://zakariach05.vercel.app",
    image: "https://zakariach05.vercel.app/NV-IMG/heroP_pro.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Casablanca",
      addressCountry: "MA",
    },
    sameAs: [
      "https://github.com/zakariach05",
      "https://www.linkedin.com/in/zakaria-chamekh-996812319/",
      "https://www.instagram.com/forev_60/",
      "https://x.com/ChamekhZak33734",
    ],
    knowsAbout: [
      "React",
      "Laravel",
      "WordPress",
      "Node.js",
      "Spring Boot",
      "TypeScript",
      "PostgreSQL",
      "MySQL",
      "Docker",
    ],
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "ENSAM Casablanca",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
