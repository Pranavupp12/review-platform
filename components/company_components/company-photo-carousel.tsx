"use client";

import Image from "next/image";
import { ChevronRight, ChevronLeft, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// 1. HARDCODED STATIC IMAGES (Fallback)
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",

];

interface CompanyPhotoCarouselProps {
  images: string[];
}

export function CompanyPhotoCarousel({ images }: CompanyPhotoCarouselProps) {
  // State for single-image lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // State for full carousel modal
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // LOGIC: Use uploaded images if available, otherwise use hardcoded placeholders
  const hasUploadedImages = images && images.length > 0;
  const displayImages = hasUploadedImages ? images : PLACEHOLDER_IMAGES;

  // Open single image lightbox
  const openLightbox = (url: string) => {
    setSelectedImage(url);
    setIsLightboxOpen(true);
  };

  // Open full carousel modal
  const openCarousel = useCallback((index = 0) => {
    setCurrentCarouselIndex(index);
    setIsCarouselOpen(true);
  }, []);

  // Carousel Navigation
  const nextImage = useCallback(() => {
    setCurrentCarouselIndex((prev) => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  const prevImage = useCallback(() => {
    setCurrentCarouselIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  // Keyboard navigation for the carousel
  useEffect(() => {
    if (!isCarouselOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") setIsCarouselOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCarouselOpen, nextImage, prevImage]);

  if (displayImages.length === 0) return null;

  return (
    <>
      <div className="w-full border-b border-gray-100">

        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Photos 
          </h2>

          {/* UPDATED: Opens the carousel modal */}
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-gray-900 font-medium"
            onClick={() => openCarousel(0)}
          >
            See all {displayImages.length} photos <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Row of Images */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory">

          {displayImages.map((url, index) => (
            <div
              key={index}
              // Clicking an individual image opens the carousel at that index
              onClick={() => openCarousel(index)}
              className="relative h-52 w-80 shrink-0 cursor-pointer rounded-none overflow-hidden snap-start border border-gray-200 group"
            >
              <Image
                src={url}
                alt={`Company photo ${index + 1}`}
                fill
                className="object-contain"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}

          {/* UPDATED: "See All" Card also opens the carousel */}
          <div
            onClick={() => openCarousel(0)}
            className="relative h-52 w-40 shrink-0 flex flex-col items-center justify-center bg-gray-50 rounded-none border border-dashed border-gray-300 snap-start text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-sm font-medium">See all</span>
          </div>
        </div>
      </div>

      {/* ================= NEW CAROUSEL MODAL ================= */}
      <Dialog open={isCarouselOpen} onOpenChange={setIsCarouselOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-black/95 border-none flex items-center justify-center overflow-hidden focus:outline-none [&>button]:hidden">
          <DialogTitle className="sr-only">Photo Gallery</DialogTitle>

          <div className="absolute right-4 top-4 z-50">
            <button
              onClick={() => setIsCarouselOpen(false)}
              className="p-2 bg-black/50 rounded-full hover:bg-black/70 text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Carousel Content */}
          <div className="relative w-full h-full flex items-center justify-center">

            {/* Left Arrow */}
            {displayImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 z-40 p-3 bg-black/50 rounded-full hover:bg-black/70 text-white transition-all hover:scale-110"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}

            {/* Current Image */}
            <div className="relative w-full h-full p-4 md:p-12">
              <Image
                src={displayImages[currentCarouselIndex]}
                alt={`Gallery photo ${currentCarouselIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Right Arrow */}
            {displayImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 z-40 p-3 bg-black/50 rounded-full hover:bg-black/70 text-white transition-all hover:scale-110"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium">
              {currentCarouselIndex + 1} / {displayImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* ======================================================= */}

    </>
  );
}