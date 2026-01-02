"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CompanyAboutSectionProps {
  company: {
    name: string;
    briefIntroduction: string | null;
    address: string | null;
    websiteUrl: string | null;
    contact?: {
      email?: string | null;
      phone?: string | null;
    } | null; // Updated type to handle potential null/undefined
  };
}

export function CompanyAboutSection({ company }: CompanyAboutSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if the text is long enough to need a button (Optional logic, 
  // but usually we just show the button if text exists)
  const hasText = !!company.briefIntroduction;

  return (
    <div className="bg-white border-none ">
      <h2 className="text-xl font-bold text-gray-900 mb-4">About {company.name}</h2>

      {/* Top Row: Text + Map */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        
        {/* Description Column */}
        <div className="flex-1">
          <div className={cn(
            "prose prose-gray max-w-none text-gray-700 leading-relaxed text-lg relative",
            !isExpanded && "line-clamp-3" // This class cuts the text after 4 lines
          )}>
            <p>
              {company.briefIntroduction || 
               `Information about ${company.name} is currently being updated. This company is verified on Help and actively collecting customer feedback.`}
            </p>
          </div>
          
          {/* Toggle Button */}
          {hasText && (
            <Button 
              variant="link" 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="p-0 h-auto mt-2 text-[#0ABED6] font-semibold hover:no-underline"
            >
              {isExpanded ? (
                <span className="flex items-center gap-1">Show less <ChevronUp className="h-4 w-4" /></span>
              ) : (
                <span className="flex items-center gap-1">Read more <ChevronDown className="h-4 w-4" /></span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}