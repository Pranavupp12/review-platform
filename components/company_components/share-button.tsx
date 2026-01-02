"use client";

import React from "react";
import { Share2, Copy, Check } from "lucide-react"; // Removed 'X' import
import { FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6"; 

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  // DialogClose, <--- Remove this import
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

interface ShareModalProps {
  reviewId: string;
  companyName: string;
}

export function ShareButton({ reviewId, companyName }: ShareModalProps) {
  const pathname = usePathname();
  const [isCopied, setIsCopied] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${pathname}#review-${reviewId}` : '';

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSocialShare = (platform: 'facebook' | 'x') => {
    let url = '';
    if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    } else if (platform === 'x') {
      url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out this review for ${companyName}`;
    }
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <Share2 className="h-4 w-4" /> Share
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-xl">
        
        {/* Header */}
        <DialogHeader className="p-4 flex flex-row items-center justify-between border-b border-gray-100 space-y-0">
          <DialogTitle className="text-lg font-bold text-gray-900">Share review</DialogTitle>
          
          {/* --- REMOVED THE CUSTOM CLOSE BUTTON SECTION FROM HERE --- */}
          
        </DialogHeader>

        {/* Body */}
        <div className="p-4 space-y-3 bg-gray-50/50">
          
          {/* Facebook Button */}
          <Button
            variant="outline"
            className="w-full justify-center gap-3 py-6 rounded-full bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium transition-all"
            onClick={() => handleSocialShare('facebook')}
          >
            <FaFacebook className="h-5 w-5 text-[#1877F2]" />
            Share on Facebook
          </Button>

          {/* X (Twitter) Button */}
          <Button
            variant="outline"
            className="w-full justify-center gap-3 py-6 rounded-full bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium transition-all"
            onClick={() => handleSocialShare('x')}
          >
            <FaXTwitter className="h-5 w-5 text-black" />
            Share on X
          </Button>

          {/* Copy Link Button */}
          <Button
            variant="outline"
            className="w-full justify-center gap-3 py-6 rounded-full bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium transition-all"
            onClick={handleCopyLink}
          >
            {isCopied ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Copy className="h-5 w-5 text-blue-600" />
            )}
            {isCopied ? "Copied!" : "Copy link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}