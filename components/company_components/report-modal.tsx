// components/company_components/report-modal.tsx
"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { reportReview } from "@/lib/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea"; 
import { toast } from "sonner";

const REPORT_REASONS = [
  { id: "harmful", label: "Harmful or illegal", description: "Hate speech, discrimination, threats, or violence." },
  { id: "personal_info", label: "Personal information", description: "Contains names, addresses, phone numbers, or emails." },
  { id: "advertising", label: "Advertising or promotional", description: "Contains promo codes, links, or marketing." },
  { id: "not_genuine", label: "Not a genuine experience", description: "Written by a competitor, employee, or bot." },
  { id: "profanity", label: "Profanity or harassment", description: "Contains offensive language or personal attacks." },
  { id: "other", label: "Other", description: "Something else not listed here." },
];

interface ReportModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  reviewId: string;
}

export function ReportModal({ open, setOpen, reviewId }: ReportModalProps) {
  const [reportReason, setReportReason] = useState<string>(REPORT_REASONS[0].id);
  const [otherDetail, setOtherDetail] = useState(""); // State for custom text
  const [isReporting, setIsReporting] = useState(false);

  const handleReport = async () => {
    if (reportReason === 'other' && !otherDetail.trim()) {
      alert("Please describe the issue.");
      return;
    }

    setIsReporting(true);
    
    // Determine what text to send
    let finalReason = "";
    
    if (reportReason === 'other') {
      finalReason = `Other: ${otherDetail}`;
    } else {
      const selectedOption = REPORT_REASONS.find(r => r.id === reportReason);
      finalReason = selectedOption ? selectedOption.label : reportReason;
    }

    const result = await reportReview(reviewId, finalReason);
    
    setIsReporting(false);
    setOpen(false);
    // Reset fields
    setOtherDetail(""); 
    setReportReason(REPORT_REASONS[0].id);
    
    if (result?.success) {
      // 2. Use Toast
      toast.success("Report submitted", {
        description: "Our moderation team is investigating. Thank you."
      });
    } else {
      toast.error("Submission failed", {
        description: "Please try again later."
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Report this review
          </DialogTitle>
          <DialogDescription>
            Please select the problem with this review. We take all reports seriously.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 max-h-[400px] overflow-y-auto pr-2">
          <RadioGroup value={reportReason} onValueChange={setReportReason} className="gap-3">
            {REPORT_REASONS.map((reason) => (
              <div key={reason.id}>
                <div 
                  className={`flex items-start space-x-3 border p-3 rounded-lg cursor-pointer transition-colors ${
                    reportReason === reason.id ? "border-primary bg-primary/5" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setReportReason(reason.id)}
                >
                  <RadioGroupItem value={reason.id} id={reason.id} className="mt-1" />
                  <div className="grid gap-1">
                    <Label htmlFor={reason.id} className="font-medium cursor-pointer text-sm md:text-base">
                      {reason.label}
                    </Label>
                    <p className="text-xs text-gray-500">
                      {reason.description}
                    </p>
                  </div>
                </div>

                {/* Conditionally show Textarea immediately below the "Other" option */}
                {reason.id === 'other' && reportReason === 'other' && (
                  <div className="mt-2 ml-8 animate-in slide-in-from-top-2 fade-in duration-200">
                    <Textarea 
                      placeholder="Please verify why you are reporting this review..."
                      value={otherDetail}
                      onChange={(e) => setOtherDetail(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isReporting}>
            Cancel
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white" 
            onClick={handleReport}
            disabled={isReporting}
          >
            {isReporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}