import AnnouncementBar from "@/components/AnnouncementBar";
import HeroSection from "@/components/HeroSection";
import ChooseYourRide from "@/components/ChooseYourRide";
import MeetTheLineup from "@/components/MeetTheLineup";
import BenefitsSection from "@/components/BenefitsSection";
import ComparisonSection from "@/components/ComparisonSection";
import ReviewsSection from "@/components/ReviewsSection";
import FAQSection from "@/components/FAQSection";
import NewsletterSection from "@/components/NewsletterSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <HeroSection />
      <ChooseYourRide />
      <MeetTheLineup />
      <BenefitsSection />
      <ComparisonSection />
      <ReviewsSection />
      <FAQSection />
      <NewsletterSection />
    </div>
  );
}
