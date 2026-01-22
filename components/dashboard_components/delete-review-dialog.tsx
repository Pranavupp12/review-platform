"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteReviewAction } from "@/lib/actions";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface DeleteReviewDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  reviewId: string;
  companySlug: string;
}

export function DeleteReviewDialog({ 
  open, 
  setOpen, 
  reviewId, 
  companySlug 
}: DeleteReviewDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteReviewAction(reviewId, companySlug);
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error("Failed to delete review:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
             <TranslatableText text="Delete Review" />
          </DialogTitle>
          <DialogDescription className="py-3">
             <TranslatableText text="Are you sure you want to delete this review? This action cannot be undone." />
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            disabled={isDeleting}
          >
            <TranslatableText text="Cancel" />
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <TranslatableText text="Deleting..." />
              </>
            ) : (
              <TranslatableText text="Delete" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}