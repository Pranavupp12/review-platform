// app/(main)/write-review/page.tsx
import { WriteReviewHero } from '@/components/write-review_components/write-review-hero';
import { TrustBentoGrid } from '@/components/write-review_components/trust-bento-grid';

export const metadata = {
  title: 'Write a Review - Help',
  description: 'Share your experience and help others make better choices.',
};

export default async function WriteReviewPage() {

  return (
    <div className="min-h-screen ">
      
     <WriteReviewHero />

      {/* 2. NEW: Trust Bento Grid (Replaces Popular Companies) */}
      <div className="bg-gray-50">
        <TrustBentoGrid />
      </div>
    </div>
  );
}