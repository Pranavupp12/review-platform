"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "relevant", label: "Most relevant" },
  { value: "newest", label: "Newest added" },
  { value: "rating_high", label: "Highest rated" },
  { value: "rating_low", label: "Lowest rated" },
];

export function CategorySort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get("sort") || "relevant";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "relevant") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const activeLabel = SORT_OPTIONS.find(opt => opt.value === currentSort)?.label;

  return (
    <div className="flex items-center">
      {/* 1. Label Outside */}
      <span className="text-md font-medium text-gray-600">Sort by:</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-[160px] text-md gap-0.5  bg-white border-gray-200 text-gray-900 font-semibold hover:bg-gray-50"
          >
            {activeLabel}
            <ChevronDown className="h-5 w-5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-[160px]">
          {SORT_OPTIONS.map((option) => {
            const isSelected = currentSort === option.value;
            return (
              <DropdownMenuItem 
                key={option.value} 
                onClick={() => handleSortChange(option.value)}
                className={cn(
                  "flex items-center justify-between cursor-pointer py-2.5",
                  isSelected ? "font-semibold text-gray-600 hover:bg-gray-50 " : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {option.label}
                
                {/* 2. Normal Tick for selection */}
                {isSelected && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}