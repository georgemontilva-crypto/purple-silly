import HeroSection from "@/components/HeroSection";
import ChooseYourRide from "@/components/ChooseYourRide";
import MeetTheLineup from "@/components/MeetTheLineup";
import BenefitsSection from "@/components/BenefitsSection";
import HomeReels from "@/components/HomeReels";
import ComparisonSection from "@/components/ComparisonSection";
import ReviewsSection from "@/components/ReviewsSection";
import FAQSection from "@/components/FAQSection";
import { Reveal } from "@/components/motion/Reveal";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero is above the fold — no reveal, it should be visible immediately. */}
      <HeroSection />
      <Reveal>
        <ChooseYourRide />
      </Reveal>
      <Reveal>
        <MeetTheLineup />
      </Reveal>
      <Reveal>
        <BenefitsSection />
      </Reveal>
      {/* Sits where the stat boxes used to. Renders nothing when no reel is
          active, so the page closes up rather than leaving a gap. */}
      <Reveal>
        <HomeReels />
      </Reveal>
      <Reveal>
        <ComparisonSection />
      </Reveal>
      <Reveal>
        <ReviewsSection />
      </Reveal>
      {/* FAQSection carries the newsletter signup in its second column now,
          so there is no separate newsletter band on the home page. */}
      <Reveal>
        <FAQSection />
      </Reveal>
    </div>
  );
}
