"use client";

import { useState } from "react";
import { toggleCompanyFeatured } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Pin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // <--- Import Toast

interface FeaturedToggleProps {
  companyId: string;
  isFeatured: boolean;
}

export function FeaturedToggle({ companyId, isFeatured }: FeaturedToggleProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    const result = await toggleCompanyFeatured(companyId, isFeatured);
    setLoading(false);

    if (result.success) {
      router.refresh();
      // Optional: Success feedback
      if (!isFeatured) {
        toast.success("Company pinned to homepage");
      } else {
        toast.info("Company unpinned");
      }
    } else if (result.error === "LIMIT_REACHED") {
      // --- THE LIMIT CHECK ---
      toast.error("Limit Reached", {
        description: "You can only feature 6 companies. Please unpin one first.",
        descriptionClassName: "text-gray-600"
      });
    } else {
      toast.error("Failed to update status");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "transition-all",
        isFeatured 
          ? "text-yellow-500 hover:text-yellow-600 bg-yellow-50 hover:bg-yellow-100" 
          : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
      )}
      title={isFeatured ? "Unpin from Homepage" : "Pin to Homepage"}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Pin className={cn("h-4 w-4", isFeatured && "fill-yellow-500")} />
      )}
    </Button>
  );
}