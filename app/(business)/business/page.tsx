import { BusinessHero } from "@/components/business_components/business-hero";
import { CheckBusinessSearch } from "@/components/business_components/check-business-search";
import { WhyReviewersTrustSection } from "@/components/business_components/why-reviewers-trust";
import { BusinessSolutionsSection } from "@/components/business_components/business-solutions-section";
import { DataInsightsSection } from "@/components/business_components/data-insights-section";
import { ClientLogosCarousel } from "@/components/business_components/clients-logo-carousel";
import { BusinessTestimonialSection } from "@/components/business_components/business-testimonial-section";

export const metadata = {
  title: "Help for Business - Grow with Trust",
  description: "Join the world's largest independent customer feedback platform.",
};

export default function BusinessLandingPage() {
  return (
    <div className="w-full">
      <BusinessHero />
      <CheckBusinessSearch />
      <WhyReviewersTrustSection />
      <BusinessSolutionsSection />
      <DataInsightsSection />
      <ClientLogosCarousel />
      <BusinessTestimonialSection />
    </div>
  );
}