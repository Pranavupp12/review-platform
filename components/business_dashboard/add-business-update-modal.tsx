"use client";

import React, { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createBusinessUpdate } from "@/lib/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Plus, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

// Submit Button Component
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="bg-[#0ABED6] hover:bg-[#0ABED6]/80" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
        </>
      ) : (
        "Post Update"
      )}
    </Button>
  );
}

interface AddBusinessUpdateModalProps {
  companyId: string;
}

export function AddBusinessUpdateModal({ companyId }: AddBusinessUpdateModalProps) {
  const [open, setOpen] = useState(false);
  
  // Use React Action State (similar to CompanyModal)
  const [state, formAction] = useActionState(createBusinessUpdate, null);

  // Local State for Preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setImagePreview(null);
    }
  }, [open]);

  // Handle Success/Error from Server Action
  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      setOpen(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0ABED6] hover:bg-[#0ABED6]/80 text-white flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Post New Article
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a Business Article</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-6 mt-4">
          <input type="hidden" name="companyId" value={companyId} />

          {/* Image Upload (Native Input) */}
          <div className="space-y-2">
            <Label>Update Image (Required)</Label>
            <div className="flex items-center gap-4">
              {/* Preview Box */}
              <div className="relative h-32 w-32 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                {imagePreview ? (
                  <>
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        // Reset file input if needed via ref, but simpler to just let user re-select
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">No Image</span>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <Label
                  htmlFor="image"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  <Upload className="h-4 w-4" /> Choose Image
                </Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Upload a high-quality image (JPG, PNG).
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title / Headline</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Summer Sale Starts Now!"
              required
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Details</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Describe your update..."
              className="min-h-[120px]"
              required
            />
          </div>

          {/* Link URL */}
          <div className="space-y-2">
            <Label htmlFor="linkUrl">Button Link (Optional)</Label>
            <Input
              id="linkUrl"
              name="linkUrl"
              type="url"
              placeholder="https://yourwebsite.com/offer"
            />
          </div>

          {/* Error Message Display */}
          {state?.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {state.error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}