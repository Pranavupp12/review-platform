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

export function ReportFilters() {
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
          placeholder="Search by reporter or review content..."
          className="pl-9"
          defaultValue={searchParams.get("query")?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* 2. Status Filter */}
      <div className="w-full md:w-[180px]">
        <Select
          defaultValue={searchParams.get("status") || "all"}
          onValueChange={(val) => handleFilterChange("status", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="WAITING_FOR_EDIT">Waiting Edit</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="EDITED">Edited</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 3. Reason Filter */}
      <div className="w-full md:w-[180px]">
        <Select
          defaultValue={searchParams.get("reason") || "all"}
          onValueChange={(val) => handleFilterChange("reason", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Reasons" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reasons</SelectItem>
            <SelectItem value="SPAM">Spam</SelectItem>
            <SelectItem value="HARASSMENT">Harassment</SelectItem>
            <SelectItem value="FAKE_CONTENT">Fake Content</SelectItem>
            <SelectItem value="INAPPROPRIATE">Inappropriate</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Button */}
      {(searchParams.get("query") || searchParams.get("status") || searchParams.get("reason")) && (
        <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear Filters">
           <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}