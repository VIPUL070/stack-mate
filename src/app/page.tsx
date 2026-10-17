import Faqs from "@/components/landing/faq";
import { Hero } from "@/components/landing/hero";
import Platform from "@/components/landing/platform";
import UnlockInnovation from "@/components/landing/unlock-innovation";
import Footer from "@/components/layout/footer";
import ProximitySidebar, { ProximitySection } from "@/components/layout/proximity-sidebar";
import SiteNavbar from "@/components/layout/site-navbar";
import { ParticleLogoCompo } from "@/components/tds/particle-logo/demo";

const SECTIONS: ProximitySection[] = [
  { id: "hero", label: "Intro", level: 1 },
  { id: "innovation", label: "Innovation", level: 2 },
  { id: "platform", label: "Features", level: 2 },
  { id: "particle", label: "Particle", level: 3 },
  { id: "faq", label: "FAQ", level: 4 },
  { id: "footer", label: "Footer", level: 5 },
];

export default function Home() {

  return (
    <div className="relative min-h-screen">
      <aside className="fixed right-0 top-1/2 z-50 hidden -translate-y-1/2 md:block">
        <ProximitySidebar sections={SECTIONS} side="right" />
      </aside>
      <SiteNavbar />
      <Hero />
      <UnlockInnovation />
      <Platform />
      <ParticleLogoCompo />
      <Faqs />
      <Footer />
    </div>
  );
}