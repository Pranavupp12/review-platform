"use client";

import { useState } from "react"; 
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { CompanyType } from "@prisma/client";
import { ShowcaseModal } from "./showcase-modal";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface ShowcaseCarouselProps {
  items: any[];
  type: CompanyType | null; 
  companyName: string;       
  companyLogo?: string | null; 
}

export function ShowcaseCarousel({ items, type, companyName, companyLogo }: ShowcaseCarouselProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const safeType = type || "SERVICE";
  const isProduct = safeType === "PRODUCT";

  const handleItemClick = (index: number) => {
    setSelectedIndex(index);
    setModalOpen(true);
  };

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-black">
              {/* ✅ Translatable Header */}
              <TranslatableText text={isProduct ? "Our Products" : "Our Services"} />
          </h2>
        </div>

        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-4">
            {items.map((item, index) => (
              <CarouselItem key={item.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Card 
                    onClick={() => handleItemClick(index)}
                    className="h-full cursor-pointer flex flex-col group py-0"
                >
                  {item.images?.[0] && (
                      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                          <Image 
                             src={item.images[0]} 
                             alt={item.name} 
                             fill 
                             className="object-cover" 
                          />
                      </div>
                  )}
                  
                  <CardContent className=" flex flex-col flex-grow py-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#0892A5] transition-colors">
                        {/* ✅ Translatable Item Name */}
                        <TranslatableText text={item.name} />
                    </h3>
                    <div className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {/* ✅ Translatable Description */}
                      <TranslatableText text={item.description} />
                    </div>

                    <div className="mt-auto pt-2 text-[#0892A5] group-hover:text-[#0892A5] text-xs font-bold uppercase tracking-wide group-hover:underline">
                        {/* ✅ Translatable Link Text */}
                        <TranslatableText text="View Details" /> →
                    </div>

                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          {items.length > 2 && (
              <>
                  <CarouselPrevious className="left-[-10px] md:left-[-20px]" />
                  <CarouselNext className="right-[-10px] md:right-[-20px]" />
              </>
          )}
        </Carousel>
      </div>

      <ShowcaseModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        items={items}
        initialStartIndex={selectedIndex}
        companyName={companyName}
        companyLogo={companyLogo}
        type={isProduct ? "PRODUCT" : "SERVICE"}
      />
    </>
  );
}