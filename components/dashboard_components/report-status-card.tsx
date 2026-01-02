"use client";

import { X, CheckCircle2, Clock } from "lucide-react";
import { dismissReport } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface ReportStatusCardProps {
  report: {
    id: string;
    reason: string;
    status: string; // "PENDING" | "RESOLVED"
    resolution: string | null;
    createdAt: Date;
    review: {
      company: { name: string }
    } | null; // Review might be null if deleted
  };
}

export function ReportStatusCard({ report }: ReportStatusCardProps) {
  const router = useRouter();

  const handleDismiss = async () => {
    const result = await dismissReport(report.id);
    if (result.success) {
      toast.success("Report removed from view");
      router.refresh();
    } else {
      toast.error("Failed to remove");
    }
  };

  const isPending = report.status === "PENDING";

  const displayDate = format(new Date(report.createdAt), "MMM d, yyyy");

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-all min-h-[200px] flex flex-col">
      
      {/* Dismiss Button (Top Right) */}
      <button 
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-full ${isPending ? "bg-yellow-50 text-yellow-600" : "bg-emerald-50 text-emerald-600"}`}>
           {isPending ? <Clock className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
        </div>
        <div>
           <p className="text-xs font-bold text-gray-500 uppercase">
             {isPending ? "Investigating" : "Resolved"}
           </p>
           <p className="text-xs text-gray-400">
            {displayDate}
           </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="font-medium text-gray-900 mb-1">
          Report: {report.review?.company.name || "Deleted Review"}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Reason: <span className="italic">{report.reason}</span>
        </p>
      </div>

      {/* Resolution Footer */}
      {report.resolution && (
        <div className="mt-auto pt-3 border-t border-gray-50 text-sm text-emerald-700 bg-emerald-50/50 p-2 rounded-md">
           {report.resolution}
        </div>
      )}
      
      {isPending && (
        <div className="mt-auto pt-3 border-t border-gray-50 text-xs text-yellow-700 bg-yellow-50/50 p-2 rounded-md">
           We are reviewing your report.
        </div>
      )}
    </div>
  );
}