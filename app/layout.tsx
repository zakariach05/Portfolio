import type { Metadata } from "next";
import { Inter, Outfit, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "@fortawesome/fontawesome-free/css/all.min.css";
import LenisProvider from "@/components/providers/LenisProvider";
import IntroProvider from "@/components/providers/IntroProvider";
import ContactStatusProvider from "@/contexts/ContactStatusContext";
import LanguageProvider from "@/contexts/LanguageContext";
import CurtainMenu from "@/components/CurtainMenu";
import SiteBackground from "@/components/SiteBackground";
import CustomCursor from "@/components/CustomCursor";
import NavigationDots from "@/components/NavigationDots";
import Chatbot from "@/components/Chatbot";
import ScrollTopButton from "@/components/ScrollTopButton";
import PersonSchema from "@/components/PersonSchema";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
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
    default: "Zakaria Chamekh | Développeur Web Full Stack Casablanca",
    template: "%s | Zakaria Chamekh",
  },
  description:
    "Développeur Web Full Stack junior à Casablanca, spécialisé en React, Laravel, WordPress et Node.js. Portfolio de projets : CRM cloud, e-commerce, gestion hôtelière.",
  keywords: [
    "développeur web Casablanca",
    "développeur full stack Maroc",
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
    title: "Zakaria Chamekh | Développeur Web Full Stack Casablanca",
    description:
      "Développeur Web Full Stack junior à Casablanca, spécialisé en React, Laravel, WordPress et Node.js.",
    images: [
      {
        url: "/NV-IMG/og-image.png", // 1200x630 recommandé - a créer
        width: 1200,
        height: 630,
        alt: "Zakaria Chamekh - Développeur Web Full Stack",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zakaria Chamekh | Développeur Web Full Stack Casablanca",
    description:
      "Développeur Web Full Stack junior à Casablanca, spécialisé en React, Laravel, WordPress et Node.js.",
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
        <PersonSchema />
        <ContactStatusProvider>
          <LanguageProvider>
          <SiteBackground />
          <CustomCursor />
          <LenisProvider>
            <CurtainMenu />
            <NavigationDots />
            <IntroProvider>{children}</IntroProvider>
          </LenisProvider>
          <Chatbot />
          <ScrollTopButton />
          </LanguageProvider>
        </ContactStatusProvider>
      </body>
    </html>
  );
}