"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessUpdateModal, BusinessUpdateType } from "./business-update-modal";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface BusinessUpdatesCarouselProps {
  updates: BusinessUpdateType[];
  companyName: string;
  companyLogo?: string | null;
}

export function BusinessUpdatesCarousel({ updates, companyName, companyLogo }: BusinessUpdatesCarouselProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUpdateIndex, setSelectedUpdateIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!updates || updates.length === 0) return null;

  const handleCardClick = (index: number) => {
    setSelectedUpdateIndex(index);
    setIsModalOpen(true);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollAmount = direction === 'right' ? (containerWidth / 2) : -(containerWidth / 2);
      
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <div className="w-full py-6 mb-8 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {/* ✅ Translatable Header */}
            <TranslatableText text="Updates From This Business" />
          </h2>
          
          {updates.length > 2 && (
            <div className="hidden md:flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-gray-50 border-gray-200 hover:bg-white" onClick={() => scroll('left')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-gray-50 border-gray-200 hover:bg-white" onClick={() => scroll('right')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory"
        >
          {updates.map((update, index) => (
            <div 
              key={update.id}
              onClick={() => handleCardClick(index)}
              className="flex-none w-[90vw] md:w-[calc(50%-8px)] h-40 bg-white border border-gray-200 rounded-none overflow-hidden cursor-pointer transition-all duration-200 snap-start group flex flex-row"
            >
              <div className="relative w-28 md:w-32 h-full bg-gray-100 shrink-0">
                <Image 
                  src={update.imageUrl} 
                  alt={update.title}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 28vw, (max-width: 1200px) 32vw, 160px"
                />
              </div>
              
              {/* Content Section */}
              <div className="p-4 flex flex-col justify-between flex-grow min-w-0">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-sm md:text-base leading-snug group-hover:text-[#0892A5] transition-colors">
                    {/* ✅ Translatable Title */}
                    <TranslatableText text={update.title} />
                  </h3>
                  <div className="text-xs md:text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {/* ✅ Translatable Content */}
                    <TranslatableText text={update.content} />
                  </div>
                </div>
                
                <div className="pt-2">
                    <span className="text-xs font-semibold text-[#0892A5] group-hover:underline inline-flex items-center">
                      {/* ✅ Translatable Link Text */}
                      <TranslatableText text="Read more" /> <ChevronRight className="h-3 w-3 ml-0.5" />
                    </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BusinessUpdateModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        updates={updates}
        initialStartIndex={selectedUpdateIndex}
        companyName={companyName}
        companyLogo={companyLogo}
      />
    </>
  );
}