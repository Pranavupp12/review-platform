import Link from 'next/link';
import Image from 'next/image';
import { BlockRating } from '@/components/shared/block-rating';
import { ReviewActions } from '@/components/dashboard_components/review-actions';
import { AlertTriangle } from 'lucide-react';
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface FlaggedReviewCardProps {
  review: {
    id: string;
    starRating: number;
    reviewTitle: string | null;
    comment: string | null;
    dateOfExperience: Date;
    createdAt: Date;
    relatedImages: string[];
    adminMessage: string | null; 
    company: {
      name: string;
      slug: string;
      logoImage: string | null;
    };
  };
}

export function FlaggedReviewCard({ review }: FlaggedReviewCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border-2 border-orange-200 shadow-sm flex flex-col relative overflow-hidden">
      
      {/* 1. WARNING BANNER */}
      <div className="absolute top-0 left-0 right-0 bg-orange-50 border-b border-orange-100 p-3 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
        <div>
           <p className="text-sm font-bold text-orange-800">
             <TranslatableText text="Action Required" />
           </p>
           <div className="text-xs text-orange-700 mt-1">
             <TranslatableText text={review.adminMessage || "This review has been flagged. Please edit it to comply with our guidelines."} />
           </div>
        </div>
      </div>

      {/* Spacer for the banner */}
      <div className="mt-16"></div>

      {/* Standard Card Content */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-50 rounded-lg border flex items-center justify-center overflow-hidden relative">
            {review.company.logoImage ? (
              <Image src={review.company.logoImage} alt={review.company.name} fill className="object-contain p-1"/>
            ) : (
              <span className="font-bold text-gray-400">{review.company.name[0]}</span>
            )}
          </div>
          <Link href={`/company/${review.company.slug}`} className="font-bold text-gray-900 hover:underline">
            <TranslatableText text={review.company.name}/>
          </Link>
        </div>
      </div>

      <div className="mb-4 opacity-75">
        <div className="mb-2"><BlockRating value={review.starRating} size="sm" /></div>
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
            <TranslatableText text={review.reviewTitle || ""} />
        </h3>
        <div className="text-gray-600 text-sm line-clamp-2 italic">
            "<TranslatableText text={review.comment || ""} />"
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
        <ReviewActions review={{
            ...review,
            reviewTitle: review.reviewTitle || '',
            comment: review.comment || ''
        }} />
      </div>
    </div>
  );
}