"use client";

import React, { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateBusinessUpdate } from "@/lib/actions";
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
import { Loader2, Edit, X, Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="bg-[#0ABED6] hover:bg-[#0ABED6]/80 text-white" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
    </Button>
  );
}

interface EditProps {
  update: {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    linkUrl?: string | null;
  };
  companyId: string;
}

export function EditBusinessUpdateModal({ update, companyId }: EditProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(updateBusinessUpdate, null);
  const [imagePreview, setImagePreview] = useState<string | null>(update.imageUrl);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      setOpen(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  // Reset preview to original when modal opens/closes
  useEffect(() => {
     if(open) setImagePreview(update.imageUrl);
  }, [open, update.imageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
           <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Article</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-6 mt-4">
          <input type="hidden" name="companyId" value={companyId} />
          <input type="hidden" name="updateId" value={update.id} />

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Update Image</Label>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">No Image</span>
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor={`edit-image-${update.id}`} className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                  <Upload className="h-4 w-4" /> Change Image
                </Label>
                <Input 
                  id={`edit-image-${update.id}`} 
                  name="image" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange} 
                />
                <p className="text-xs text-muted-foreground mt-2">Leave empty to keep current image.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input name="title" defaultValue={update.title} required maxLength={100} />
          </div>

          <div className="space-y-2">
            <Label>Details</Label>
            <Textarea name="content" defaultValue={update.content} className="min-h-[120px]" required />
          </div>

          <div className="space-y-2">
            <Label>Button Link (Optional)</Label>
            <Input name="linkUrl" type="url" defaultValue={update.linkUrl || ""} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" className="hover:bg-gray-100" onClick={() => setOpen(false)}>Cancel</Button>
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}