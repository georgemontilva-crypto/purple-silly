import AnnouncementBar from "@/components/AnnouncementBar";
import HeroSection from "@/components/HeroSection";
import ChooseYourRide from "@/components/ChooseYourRide";
import MeetTheLineup from "@/components/MeetTheLineup";
import BenefitsSection from "@/components/BenefitsSection";
import ComparisonSection from "@/components/ComparisonSection";
import ReviewsSection from "@/components/ReviewsSection";
import FAQSection from "@/components/FAQSection";
import NewsletterSection from "@/components/NewsletterSection";
import { Reveal } from "@/components/motion/Reveal";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      {/* Hero is above the fold — no reveal, it should be visible immediately. */}
      <HeroSection />
      <Reveal><ChooseYourRide /></Reveal>
      <Reveal><MeetTheLineup /></Reveal>
      <Reveal><BenefitsSection /></Reveal>
      <Reveal><ComparisonSection /></Reveal>
      <Reveal><ReviewsSection /></Reveal>
      <Reveal><FAQSection /></Reveal>
      <Reveal><NewsletterSection /></Reveal>
    </div>
  );
}
