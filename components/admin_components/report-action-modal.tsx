"use client";

import { useState } from "react";
import { resolveReport } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, ShieldCheck, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReportActionModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  report: any; // Type this properly if possible
}

export function ReportActionModal({ isOpen, setIsOpen, report }: ReportActionModalProps) {
  const [action, setAction] = useState<'DELETE' | 'KEEP' | 'WARN'>('KEEP');
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // If review is already null (deleted), we can only close the ticket
    const reviewId = report.review?.id || ""; 
    
    const result = await resolveReport(report.id, reviewId, action, note);
    
    setIsSubmitting(false);
    if (result.success) {
      setIsOpen(false);
      router.refresh();
    } else {
      alert("Error processing request");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Resolve Report</DialogTitle>
          <DialogDescription>
            Decide what to do with this review reported for: <span className="font-bold text-red-500">{report.reason}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-gray-50 p-3 rounded-md text-sm italic text-gray-600 border">
            "{report.review?.comment || "Review content unavailable (Deleted)"}"
          </div>

          <RadioGroup value={action} onValueChange={(v: any) => setAction(v)} className="gap-3">
            
            <div className={`flex items-center space-x-3 border p-3 rounded-lg cursor-pointer ${action === 'DELETE' ? 'border-red-500 bg-red-50' : ''}`}>
              <RadioGroupItem value="DELETE" id="delete" />
              <Label htmlFor="delete" className="flex items-center gap-2 cursor-pointer">
                <Trash2 className="h-4 w-4 text-red-600" /> Take Down (Delete)
              </Label>
            </div>

            <div className={`flex items-center space-x-3 border p-3 rounded-lg cursor-pointer ${action === 'WARN' ? 'border-orange-500 bg-orange-50' : ''}`}>
              <RadioGroupItem value="WARN" id="warn" />
              <Label htmlFor="warn" className="flex items-center gap-2 cursor-pointer">
                <AlertTriangle className="h-4 w-4 text-orange-600" /> Warn / Request Edit
              </Label>
            </div>

            <div className={`flex items-center space-x-3 border p-3 rounded-lg cursor-pointer ${action === 'KEEP' ? 'border-green-500 bg-green-50' : ''}`}>
              <RadioGroupItem value="KEEP" id="keep" />
              <Label htmlFor="keep" className="flex items-center gap-2 cursor-pointer">
                <ShieldCheck className="h-4 w-4 text-green-600" /> Dismiss (Keep Review)
              </Label>
            </div>

          </RadioGroup>

          <div className="space-y-2">
            <Label>Message to Author (Optional)</Label>
            <Textarea 
              placeholder="Explain why this action was taken..." 
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#000032]">
             {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Decision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}