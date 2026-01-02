import { HowItWorksHero } from "@/components/how-it-works_components/how-it-works-hero";
import { ReviewJourney } from "@/components/how-it-works_components/review-journey";
import { IntegritySection } from "@/components/how-it-works_components/integrity-section";
import { FAQSection } from "@/components/how-it-works_components/faq-section";

export const metadata = {
  title: 'How help works - Transparency and Process',
  description: 'Learn how we maintain trust, process reviews, and ensure transparency for everyone.',
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <HowItWorksHero />
      <ReviewJourney />
      <IntegritySection />
      <FAQSection />
    </div>
  );
}