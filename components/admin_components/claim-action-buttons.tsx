"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, AlertTriangle } from "lucide-react";
import { approveBusinessClaim, rejectBusinessClaim } from "@/lib/actions"; 
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ClaimActionButtons({ claimId }: { claimId: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const handleApprove = async () => {
    setLoading("approve");
    const res = await approveBusinessClaim(claimId);
    if(res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Business approved & email sent!");
      setApproveOpen(false); 
    }
    setLoading(null);
  };

  const handleReject = async () => {
    setLoading("reject");
    const res = await rejectBusinessClaim(claimId);
    if(res?.error) {
      toast.error(res.error);
    } else {
      toast.info("Claim rejected & email sent.");
      setRejectOpen(false); 
    }
    setLoading(null);
  };

  return (
    <div className="flex justify-end gap-2">
      <TooltipProvider>
        
        {/* --- REJECT MODAL --- */}
        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Reject Claim</p></TooltipContent>
          </Tooltip>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" /> Reject Claim
              </DialogTitle>
              {/* Note: If you have paragraphs here too, ensure they are inside standard divs, not nested improperly */}
              <DialogDescription className="pt-2">
                Are you sure you want to reject this business claim? 
                <br /><br />
                This will mark the request as <strong>Rejected</strong> and automatically send an email to the user notifying them of the decision.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={!!loading}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject} 
                disabled={!!loading}
              >
                {loading === "reject" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* --- APPROVE MODAL --- */}
        <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-sm"
                >
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-xs font-bold">Approve</span>
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Verify & Send Invite</p></TooltipContent>
          </Tooltip>

          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-700">
                <Check className="h-5 w-5" /> Approve Claim
              </DialogTitle>
              
              {/* FIX: Keep description as just text */}
              <DialogDescription className="pt-2">
                This will perform the following actions:
              </DialogDescription>

              {/* FIX: Move the list OUTSIDE DialogDescription but still inside Header (or Content) */}
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700 text-sm">
                <li>Create or Link the <strong>Company Profile</strong>.</li>
                <li>Upgrade the User Account to <strong>Business</strong> level.</li>
                <li>Send an <strong>Approval Email</strong> with a password setup link.</li>
              </ul>

            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveOpen(false)} disabled={!!loading}>
                Cancel
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                onClick={handleApprove} 
                disabled={!!loading}
              >
                {loading === "approve" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm & Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </TooltipProvider>
    </div>
  );
}