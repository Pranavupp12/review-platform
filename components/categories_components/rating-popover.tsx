// components/categories/rating-popover.tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Star, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingPopover() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  // Get current rating from URL or default to 'all'
  const currentRating = searchParams.get("rating") || "all";

  const handleRatingChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("rating");
    } else {
      params.set("rating", value);
    }
    router.push(`?${params.toString()}`);
    setOpen(false);
  };

  const options = [
    { value: "all", label: "All" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" },
    { value: "4.5", label: "4.5+" },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="text-black bg-gray-50 border border-black hover:bg-gray-200 hover:text-black">
          <Star className="h-4 w-4 mr-2" /> Rating <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-2">
          <h4 className="font-medium leading-none mb-3 text-sm text-muted-foreground">Filter by Rating</h4>
          <div className="flex border rounded-md overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRatingChange(option.value)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors border-r last:border-r-0",
                  // Logic to highlight selected option
                  (option.value === "all" && currentRating === "all") || (option.value !== "all" && currentRating === option.value)
                    ? "bg-[#0892A5]/10 text-[#0892A5]"
                    : "bg-white hover:bg-gray-50 text-gray-700"
                )}
              >
                 <span className="flex items-center gap-1">
                    {option.value !== 'all' && <Star className="h-3 w-3 fill-current" />}
                    {option.label}
                 </span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}