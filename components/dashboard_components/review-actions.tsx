"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, MessageCircle } from 'lucide-react'; 
import { EditReviewModal } from '@/components/dashboard_components/edit-review-modal';
import { DeleteReviewDialog } from '@/components/dashboard_components/delete-review-dialog';
import { ReplyModal } from "@/components/dashboard_components/reply-modal";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface ReviewActionsProps {
  review: any; 
}

export function ReviewActions({ review }: ReviewActionsProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReply, setShowReply] = useState(false); 

  return (
    <>
      <div className="flex items-center gap-6">
        
        {/* 1. Edit Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowEdit(true)}
          className="text-gray-500 hover:text-[#0ABED6] px-0 hover:bg-transparent h-auto font-medium"
        >
          <Edit2 className="h-4 w-4 mr-2" /> <TranslatableText text="Edit" />
        </Button>

        {/* 2. Delete Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDelete(true)}
          className="text-gray-500 hover:text-red-600 px-0 hover:bg-transparent h-auto font-medium"
        >
          <Trash2 className="h-4 w-4 mr-2" /> <TranslatableText text="Delete" />
        </Button>


         {/* 3. Reply Button */}
        {review.ownerReply && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowReply(true)}
            className="text-gray-500 hover:text-blue-600 px-0 hover:bg-transparent h-auto font-medium"
          >
            <MessageCircle className="h-4 w-4 mr-2" /> <TranslatableText text="See Reply" />
          </Button>
        )}

      </div>

      {/* --- MODALS SECTION --- */}
      
      {/* Reply Modal */}
      {review.ownerReply && (
        <ReplyModal 
          open={showReply}
          setOpen={setShowReply}
          companyName={review.company.name} 
          replyText={review.ownerReply} 
          replyDate={review.ownerReplyDate}
        />
      )}

      {/* Edit Modal */}
      <EditReviewModal 
        open={showEdit} 
        setOpen={setShowEdit} 
        review={review} 
      />
      
      {/* Delete Modal */}
      <DeleteReviewDialog 
        open={showDelete} 
        setOpen={setShowDelete} 
        reviewId={review.id} 
        companySlug={review.company.slug} 
      />
    </>
  );
}