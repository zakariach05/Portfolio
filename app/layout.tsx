import type { Metadata } from "next";
import { Inter, Outfit, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import LenisProvider from "@/components/providers/LenisProvider";
import IntroProvider from "@/components/providers/IntroProvider";
import ContactStatusProvider from "@/contexts/ContactStatusContext";
import LanguageProvider from "@/contexts/LanguageContext";
import CurtainMenu from "@/components/CurtainMenu";
import SiteBackground from "@/components/SiteBackground";
import OverlayGroup from "@/components/OverlayGroup";
import NavigationDots from "@/components/NavigationDots";
import PersonSchema from "@/components/PersonSchema";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

const getaiGrotesk = localFont({
  src: [
    {
      path: "../public/fonts/dtgetaigroteskdisplay-black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-getai",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zakariach05.vercel.app"),
  title: {
    default: "Zakaria Chamekh | Développeur Web Full Stack & Sécurité des Applications Web",
    template: "%s | Zakaria Chamekh",
  },
  description:
    "Développeur Web Full Stack à Casablanca, Maroc. Zakaria Chamekh : développement React, Laravel, WordPress, Node.js et sécurité des applications web (OWASP, audit, hardening). Portfolio : CRM cloud, e-commerce, gestion hôtelière.",
  keywords: [
    "développeur web Casablanca",
    "développeur full stack Maroc",
    "sécurité des applications web",
    "application security engineer Maroc",
    "OWASP",
    "web audit sécurité",
    "React developer Casablanca",
    "Laravel developer Maroc",
    "WordPress développeur Casablanca",
    "Zakaria Chamekh",
  ],
  authors: [{ name: "Zakaria Chamekh", url: "https://zakariach05.vercel.app" }],
  creator: "Zakaria Chamekh",
  icons: {
    icon: "/NV-IMG/V.png",
  },
  alternates: {
    canonical: "https://zakariach05.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://zakariach05.vercel.app",
    siteName: "Zakaria Chamekh - Portfolio",
    title: "Zakaria Chamekh | Développeur Web Full Stack & Sécurité des Applications Web",
    description:
      "Développeur Web Full Stack à Casablanca. Zakaria Chamekh : React, Laravel, WordPress, Node.js, et sécurité des applications web (OWASP, audit, hardening).",
    images: [
      {
        url: "/NV-IMG/og-image.png", // 1200x630 recommandé - a créer
        width: 1200,
        height: 630,
        alt: "Zakaria Chamekh - Développeur Web Full Stack & Sécurité des Applications Web",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zakaria Chamekh | Développeur Web Full Stack & Sécurité des Applications Web",
    description:
      "Développeur Web Full Stack à Casablanca. React, Laravel, WordPress, Node.js et sécurité des applications web (OWASP).",
    images: ["/NV-IMG/og-image.png"],
    creator: "@ChamekhZak33734",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  verification: {
    google: "2uKTy_wkCFso5p6LiLEEiu6cxKNPdRx7Ak2ovVDb15c", // ghir l-content, bla meta tag kamla
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`dark ${inter.variable} ${outfit.variable} ${bebas.variable} ${jetbrainsMono.variable} ${getaiGrotesk.variable}`}
    >
      {/* html porte la classe "dark" en permanence : le design étant 100% dark,
          on ne gère pas de toggle de thème (comme l'original, verrouillé dark). */}
      <body className="bg-gray-50 text-slate-800 dark:bg-black dark:text-slate-100 font-sans transition-colors duration-300 w-full overflow-x-clip">
        {/* LCP : poster hero préchargé haute priorité (WebP 720p, ~80KB) */}
        <link
          rel="preload"
          as="image"
          href="/NV-IMG/hero-poster.webp"
          type="image/webp"
          fetchPriority="high"
        />
        <PersonSchema />
        <ContactStatusProvider>
          <LanguageProvider>
            <SiteBackground />
            <LenisProvider>
              <CurtainMenu />
              <NavigationDots />
              <IntroProvider>{children}</IntroProvider>
            </LenisProvider>
            <OverlayGroup />
          </LanguageProvider>
        </ContactStatusProvider>
      </body>
    </html>
  );
}
