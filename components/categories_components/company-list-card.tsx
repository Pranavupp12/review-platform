"use client"; 

import Link from 'next/link';
import Image from 'next/image';
import { BlockRating } from '@/components/shared/block-rating';
import { Badge } from '@/components/ui/badge';
import { BADGE_CONFIG } from "@/lib/badges"; 
import { trackSearchClick } from "@/lib/track-click"; 
// ✅ Import Translator
import { TranslatableText } from "@/components/shared/translatable-text";

type CompanyListCardProps = {
  id: string;
  slug: string,
  name: string;
  logoImage: string | null;
  websiteUrl: string | null;
  address: string | null;
  rating: number;
  reviewCount: number;
  badges?: string[];
  isFeatured?: boolean;
  trackingContext?: {
    query?: string;    
    location?: string; 
    userRegion?: string;
  };
};

export function CompanyListCard({
  id,
  slug,
  name,
  logoImage,
  websiteUrl,
  address,
  rating,
  reviewCount,
  badges = [],
  isFeatured = false,
  trackingContext 
}: CompanyListCardProps) {

  const displayWebsite = websiteUrl ? websiteUrl.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') : 'N/A';
  const hasRelevantBadge = badges.includes("MOST_RELEVANT");
  const badgeConfig = hasRelevantBadge ? BADGE_CONFIG["MOST_RELEVANT"] : null;

  const handleClick = () => {
    const query = trackingContext?.query || "category_view";
    const loc = trackingContext?.location || "global";
    const region = trackingContext?.userRegion || "unknown"; 

    trackSearchClick(id, query, loc, region, isFeatured);
  };

  return (
    <Link 
      href={`/company/${slug}`} 
      onClick={handleClick} 
      className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-6 bg-white border-b border-gray-300 transition-all duration-200 "
    >
      {/* Left Section: Logo & Badge */}
      <div className="flex-shrink-0 flex flex-row sm:flex-col items-center gap-2 sm:gap-0">
        {logoImage ? (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg overflow-hidden flex items-center justify-center border-none ">
            <Image
              src={logoImage}
              alt={`${name} logo`}
              fill
              className="object-contain p-1"
              sizes="80px"
            />
          </div>
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">
            <TranslatableText text="No Logo" />
          </div>
        )}

        {badgeConfig && (
          <Badge 
             className={`mt-2 text-[10px] sm:text-xs font-bold border-none shadow-sm flex items-center gap-1 text-center justify-center min-w-[100px] 
             ${badgeConfig.bg} ${badgeConfig.color} hover:${badgeConfig.bg}`}
          >
            <badgeConfig.icon className="h-3 w-3" />
            <TranslatableText text={badgeConfig.label} />
          </Badge>
        )}
      </div>

      {/* Middle Section */}
      <div className="flex-grow flex flex-col justify-center sm:ml-4">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
          <TranslatableText text={name}/>
        </h3>
        {websiteUrl && (
          <p className="text-sm text-gray-600 line-clamp-1">
            {displayWebsite}
          </p>
        )}
        <div className="flex items-center mt-1">
          <BlockRating value={rating} size="sm" />
          <span className="ml-2 text-sm font-semibold text-gray-800">
            {rating.toFixed(1)}
          </span>
          <span className="ml-2 text-sm text-gray-500">
            · {reviewCount} <TranslatableText text="reviews" />
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="sm:ml-auto sm:text-right text-left text-sm text-gray-500 mt-2 sm:mt-0">
        {address ? (
           
            <p className="line-clamp-2 sm:max-w-[200px]"><TranslatableText text={address}/></p>
        ) : (
            <p className="italic"><TranslatableText text="Location not specified" /></p>
        )}
      </div>
    </Link>
  );
}