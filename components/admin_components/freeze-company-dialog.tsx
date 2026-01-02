"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lock, Unlock, ShieldCheck, Loader2, Clock } from "lucide-react";
import { toggleCompanyFreeze } from "@/lib/actions"; 
import { toast } from "sonner";
import { differenceInCalendarDays, addDays, format } from "date-fns";

interface FreezeCompanyDialogProps {
  company: {
    id: string;
    name: string;
    isFrozen: boolean;
    claimedAt: Date | null;
    createdAt: Date | null; // ✅ CHANGED: Allow null here
    domainVerified: Date | null;
    domainVerifyEmail: string | null;
  };
}

export function FreezeCompanyDialog({ company }: FreezeCompanyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- LOGIC CALCULATION ---
  const isVerified = !!company.domainVerified;
  
  // ✅ CHANGED: Added fallback "|| new Date()" to prevent crashes if both are null
  const startDate = company.claimedAt || company.createdAt || new Date();
  
  const deadlineDate = addDays(new Date(startDate), 30);
  const daysRemaining = differenceInCalendarDays(deadlineDate, new Date());
  const isOverdue = !isVerified && daysRemaining < 0;

  // Handler
  const handleToggle = async () => {
    setLoading(true);
    const result = await toggleCompanyFreeze(company.id, !company.isFrozen);
    setLoading(false);
    
    if (result.success) {
      toast.success(company.isFrozen ? "Account Unfrozen" : "Account Frozen");
      setOpen(false);
    } else {
      toast.error(result.error || "Failed to update");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={company.isFrozen ? "destructive" : "outline"} 
          size="sm"
          className={`h-8 gap-2 border-dashed ${isOverdue && !company.isFrozen ? "border-red-400 bg-red-50 text-red-600 hover:bg-red-100" : "hover:bg-gray-100"}`}
        >
          {company.isFrozen ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          {company.isFrozen ? "Unfreeze" : "Freeze"}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {company.isFrozen ? "Restoring Access" : "Restricting Access"}
          </DialogTitle>
          <DialogDescription>
             Manage access for <strong>{company.name}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* --- STATUS CARD INSIDE MODAL --- */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
           
           {/* 1. Verification Status */}
           <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-sm font-medium text-gray-500">Domain Verification</span>
              {isVerified ? (
                 <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                 </span>
              ) : (
                 <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                    <Clock className="h-3 w-3 mr-1" /> Pending
                 </span>
              )}
           </div>

           {/* 2. Countdown / Overdue Logic */}
           {!isVerified && (
             <div className="flex items-start gap-3">
                <div className={`mt-0.5 p-1.5 rounded-full ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                   <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                   <p className={`text-sm font-bold ${isOverdue ? 'text-red-700' : 'text-blue-700'}`}>
                      {isOverdue 
                        ? `Overdue by ${Math.abs(daysRemaining)} days` 
                        : `${daysRemaining} days remaining`
                      }
                   </p>
                   <p className="text-xs text-gray-500 mt-1">
                      Deadline: {format(deadlineDate, "dd MMM yyyy")}
                   </p>
                </div>
             </div>
           )}

           {/* 3. Verified Details */}
           {isVerified && (
              <p className="text-xs text-gray-500">
                 Verified Email: {company.domainVerifyEmail}
              </p>
           )}
        </div>

        {/* --- WARNING IF FREEZING --- */}
        {!company.isFrozen && (
           <p className="text-sm text-gray-600 mt-2">
              Freezing this account will prevent the business owner from accessing their dashboard. Their public page will remain visible.
           </p>
        )}

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant={company.isFrozen ? "default" : "destructive"} 
            onClick={handleToggle} 
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {company.isFrozen ? "Unfreeze Account" : "Confirm Freeze"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}