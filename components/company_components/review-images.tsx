// components/company_components/review-images.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle 
} from "@/components/ui/dialog";

export function ReviewImages({ images }: { images: string[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // FIX: Return null immediately if no images exist
  if (!images || images.length === 0) return null;

  return (
    <>
      {/* Thumbnails Row */}
      <div className="flex flex-wrap gap-2 mt-4 mb-4">
        {images.map((url, index) => (
          <div 
            key={index}
            onClick={() => setSelectedImage(url)} 
            className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 cursor-zoom-in hover:opacity-90 transition-opacity"
          >
            <Image 
              src={url} 
              alt={`Review attachment ${index + 1}`} 
              fill 
              className="object-cover" 
              sizes="64px"
            />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
           <DialogTitle className="sr-only">Review Image</DialogTitle>
           <div className="relative w-full h-[80vh]">
             {selectedImage && (
                <Image 
                  src={selectedImage} 
                  alt="Full size review image" 
                  fill 
                  className="object-contain" 
                />
             )}
           </div>
        </DialogContent>
      </Dialog>
    </>
  );
}