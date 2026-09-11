import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import CocoonServicesBlock from "@/components/seo/CocoonServicesBlock";
// Below-the-fold : code-split pour réduire le JS initial (LCP)
const About = dynamic(() => import("@/components/About"), { ssr: true });
const Expertise = dynamic(() => import("@/components/Expertise"), { ssr: true });
const Projects = dynamic(() => import("@/components/Projects"), { ssr: true });
const SignatureSection = dynamic(() => import("@/components/SignatureSection"), {
  ssr: true,
});
const Contact = dynamic(() => import("@/components/Contact"), { ssr: true });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: true });
// import ZakariaFinale from "@/components/ZakariaFinale";
const PinnedOverlaps = dynamic(() => import("@/components/PinnedOverlaps"), {
  ssr: false,
});

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Expertise />
      <CocoonServicesBlock />
      <Projects />
      <SignatureSection />
      <Contact />
      <Footer />
      {/* <ZakariaFinale /> */}
      <PinnedOverlaps />
    </main>
  );
}