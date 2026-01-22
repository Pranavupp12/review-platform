// components/dashboard/my-review-card.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlockRating } from '@/components/shared/block-rating';
import { ReviewActions } from '@/components/dashboard_components/review-actions';
import { ReviewImages } from '@/components/company_components/review-images';
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface MyReviewCardProps {
  review: {
    id: string;
    starRating: number;
    reviewTitle: string | null;
    comment: string | null;
    dateOfExperience: Date;
    createdAt: Date;
    relatedImages: string[];
    company: {
      name: string;
      slug: string;
      logoImage: string | null;
    };
  };
}

export function MyReviewCard({ review }: MyReviewCardProps) {
  const createdDate = review.createdAt 
    ? new Date(review.createdAt) 
    : new Date(review.dateOfExperience);
  
  const displayDate = createdDate.toLocaleDateString(undefined, { 
    year: 'numeric', month: 'short', day: 'numeric' 
  });

  const experienceDate = new Date(review.dateOfExperience).toLocaleDateString(undefined, { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div className="bg-white rounded-md p-6 border border-gray-200 transition-all flex flex-col">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4 border-b border-gray-50 pb-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-12 w-12 bg-gray-50 rounded-lg border flex items-center justify-center overflow-hidden relative shrink-0">
            {review.company.logoImage ? (
              <Image 
                src={review.company.logoImage} 
                alt={review.company.name} 
                fill 
                className="object-contain p-1"
              />
            ) : (
              <span className="font-bold text-gray-400">{review.company.name[0]}</span>
            )}
          </div>
          <Link 
            href={`/company/${review.company.slug}`} 
            className="font-bold text-gray-900 hover:underline truncate"
          >
            <TranslatableText text={review.company.name}/>
          </Link>
        </div>
        <span className="text-xs text-gray-400 shrink-0 ml-2 mt-1">
          <TranslatableText text={displayDate}/>
        </span>
      </div>

      <div>
        <div className="mb-3">
          <BlockRating value={review.starRating} size="sm" />
        </div>
        
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">
          {/* ✅ Translatable Title */}
          <TranslatableText text={review.reviewTitle || 'Untitled Review'} />
        </h3>
        
        <div className="text-gray-600 text-sm leading-relaxed line-clamp-3 h-[4.5rem] mb-4">
          {/* ✅ Translatable Comment */}
          <TranslatableText text={review.comment || 'No comment provided.'} />
        </div>

        {/* Images */}
        {review.relatedImages && review.relatedImages.length > 0 && (
          <div className="mb-4">
             <ReviewImages images={review.relatedImages} />
          </div>
        )}

        {/* Date Pill */}
        <div className="mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
             <TranslatableText text="Date of experience" />: {experienceDate}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <ReviewActions review={{
            ...review,
            reviewTitle: review.reviewTitle || '',
            comment: review.comment || ''
        }} />
      </div>
    </div>
  );
}