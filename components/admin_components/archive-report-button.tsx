"use client";

import { useState } from "react";
import { archiveReport } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ArchiveReportButton({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleArchive = async () => {
    setLoading(true);
    await archiveReport(reportId);
    setLoading(false);
    router.refresh();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleArchive} 
            disabled={loading}
            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Remove from list</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}