import { AboutHero } from '@/components/about_components/about-hero';
import { VisionSection } from '@/components/about_components/vision-section';
import { StatsSection } from '@/components/about_components/stats-section';
import { WhatWeDoSection } from '@/components/about_components/what-we-do-section';
import { OurValuesSection } from '@/components/about_components/our-values-section';

export const metadata = {
  title: 'About Us - help',
  description: 'Learn about our mission to become the universal symbol of trust.',
};

export default function AboutPage() {
  return (
    <div className="w-full">
      <AboutHero />
      <VisionSection />
      <StatsSection />
      <WhatWeDoSection />
      <OurValuesSection />
    </div>
  );
}