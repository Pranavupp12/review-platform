"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, ChevronLeft, ChevronRight, Share, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ShareModal } from "./share-modal";

export interface BusinessUpdateType {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string | null;
  createdAt: Date;
}

interface BusinessUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updates: BusinessUpdateType[];
  initialStartIndex: number;
  companyName: string;
  companyLogo?: string | null;
}

export function BusinessUpdateModal({
  isOpen,
  onClose,
  updates,
  initialStartIndex,
  companyName,
  companyLogo
}: BusinessUpdateModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialStartIndex);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    if (isOpen) setCurrentIndex(initialStartIndex);
  }, [isOpen, initialStartIndex]);

  if (!updates || updates.length === 0) return null;

  const currentUpdate = updates[currentIndex];
  const hasNext = currentIndex < updates.length - 1;
  const hasPrev = currentIndex > 0;

  // Generate a dummy URL for sharing (You can replace this with a real logic later)
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/updates/${currentUpdate.id}` : '';

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* ... (DialogContent classes remain the same) ... */}
      <DialogContent className="[&>button]:hidden sm:max-w-[900px] w-[95vw] md:h-[550px] p-0 overflow-hidden bg-white border-none rounded-xl flex flex-col md:flex-row gap-0">
        
        {/* Custom Close Button */}
        <div className="absolute right-4 top-4 z-50">
          <button 
            onClick={onClose} 
            className="p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors backdrop-blur-sm shadow-sm border border-gray-100"
          >
            <X className="h-5 w-5 text-gray-700" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* LEFT SIDE: Image Section (No changes here) */}
        <div className="relative w-full md:w-[45%] h-64 md:h-full bg-gray-50 flex items-center justify-center overflow-hidden border-r border-gray-100">
           <Image 
             src={currentUpdate.imageUrl} 
             alt={currentUpdate.title} 
             fill 
             className="object-contain p-2" 
           />
           
           {/* Navigation Arrows (No changes) */}
           {updates.length > 1 && (
             <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setCurrentIndex(currentIndex - 1)} 
                  disabled={!hasPrev} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 text-gray-700 hover:bg-white shadow-sm rounded-full h-9 w-9 disabled:opacity-0 transition-all border border-gray-200"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setCurrentIndex(currentIndex + 1)} 
                  disabled={!hasNext} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 text-gray-700 hover:bg-white shadow-sm rounded-full h-9 w-9 disabled:opacity-0 transition-all border border-gray-200"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
             </>
           )}
        </div>

        {/* RIGHT SIDE: Content Section */}
        <div className="w-full md:w-[55%] p-6 md:p-8 flex flex-col h-full overflow-y-auto bg-white">
          {/* Header (No changes) */}
          <div className="flex items-center gap-3 mb-5">
            <Avatar className="h-12 w-30 ">
              <AvatarImage src={companyLogo || ''} />
              <AvatarFallback>{companyName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-gray-900 text-sm">{companyName}</p>
              <p className="text-xs text-gray-500">{new Date(currentUpdate.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            </div>
          </div>

          {/* Title & Content (No changes) */}
          <DialogTitle className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
            {currentUpdate.title}
          </DialogTitle>
          <div className="text-gray-700 text-base leading-relaxed whitespace-pre-line mb-6 flex-grow overflow-y-auto pr-2">
            {currentUpdate.content}
          </div>

          {/* ================= UPDATED FOOTER LAYOUT ================= */}
          <div className="mt-auto flex items-center w-full pt-4 border-t border-gray-100">
            
            {/* 1. LEARN MORE BUTTON (Extreme Left) */}
            {currentUpdate.linkUrl && (
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-bold h-10 px-6 text-sm rounded-lg shadow-sm transition-all hover:scale-[1.02]">
                <a href={currentUpdate.linkUrl} target="_blank" rel="noopener noreferrer">
                  Learn more <ExternalLink className="ml-2 h-4 w-4 opacity-90" />
                </a>
              </Button>
            )}

            {/* 2. SHARE BUTTON (Extreme Right using ml-auto) */}
            <div className="ml-auto">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsShareOpen(true)}
                className="h-10 w-10 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                title="Share update"
              >
                <Share className="h-5 w-5" />
              </Button>
            </div>
            
          </div>
          {/* ======================================================== */}

        </div>
      </DialogContent>
    </Dialog>

    {/* 3. RENDER SHARE MODAL */}
    <ShareModal 
      isOpen={isShareOpen}
      onClose={() => setIsShareOpen(false)}
      title={currentUpdate.title}
      shareUrl={shareUrl}
    />
    </>
  );
}