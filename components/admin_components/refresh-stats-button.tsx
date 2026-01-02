"use client";

import { useState } from "react";
import { generateAnalyticsAction } from "@/lib/actions"; // We will create this next
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function RefreshStatsButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setLoading(true);
    const result = await generateAnalyticsAction();
    setLoading(false);

    if (result.success) {
      toast.success("Analytics reports generated successfully.");
      router.refresh();
    } else {
      toast.error("Failed to generate reports.");
    }
  };

  return (
    <Button 
      onClick={handleRefresh} 
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2 bg-[#0ABED6] text-white hover:text-white hover:bg-[#0ABED6]/80"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      Update Analytics
    </Button>
  );
}