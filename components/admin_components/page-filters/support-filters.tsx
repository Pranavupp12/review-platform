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
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SupportFilters() {
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
          placeholder="Search by name, email, or message content..."
          className="pl-9"
          defaultValue={searchParams.get("query")?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* 2. Type Filter */}
      <div className="w-full md:w-[180px]">
        <Select
          defaultValue={searchParams.get("type") || "all"}
          onValueChange={(val) => handleFilterChange("type", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="GENERAL">General</SelectItem>
            <SelectItem value="TECHNICAL">Technical</SelectItem>
            <SelectItem value="BUSINESS">Business</SelectItem>
            <SelectItem value="REVIEW">Review Issue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 3. Status Filter */}
      <div className="w-full md:w-[160px]">
        <Select
          defaultValue={searchParams.get("status") || "all"}
          onValueChange={(val) => handleFilterChange("status", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Button */}
      {(searchParams.get("query") || searchParams.get("type") || searchParams.get("status")) && (
        <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear Filters">
           <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}