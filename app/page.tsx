import Hero from "@/components/Hero";
import About from "@/components/About";
import Expertise from "@/components/Expertise";
import Projects from "@/components/Projects";
import SignatureSection from "@/components/SignatureSection";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
// import ZakariaFinale from "@/components/ZakariaFinale";
import PinnedOverlaps from "@/components/PinnedOverlaps";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Expertise />
      <Projects />
      <SignatureSection />
      <Contact />
      <Footer />
      {/* <ZakariaFinale /> */}
      <PinnedOverlaps />
    </main>
  );
}