"use client";

import React, { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { toggleHelpful } from '@/lib/actions';
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpfulButtonProps {
  reviewId: string;
  initialCount: number;
  initialState: boolean;
  latestVoterName: string | null;
  isLoggedIn: boolean; // <--- Add Prop
}

export function HelpfulButton({ 
  reviewId, 
  initialCount, 
  initialState, 
  latestVoterName,
  isLoggedIn 
}: HelpfulButtonProps) {
  const pathname = usePathname();
  const router = useRouter(); // <--- Init Router
  
  const [isHelpful, setIsHelpful] = useState(initialState);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  const handleHelpful = async () => {
    // --- 1. Auth Check ---
    if (!isLoggedIn) {
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}&message=vote_required`;
      router.push(loginUrl);
      return;
    }

    // Optimistic Update
    const newStatus = !isHelpful;
    setIsHelpful(newStatus);
    setCount(prev => newStatus ? prev + 1 : prev - 1);
    setIsPending(true);

    const result = await toggleHelpful(reviewId, pathname);
    setIsPending(false);

    if (result?.error) {
      setIsHelpful(!newStatus); // Revert
      setCount(prev => newStatus ? prev - 1 : prev + 1);
    }
  };

  let tooltipText = "Mark as helpful";
  if (count > 0 && latestVoterName) {
    tooltipText = count === 1 ? `Liked by ${latestVoterName}` : `Liked by ${latestVoterName} and ${count - 1} others`;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={handleHelpful}
            disabled={isPending}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isHelpful ? "text-[#0ABED6]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${isHelpful ? "fill-current" : ""}`} /> 
            Helpful {count > 0 && <span>({count})</span>}
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-900 text-white text-xs px-2 py-1">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}