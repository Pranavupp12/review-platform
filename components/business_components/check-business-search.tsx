"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { findCompanySlug } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

export function CheckBusinessSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    
    // 1. Try to find direct match
    const result = await findCompanySlug(query);
    
    setLoading(false);

    if (result.success && result.slug) {
      toast.success("Company found!");
      router.push(`/business/claim/${result.slug}`);
    } else {
      toast.info("Direct match not found. Showing search results.");
      router.push(`/business/unknown?name=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="bg-gray-50 py-10 border-b border-gray-100">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-black mb-8">
          See what customers are saying about your business:
        </h2>

        <form onSubmit={handleCheck} className="relative max-w-2xl mx-auto">
          <div className="relative">
            {/* Search Icon */}
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            
            {/* Input Field */}
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Company Name or Website URL..."
              // Added 'pr-36' to prevent text overlapping the button
              // Increased height to 'h-16' for a better look with the inner button
              className="h-16 pl-14 pr-36 text-lg rounded-full border-gray-300 shadow-md"
            />

            {/* Submit Button (Inside) */}
            <Button 
              type="submit" 
              disabled={loading}
              className="absolute right-2 top-2 bottom-1 rounded-full px-8 h-12 text-base font-regular bg-[#0ABED6] hover:bg-[#0ABED6]/80 text-white min-w-[120px]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Check"}
            </Button>
          </div>
        </form>
        
        <p className="text-gray-400 text-sm mt-6">
          * e.g. "Acme Corp" or "www.acme.com"
        </p>
      </div>
    </section>
  );
}