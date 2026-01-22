"use client";

import React, { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateReview } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRatingInput } from "@/components/shared/star-rating-input";
import { Loader2, CalendarIcon } from "lucide-react";
import { useFormStatus } from "react-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface EditReviewModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  review: {
    id: string;
    starRating: number;
    reviewTitle: string;
    comment: string;
    dateOfExperience: Date; 
    company: {
        slug: string;
        name: string;
    }
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="bg-[#0ABED6] hover:bg-[#09A8BD] text-white" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <TranslatableText text="Save Changes" />
    </Button>
  );
}

export function EditReviewModal({ open, setOpen, review }: EditReviewModalProps) {
  const [rating, setRating] = useState(review.starRating);
  const [date, setDate] = useState<Date | undefined>(
    review.dateOfExperience ? new Date(review.dateOfExperience) : new Date()
  );

  const [state, formAction] = useActionState(updateReview, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      router.refresh();
    }
  }, [state, setOpen, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <form action={formAction}>
          <input type="hidden" name="reviewId" value={review.id} />
          <input type="hidden" name="companySlug" value={review.company.slug} />
          <input type="hidden" name="rating" value={rating} />
          <input type="hidden" name="date" value={date?.toISOString()} />

          <DialogHeader>
            <DialogTitle>
                <TranslatableText text="Edit your review for" /> {review.company.name}
            </DialogTitle>
          </DialogHeader>
          
          {state?.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
              <TranslatableText text={state.error} />
            </div>
          )}

          <div className="grid gap-6 py-6">
            {/* Rating */}
            <div className="flex flex-col gap-3 items-center justify-center bg-gray-50 py-6 rounded-lg border border-dashed border-gray-300">
              <Label><TranslatableText text="Rating" /></Label>
              <StarRatingInput rating={rating} onRatingChange={setRating} />
            </div>

            {/* Date Picker */}
            <div className="grid gap-2">
              <Label><TranslatableText text="Date of Experience" /></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span><TranslatableText text="Pick a date" /></span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title"><TranslatableText text="Title" /></Label>
              <Input id="title" name="title" defaultValue={review.reviewTitle} required />
            </div>

            {/* Content */}
            <div className="grid gap-2">
              <Label htmlFor="content"><TranslatableText text="Review" /></Label>
              <Textarea id="content" name="content" defaultValue={review.comment} className="min-h-[150px]" required />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                <TranslatableText text="Cancel" />
            </Button>
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}