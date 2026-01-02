"use client";

import { MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns"; 

interface ReplyModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  companyName: string;
  replyText: string | null;
  replyDate: Date | string | null;
}

export function ReplyModal({ 
  open, 
  setOpen, 
  companyName, 
  replyText, 
  replyDate 
}: ReplyModalProps) {
  if (!replyText) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <div className="p-2 bg-blue-50 rounded-full">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            Response from {companyName}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1.5 ml-1">
            {replyDate 
              ? `Replied on ${format(new Date(replyDate), "MMMM d, yyyy")}`
              : "Date not available"}
          </DialogDescription>
        </DialogHeader>
        
        {/* Reply Content Box */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 relative">
            <span className="absolute top-2 left-2 text-4xl text-gray-200 font-serif leading-none select-none">“</span>
            <p className="text-gray-700 leading-relaxed italic relative z-10 px-2 pt-1">
              {replyText}
            </p>
        </div>

        <div className="mt-4 flex justify-end">
          <DialogClose asChild>
            <Button variant="secondary" className="text-gray-600">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}