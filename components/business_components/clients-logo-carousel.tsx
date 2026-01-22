"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { 
  Command, 
  Cpu, 
  Globe, 
  Layers, 
  Zap, 
  Activity, 
  Box, 
  Triangle 
} from "lucide-react";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

const companies = [
  { id: "1", name: "Acme Corp", icon: Box },
  { id: "2", name: "Nebula", icon: Globe },
  { id: "3", name: "Spherule", icon: Activity },
  { id: "4", name: "Command+R", icon: Command },
  { id: "5", name: "Layers.io", icon: Layers },
  { id: "6", name: "HyperBolt", icon: Zap },
  { id: "7", name: "Trio", icon: Triangle },
  { id: "8", name: "Chipset", icon: Cpu },
];

export function ClientLogosCarousel() {
  return (
    <section className="py-10 bg-[#0892A5] ">
      <div className="container mx-auto px-4 mb-8 text-center">
        <p className="text-sm font-semibold text-white uppercase tracking-widest">
          <TranslatableText text="Trusted by 100+ businesses worldwide" />
        </p>
      </div>
      
      <div className="relative w-full overflow-hidden">
        {/* Gradients to fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#0892A5] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#0892A5] to-transparent pointer-events-none" />

        <Carousel
          opts={{ loop: true, dragFree: true }}
          plugins={[
            AutoScroll({
              playOnInit: true,
              speed: 1, 
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-10">
            {companies.map((company) => (
              <CarouselItem
                key={company.id}
                className="pl-10 basis-1/3 sm:basis-1/4 md:basis-1/6"
              >
                <div className="flex items-center gap-2 text-white transition-colors duration-300 cursor-pointer group">
                  <company.icon className="h-8 w-8" strokeWidth={1.5} />
                  <span className="text-xl font-bold tracking-tight">
                    {/* Company names are usually kept as-is, but you can wrap if needed */}
                    <TranslatableText text={company.name}/>
                  </span>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}