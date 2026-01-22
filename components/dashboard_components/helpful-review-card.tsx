import Link from 'next/link';
import { BlockRating } from '@/components/shared/block-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp } from 'lucide-react';
import { ReviewImages } from '@/components/company_components/review-images';
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface HelpfulReviewCardProps {
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
    user: {
      name: string | null;
      image: string | null;
    };
  };
}

export function HelpfulReviewCard({ review }: HelpfulReviewCardProps) {
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
    <div className="bg-white rounded-md p-6  border border-gray-200 transition-all flex flex-col ">

      {/* Header */}
      <div className="flex items-start justify-between mb-4 border-b border-gray-50 pb-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={review.user.image || ''} />
            <AvatarFallback>{review.user.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate">
              <TranslatableText text={review.user.name}/>
            </p>
            <p className="text-xs text-gray-500 truncate">
              <TranslatableText text="on" /> <Link href={`/company/${review.company.slug}`} className="hover:underline text-gray-700">{review.company.name}</Link>
            </p>
          </div>
        </div>

        <span className="text-xs text-gray-400 shrink-0 ml-2 mt-1">
          <TranslatableText text={displayDate}/>
        </span>
      </div>

      {/* Body */}
      <div className="flex-1">
        <div className="mb-2 flex justify-between items-center">
          <BlockRating value={review.starRating} size="sm" />
          <div className="bg-blue-50 p-1 rounded-full text-[#0ABED6]">
            <ThumbsUp className="h-3 w-3 fill-current" />
          </div>
        </div>

        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 text-sm">
          {/* ✅ Translatable Review Title */}
          <TranslatableText text={review.reviewTitle || 'Untitled'} />
        </h3>

        <div className="text-gray-600 text-xs leading-relaxed line-clamp-3 mb-4">
          {/* ✅ Translatable Comment */}
          <TranslatableText text={review.comment || ""} />
        </div>

        {/* 3. RENDER IMAGES HERE */}
        {review.relatedImages && review.relatedImages.length > 0 && (
          <div className="mb-4">
            <ReviewImages images={review.relatedImages} />
          </div>
        )}

        {/* Date Pill */}
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
            <TranslatableText text="Date of Experience" />: {experienceDate}
          </span>
        </div>
      </div>
    </div>
  );
}