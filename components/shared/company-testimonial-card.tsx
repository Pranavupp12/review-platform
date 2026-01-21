"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BADGE_CONFIG } from "@/lib/badges";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BlockRating } from "./block-rating";
// ✅ Import the Translator Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface Testimonial {
  name: string;
  rating: number;
  quote: string;
  createdAt: Date;
  dateOfExperience: Date;
}

interface CompanyTestimonialCardProps {
  id: string;
  name: string;
  slug: string;
  logoImage?: string | null;
  websiteUrl?: string | null;
  rating: number;
  reviewCount: number;
  claimed: boolean; 
  badges: string[]; 
  testimonials: Testimonial[];
  className?: string;
}

export function CompanyTestimonialCard({
  id,
  slug,
  name,
  logoImage,
  rating,
  reviewCount,
  claimed, 
  badges,
  testimonials,
  className,
}: CompanyTestimonialCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const hasTestimonials = testimonials && testimonials.length > 0;
  const currentTestimonial = hasTestimonials ? testimonials[currentIndex] : null;

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if(hasTestimonials) setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if(hasTestimonials) setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  // Safe date formatting helper
  const formatDate = (date: Date) => {
    if (!isMounted) return ""; 
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const displayLimit = claimed ? 2 : 3;
  const remainingCount = Math.max(0, (badges?.length || 0) - displayLimit);

  return (
    <div
      className={cn(
        "group relative w-full h-full rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden",
        className
      )}
    >
      <div className="p-6 flex flex-col gap-6 h-full">
        
        {/* 1. Header: Logo, Name, Rating */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 rounded-lg border bg-gray-50">
              <AvatarImage src={logoImage || ""} alt={name} className="object-contain p-1" />
              <AvatarFallback className="rounded-lg font-bold text-lg bg-gray-100 text-gray-500">{name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/company/${slug}`} className="text-lg font-bold text-gray-900 hover:text-[#0ABED6] transition-colors">
                <TranslatableText text={name} />
              </Link>
              
              <div className="flex items-center gap-2 mt-1">
                 <div className="flex items-center gap-0.5">
                    <BlockRating value={rating} size="sm" />
                </div>
                <span className="font-bold text-gray-900">{rating.toFixed(1)}</span>
                <span className="text-xs text-gray-500">
                  ({reviewCount.toLocaleString()} <TranslatableText text="Reviews" />)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Badges Section */}
        <div className="min-h-[60px]">
          <div className="flex flex-wrap gap-2">
              
              {/* Verified Badge */}
              {claimed && (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border cursor-help select-none bg-emerald-50 text-emerald-600 border-emerald-200">
                        <ShieldCheck className="h-3 w-3" />
                        <TranslatableText text="Verified" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px] bg-gray-900 text-white border-gray-800 text-xs text-center">
                      <p><TranslatableText text="This company has verified their ownership." /></p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Dynamic Badges */}
              {badges && badges.length > 0 ? (
                <>
                  {badges.slice(0, displayLimit).map((badgeId) => {
                    const config = BADGE_CONFIG[badgeId];
                    if (!config) return null;
                    const Icon = config.icon;
                    
                    return (
                      <TooltipProvider key={badgeId} delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border cursor-help select-none",
                                config.bg, 
                                config.color.replace('text-', 'border-').replace('600', '200'),
                                config.color
                              )}
                            >
                              <Icon className="h-3 w-3" />
                              <TranslatableText text={config.label} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[200px] bg-gray-900 text-white border-gray-800 text-xs text-center">
                            <p><TranslatableText text={config.description} /></p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                  
                  {/* More Count */}
                  {remainingCount > 0 && (
                    <span className="text-xs text-gray-400 self-center">
                        +{remainingCount} <TranslatableText text="more" />
                    </span>
                  )}
                </>
              ) : (
                !claimed && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 italic">
                        <TranslatableText text="No badges awarded yet." />
                    </div>
                )
              )}
          </div>
        </div>

        {/* 3. Testimonial Slider */}
        {hasTestimonials ? (
          <div className="mt-auto rounded-lg bg-gray-50 p-4 relative min-h-[160px] flex flex-col justify-between border border-gray-100">
             <AnimatePresence mode="wait">
               <motion.div
                 key={currentIndex}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.2 }}
                 className="space-y-2 flex-1"
               >
                 {/* Header: Name + Date */}
                 <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm text-gray-900 line-clamp-1">
                      <TranslatableText text={currentTestimonial?.name}/>
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0">
                        {currentTestimonial?.createdAt ? (
                            <TranslatableText text={formatDate(currentTestimonial.createdAt)} />
                        ) : ''}
                    </span>
                 </div>
                 
                 {/* Stars Below Name */}
                 <div className="-mt-1 mb-2">
                 <BlockRating value={rating} size="sm" />
                 </div>

                 {/* Quote - Wrapper keeps line-clamp working */}
                 <blockquote className="text-xs text-gray-600 italic leading-relaxed line-clamp-3 mb-2">
                     "<TranslatableText text={currentTestimonial?.quote} />"
                 </blockquote>
               </motion.div>
             </AnimatePresence>

             {/* Footer: Exp Date + Nav Buttons */}
             <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-100/50">
               <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[10px] font-medium bg-white text-gray-500 border border-gray-200">
                  <TranslatableText text="Date of Experience" />: <TranslatableText text={currentTestimonial?.dateOfExperience ? formatDate(currentTestimonial.dateOfExperience) : 'N/A'} />
               </div>
               
               {testimonials.length > 1 && (
                 <div className="flex gap-1">
                   <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white hover:shadow-sm" onClick={handlePrev}>
                     <ChevronLeft className="h-3 w-3" />
                   </Button>
                   <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white hover:shadow-sm" onClick={handleNext}>
                     <ChevronRight className="h-3 w-3" />
                   </Button>
                 </div>
               )}
             </div>
          </div>
        ) : (
          <div className="mt-auto rounded-lg bg-gray-50 p-4 min-h-[140px] flex items-center justify-center border border-dashed border-gray-200">
             <p className="text-xs text-gray-400">
                <TranslatableText text="No reviews highlighted yet." />
             </p>
          </div>
        )}

      </div>
    </div>
  );
}