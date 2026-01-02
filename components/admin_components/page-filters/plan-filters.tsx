"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce"; 
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlanFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Helper to update URL
  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Reset page on filter change

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    handleFilterChange("query", term);
  }, 300);

  const clearFilters = () => {
    replace(pathname);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      {/* 1. Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search by company name..."
          className="pl-9"
          defaultValue={searchParams.get("query")?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* 2. Plan Filter */}
      <div className="w-full md:w-[200px]">
        <Select
          defaultValue={searchParams.get("plan") || "all"}
          onValueChange={(val) => handleFilterChange("plan", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="FREE">Free Plan</SelectItem>
            <SelectItem value="PRO">Pro Plan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Button */}
      {(searchParams.get("query") || searchParams.get("plan")) && (
        <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear Filters">
           <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}