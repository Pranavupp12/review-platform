"use client"; // 👈 1. Must be a Client Component for onClick

import Link from 'next/link';
import Image from 'next/image';
import { BlockRating } from '@/components/shared/block-rating';
import { Badge } from '@/components/ui/badge';
import { BADGE_CONFIG } from "@/lib/badges"; 
import { trackSearchClick } from "@/lib/track-click"; // 👈 2. Import the action

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
  
  // 👇 3. Add these optional props for tracking context
  trackingContext?: {
    query?: string;    // e.g. "Category: Software" or user search "best pizza"
    location?: string; // e.g. "Delhi"
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
  trackingContext // Destructure new prop
}: CompanyListCardProps) {

  const displayWebsite = websiteUrl ? websiteUrl.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') : 'N/A';
  const hasRelevantBadge = badges.includes("MOST_RELEVANT");
  const badgeConfig = hasRelevantBadge ? BADGE_CONFIG["MOST_RELEVANT"] : null;

  // 👇 4. Handle the Click
  const handleClick = () => {
    const query = trackingContext?.query || "category_view";
    const loc = trackingContext?.location || "global";
    const region = trackingContext?.userRegion || "unknown"; // ✅ Get region

    // ✅ Pass all 4 arguments: ID, Query, Location (Filter), UserRegion (Physical)
    trackSearchClick(id, query, loc, region, isFeatured);
  };

  return (
    <Link 
      href={`/company/${slug}`} 
      onClick={handleClick} // 👈 5. Attach Handler
      className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-6 bg-white border-b border-gray-300 transition-all duration-200 "
    >
      {/* ... (Rest of your UI remains exactly the same) ... */}
      
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
            No Logo
          </div>
        )}

        {badgeConfig && (
          <Badge 
             className={`mt-2 text-[10px] sm:text-xs font-bold border-none shadow-sm flex items-center gap-1 text-center justify-center min-w-[100px] 
             ${badgeConfig.bg} ${badgeConfig.color} hover:${badgeConfig.bg}`}
          >
            <badgeConfig.icon className="h-3 w-3" />
            {badgeConfig.label}
          </Badge>
        )}
      </div>

      {/* Middle Section */}
      <div className="flex-grow flex flex-col justify-center sm:ml-4">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
          {name}
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
            · {reviewCount} reviews
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="sm:ml-auto sm:text-right text-left text-sm text-gray-500 mt-2 sm:mt-0">
        {address ? (
            <p className="line-clamp-2 sm:max-w-[200px]">{address}</p>
        ) : (
            <p className="italic">Location not specified</p>
        )}
      </div>
    </Link>
  );
}