// components/home_components/hero-review-card.tsx

import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { BlockRating } from '../shared/block-rating';

type HeroReviewCardProps = {
  userName: string;
  userInitials: string;
  userAvatarUrl?: string | null;
  rating: number;
  reviewText: string;
  companyLogoUrl: string | null;
  companyName: string;
  companyDomain: string;
  companySlug: string;
  dateOfExperience: Date;
  createdAt: Date;
  className?: string;
};

export function HeroReviewCard({
  userName,
  userInitials,
  userAvatarUrl,
  rating,
  reviewText,
  companyLogoUrl,
  companyName,
  companyDomain,
  companySlug,
  dateOfExperience,
  createdAt,
  className,
}: HeroReviewCardProps) {
  
  // Date Formatting
  const createdDate = createdAt ? new Date(createdAt) : new Date();
  const displayDate = format(createdDate, "MMM d, yyyy");
  
  const experienceDate = dateOfExperience ? new Date(dateOfExperience) : new Date();
  const displayExpDate = format(experienceDate, "MMM d, yyyy");


  return (
    <Link 
      href={`/company/${companySlug}`}
      // FIX: Enforce strict width (w-[320px]) so it never stretches
      className={cn(
        "block w-[320px] bg-white rounded-md p-5 border border-gray-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer",
        className
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 border border-gray-100">
            <AvatarImage src={userAvatarUrl || ''} alt={userName} />
            <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 text-sm line-clamp-1">{userName}</span>
            <span className="text-[10px] text-gray-400">{displayDate}</span>
          </div>
        </div>
      </div>

      {/* Stars */}
      <div className="mb-2"><BlockRating value={rating} size="sm"/></div>

      {/* Content */}
      <p className="text-gray-600 text-xs leading-relaxed line-clamp-3 mb-3 min-h-[3rem]">
        {reviewText}
      </p>

      {/* Date Pill */}
      <div className="mb-4">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-100">
           Date of Experience: {displayExpDate}
        </span>
      </div>

      {/* Footer (Company) */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <div className="h-6 w-6 bg-gray-50 rounded border flex items-center justify-center overflow-hidden relative shrink-0">
            {companyLogoUrl ? (
              <Image src={companyLogoUrl} alt={companyName} fill className="object-contain p-0.5" />
            ) : (
              <span className="text-[10px] font-bold text-gray-400">{companyName?.[0]}</span>
            )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 text-xs truncate">{companyName}</p>
          <p className="text-[10px] text-gray-400 truncate">{companyDomain}</p>
        </div>
      </div>
    </Link>
  );
}