import LandingNav from "@/components/LandingNav";
import HeroSection from "@/components/HeroSection";
import TrustedBy from "@/components/TrustedBy";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorks from "@/components/HowItWorks";
import StatsSection from "@/components/StatsSection";
import CTASection from "@/components/CTASection";
import LandingFooter from "@/components/LandingFooter";

export default function Home() {
  return (
    <div className="flex flex-col">
      <LandingNav />
      <main>
        <HeroSection />
        <TrustedBy />
        <FeaturesSection />
        <HowItWorks />
        <StatsSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
