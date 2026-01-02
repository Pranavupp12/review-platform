"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
}

export function PaginationControls({ totalItems, pageSize, currentPage }: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / pageSize);

  // If there's only 1 page, don't show controls
  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    // 1. Get current params (sort, tag, search, etc.)
    const params = new URLSearchParams(searchParams.toString());
    
    // 2. Update page
    params.set("page", newPage.toString());
    
    // 3. Push new URL
    router.push(`?${params.toString()}`, { scroll: false }); 
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-10">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="gap-1 hover:bg-gray-100"
      >
        <ChevronLeft className="h-4 w-4" /> Previous
      </Button>

      <span className="text-sm font-medium text-gray-700">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="gap-1 hover:bg-gray-100"
      >
        Next <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}