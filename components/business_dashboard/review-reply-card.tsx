"use client";

import { useState, useEffect } from "react";
import { useActionState } from 'react';
import { replyToReview, deleteReviewReply } from "@/lib/actions"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BlockRating } from "@/components/shared/block-rating"; 
import { Reply, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReviewReplyCardProps {
  review: {
    id: string;
    starRating: number;
    comment: string | null;
    reviewTitle?: string | null;
    createdAt: Date;
    dateOfExperience: Date | null;
    ownerReply: string | null;
    ownerReplyDate: Date | null;
    user: {
      name: string | null;
      image: string | null;
    };
  };
  companyName: string;
}

// Helper to format dates like "02 Jan 2026"
function formatDate(date: Date | string | null) {
   if (!date) return "N/A";
   return format(new Date(date), "dd MMM yyyy");
}

export function ReviewReplyCard({ review, companyName }: ReviewReplyCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); 
  
  const [state, formAction, isPending] = useActionState(replyToReview, null);

  useEffect(() => {
    if (state?.success) {
      if (isReplying || isEditing) {
        toast.success(isEditing ? "Reply updated!" : "Reply posted!");
        setIsReplying(false);
        setIsEditing(false);
      }
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteReviewReply(review.id);
    setIsDeleting(false);
    setShowDeleteDialog(false); 

    if (result.success) {
      toast.success("Reply deleted");
    } else {
      toast.error(result.error);
    }
  };

  const showForm = isReplying || isEditing;

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col overflow-hidden group">
        
        {/* --- TOP SECTION: REVIEW CONTENT --- */}
        <div className="p-6 flex-1">
            <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border bg-gray-50">
                     <AvatarImage src={review.user.image || ''} />
                     <AvatarFallback className="text-[#000032] font-bold">
                        {review.user.name?.[0] || 'U'}
                     </AvatarFallback>
                  </Avatar>
                  
                  <div>
                     <p className="font-bold text-[#000032] text-sm">{review.user.name || "Anonymous"}</p>
                     <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Verified Reviewer</span>
                     </div>
                  </div>
               </div>
               <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
            </div>

            <div className="mb-3">
               <BlockRating value={review.starRating} size="sm" />
            </div>
            {review.reviewTitle && (
               <h4 className="font-bold text-gray-900 mb-2 text-base">{review.reviewTitle}</h4>
            )}

            <p className="text-sm text-gray-600 leading-relaxed mb-4">
               "{review.comment || <span className="italic text-gray-400">No written comment.</span>}"
            </p>

            <div className="mb-2">
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  Date of experience: {formatDate(review.dateOfExperience)}
               </span>
            </div>
        </div>

        {/* --- BOTTOM SECTION: REPLY AREA --- */}
        {/* We remove the generic background/padding here so the connector lines can extend naturally if needed, 
            or we can keep it clean. For this design, we can keep the wrapper but maybe lighter padding. */}
        <div className="p-4 pt-0 mt-auto"> 
          {review.ownerReply && !isEditing ? (
            
            // ✅ UPDATED: Matching the "ReviewOwnerReply" Design
            <div className="ml-4 md:ml-8 relative mt-2">
                
                {/* Connector Lines */}
                <div className="absolute -left-4 md:-left-8 top-0 h-6 w-0.5 bg-gray-100" />
                <div className="absolute -left-4 md:-left-8 top-6 w-4 md:w-8 h-0.5 bg-gray-100" />

                {/* Reply Container */}
                <div className="bg-gray-50 rounded-lg p-5 border-l-4 border-[#0ABED6]">
                    
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-sm text-[#000032]">
                             Reply from {companyName}
                           </span>
                           <span className="text-gray-300">•</span>
                           <span className="text-xs text-gray-500">
                             {formatDate(review.ownerReplyDate)}
                           </span>
                        </div>

                        {/* Dropdown Action Menu (Functionality) */}
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-[#000032] -mr-2">
                                 <MoreVertical className="h-4 w-4" />
                              </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                 <Pencil className="h-3 w-3 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                 <Trash2 className="h-3 w-3 mr-2" /> Delete
                              </DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Reply Text */}
                    <p className="text-gray-700 text-sm leading-relaxed">
                       {review.ownerReply}
                    </p>
                </div>
            </div>

          ) : (
            // --- STATE B: NO REPLY OR EDITING (Show Button or Form) ---
            <div className="border-t border-gray-100 pt-4">
              {!showForm ? (
                <div className="flex justify-end">
                   <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsReplying(true)} 
                      className="text-[#0ABED6] hover:text-[#09A8BD] hover:bg-cyan-50 h-8 text-xs font-semibold gap-2"
                   >
                      <Reply className="h-3 w-3" />
                      Reply to customer
                   </Button>
                </div>
              ) : (
                <form action={formAction} className="animate-in fade-in zoom-in-95 duration-200">
                  <input type="hidden" name="reviewId" value={review.id} />
                  <div className="flex items-center justify-between mb-2">
                     <label className="text-xs font-bold text-gray-700">Your Response</label>
                  </div>
                  <Textarea
                    name="replyText"
                    defaultValue={isEditing ? (review.ownerReply || "") : ""}
                    placeholder={`Reply to ${review.user.name || "customer"}...`}
                    className="mb-3 text-sm bg-white min-h-[80px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => { setIsReplying(false); setIsEditing(false); }} 
                      disabled={isPending}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button 
                       type="submit" 
                       size="sm" 
                       disabled={isPending} 
                       className="bg-[#0ABED6] hover:bg-[#09A8BD] text-white h-8 text-xs"
                    >
                      {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : (isEditing ? "Update Reply" : "Post Reply")}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reply?</DialogTitle>
            <DialogDescription>
              This will permanently remove your reply. The customer's review will remain visible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}