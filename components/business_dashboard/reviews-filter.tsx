"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Filter, X } from "lucide-react";

export function ReviewsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filters
  const status = searchParams.get("status") || "all";
  const rating = searchParams.get("rating") || "all";
  const sort = searchParams.get("sort") || "newest";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // Reset page to 1 when filtering
    params.set("page", "1");
    
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("?");
  };

  const hasActiveFilters = status !== "all" || rating !== "all" || sort !== "newest";

  return (
    <div className="flex items-center gap-2">
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9"
        >
          <X className="h-4 w-4 mr-1" /> Clear
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 bg-gray-50 hover:bg-gray-200 border border-gray-500 h-9">
            <Filter className="h-4 w-4" /> 
            Filters
            {hasActiveFilters && <div className="w-2 h-2 rounded-full bg-[#0ABED6]" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          
          {/* 1. STATUS FILTER */}
          <DropdownMenuLabel>Reply Status</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={status} onValueChange={(val) => updateFilter("status", val)}>
            <DropdownMenuRadioItem value="all">All Reviews</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="unreplied">Un-replied</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="replied">Replied</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          
          <DropdownMenuSeparator />

          {/* 2. RATING FILTER */}
          <DropdownMenuLabel>Star Rating</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={rating} onValueChange={(val) => updateFilter("rating", val)}>
            <DropdownMenuRadioItem value="all">All Stars</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="5">5 Stars</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="4">4 Stars</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="3">3 Stars</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="2">2 Stars</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="1">1 Star</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          {/* 3. SORTING */}
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={(val) => updateFilter("sort", val)}>
            <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="highest">Highest Rated</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="lowest">Lowest Rated</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}