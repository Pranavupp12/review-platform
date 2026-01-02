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

interface Category {
  id: string;
  name: string;
}

export function CompanyFilters({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Helper to update URL
  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Always reset to page 1 when filtering

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  // Debounce search to avoid refreshing on every keystroke
  // If you didn't install 'use-debounce', just use: const handleSearch = (term: string) => { ... }
  const handleSearch = useDebouncedCallback((term: string) => {
    handleFilterChange("query", term);
  }, 300);

  const clearFilters = () => {
    replace(pathname); // Clears all params
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      {/* 1. Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search companies by name..."
          className="pl-9"
          defaultValue={searchParams.get("query")?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* 2. Category Filter */}
      <div className="w-full md:w-[200px]">
        <Select
          defaultValue={searchParams.get("categoryId") || "all"}
          onValueChange={(val) => handleFilterChange("categoryId", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 3. Status Filter (Claimed/Unclaimed) */}
      <div className="w-full md:w-[180px]">
        <Select
          defaultValue={searchParams.get("status") || "all"}
          onValueChange={(val) => handleFilterChange("status", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="claimed">Claimed</SelectItem>
            <SelectItem value="unclaimed">Unclaimed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Button (Only show if filters are active) */}
      {(searchParams.get("query") || searchParams.get("categoryId") || searchParams.get("status")) && (
        <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear Filters">
           <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}