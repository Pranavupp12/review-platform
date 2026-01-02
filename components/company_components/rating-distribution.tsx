"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RatingDistributionProps {
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  totalReviews: number;
  companySlug: string;
  averageRating: number;
  companyId: string;
  companyName: string;
  isLoggedIn: boolean;
}

export function RatingDistribution({ 
    distribution, 
    totalReviews, 
    companySlug,
    averageRating, 
    isLoggedIn,
}: RatingDistributionProps) {
    
  const searchParams = useSearchParams();
  const activeRating = searchParams.get("rating");

  const writeReviewUrl = isLoggedIn 
    ? `/write-review/${companySlug}` 
    : `/login?callbackUrl=/company/${companySlug}`;

  return (
    <div className="bg-white p-6 border border-gray-200 ">
       
       {/* 1. Header: Golden Star + Average Rating */}
       <div className="flex items-center gap-3 mb-2">
          {/* Changed color to yellow-500 (Golden) */}
          <Star className="h-8 w-8 p-1 rounded-sm fill-white text-white bg-[#0892A5]" />
          <span className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
       </div>

       {/* 2. Heading: "All reviews" */}
       <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-gray-900 text-lg">All reviews</h3>
          {activeRating && (
            <Link
              href={`/company/${companySlug}`}
              scroll={false}
              className="text-xs font-medium text-[#0ABED6] hover:text-[#0ABED6]/80 hover:underline flex items-center gap-1 transition-colors"
            >
              <X className="h-3 w-3" /> Clear filter
            </Link>
          )}
       </div>

       {/* 3. Sub-line: Total • Write a review */}
       <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span>{totalReviews.toLocaleString()} total</span>
          <span className="text-gray-500">•</span>
          
          <div className="-ml-2"> 
            {/* --- NEW: LINK TO WRITE REVIEW PAGE --- */}
          <Link href={writeReviewUrl}>
             <Button 
                variant="ghost" 
                className="text-gray-500 hover:text-[#0ABED6] hover:bg-transparent px-0 h-auto font-normal underline decoration-gray-300 underline-offset-4 hover:decoration-[#0ABED6]"
             >
                Write a review
             </Button>
          </Link>
          </div>
       </div>

       {/* 4. Star Rating Bars */}
       <div className="space-y-3">
         {[5, 4, 3, 2, 1].map((star) => {
            // @ts-ignore
            const count = distribution[star] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            const isActive = activeRating === star.toString();

            const params = new URLSearchParams(searchParams.toString());
            if (isActive) {
                params.delete("rating");
            } else {
                params.set("rating", star.toString());
            }

            return (
               <Link 
                  key={star} 
                  href={`/company/${companySlug}?${params.toString()}`} 
                  scroll={false}
               >
                  <div className={cn(
                      "flex items-center gap-3 p-1.5 -mx-2 rounded-lg transition-all group cursor-pointer",
                      // Only highlight BG when selected, else hover effect
                      isActive ? "bg-slate-100" : "hover:bg-gray-50"
                  )}>
                      
                      {/* Label: "5-star" (Checkbox removed) */}
                      <span className={cn(
                          "w-12 shrink-0 text-sm",
                          isActive ? "font-bold text-gray-900" : "font-medium text-gray-700"
                      )}>
                          {star}-star
                      </span>

                      {/* Progress Bar (Thinner h-2) */}
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                         <div
                            className={cn(
                                "h-full rounded-full transition-all duration-500 ease-out", 
                                // Dark bar normally, Blue when filtered
                                isActive ? "bg-[#0ABED6]" : "bg-[#0892A5]"
                            )}
                            style={{ width: `${percentage}%` }}
                         />
                      </div>

                      {/* Percentage */}
                      <div className={cn(
                          "w-10 text-right text-xs tabular-nums group-hover:text-gray-900",
                          isActive ? "font-bold text-gray-900" : "font-medium text-gray-500"
                      )}>
                         {count > 0 ? `${Math.round(percentage)}%` : "0%"}
                      </div>
                  </div>
               </Link>
            )
         })}
       </div>
    </div>
  );
}
