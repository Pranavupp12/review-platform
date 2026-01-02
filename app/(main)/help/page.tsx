import { ScoringHero } from "@/components/help_components/scoring-hero";
import { RatingLogic } from "@/components/help_components/rating-logic"; // Replaces TheSimpleFormula
import { TrustBuildingVisual } from "@/components/help_components/trust-building-visual"; // Replaces FairnessGrid
import { HelpTestimonials } from "@/components/help_components/help-testimonials";

export const metadata = {
  title: 'How Scoring Works - help',
  description: 'Understanding our fair and balanced review scoring system.',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      <ScoringHero />
      <RatingLogic />
      <TrustBuildingVisual />
      <HelpTestimonials/>
    </div>
  );
}