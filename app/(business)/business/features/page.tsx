// app/(business)/business/features/page.tsx

import { BeDiscoveredFeature } from "@/components/business_features/be-discovered-feature";
import { BusinessProfileFeature } from "@/components/business_features/business-profile-feature";
import { FeaturesHero } from "@/components/business_features/features-hero";
import { ReviewInsightsFeature } from "@/components/business_features/review-insights-feature";

export const metadata = {
  title: "Features - Tools to Grow Your Business",
  description: "Explore the analytics, widgets, and management tools available on Help Business.",
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen w-full">
      <FeaturesHero />
      <BusinessProfileFeature/>
      <BeDiscoveredFeature/>
      <ReviewInsightsFeature/>
    </div>
  );
}