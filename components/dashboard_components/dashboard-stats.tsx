"use client";

import { Star, Eye, ThumbsUp, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface DashboardStatsProps {
  reviewCount: number;
  totalReads: number;
  totalHelpfulReceived: number;
}

export function DashboardStats({ 
  reviewCount, 
  totalReads, 
  totalHelpfulReceived 
}: DashboardStatsProps) {
  return (
    <div className="flex items-center gap-8 md:gap-12">
      
      {/* 1. Reviews Count */}
      <div className="text-center group cursor-pointer">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-gray-900">{reviewCount}</span>
          <span className="text-sm text-gray-500 flex items-center gap-1 group-hover:text-[#0ABED6] transition-colors">
            <Star className="h-3 w-3" /> <TranslatableText text="Reviews" />
          </span>
        </div>
      </div>

      <TooltipProvider delayDuration={300}>
        
        {/* 2. Total Reads (With Tooltip) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-center group cursor-help">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-900">{totalReads}</span>
                <span className="text-sm text-gray-500 flex items-center gap-1 group-hover:text-[#0ABED6] transition-colors">
                  <Eye className="h-3 w-3" /> <TranslatableText text="Reads" />
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 text-white border-none text-xs max-w-[200px] text-center">
            <p>
                <TranslatableText text="The total number of times your reviews have been viewed by others." />
            </p>
          </TooltipContent>
        </Tooltip>

        {/* 3. Useful / Helpful (With Tooltip) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-center group cursor-help">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-900">{totalHelpfulReceived}</span>
                <span className="text-sm text-gray-500 flex items-center gap-1 group-hover:text-[#0ABED6] transition-colors">
                  <ThumbsUp className="h-3 w-3" /> <TranslatableText text="Useful" />
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 text-white border-none text-xs max-w-[200px] text-center">
            <p>
                <TranslatableText text="The total number of people who found your reviews helpful." />
            </p>
          </TooltipContent>
        </Tooltip>

      </TooltipProvider>
    </div>
  );
}