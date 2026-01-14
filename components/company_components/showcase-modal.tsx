"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, ChevronLeft, ChevronRight, Share, Package, ExternalLink, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils"; // Ensure you have this utility or use standard string interpolation

interface ShowcaseItem {
    id: string;
    name: string;
    description: string;
    images: string[];
    linkUrl?: string | null; // Added linkUrl support
    createdAt?: Date;
}

interface ShowcaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: ShowcaseItem[];
    initialStartIndex: number;
    companyName: string;
    companyLogo?: string | null;
    type: "PRODUCT" | "SERVICE";
}

export function ShowcaseModal({
    isOpen,
    onClose,
    items,
    initialStartIndex,
    companyName,
    companyLogo,
    type
}: ShowcaseModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialStartIndex);
    const [isShareOpen, setIsShareOpen] = useState(false);

    // Sync index when modal opens
    useEffect(() => {
        if (isOpen) setCurrentIndex(initialStartIndex);
    }, [isOpen, initialStartIndex]);

    if (!items || items.length === 0) return null;

    const currentItem = items[currentIndex];
    const hasNext = currentIndex < items.length - 1;
    const hasPrev = currentIndex > 0;
    const isProduct = type === 'PRODUCT';

    const displayImage = currentItem.images && currentItem.images.length > 0
        ? currentItem.images[0]
        : null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent 
                    className={cn(
                        "[&>button]:hidden p-0 overflow-hidden bg-white border-none rounded-xl flex flex-col md:flex-row gap-0",
                        // Product: Wide Modal (900px) | Service: Narrow Modal (600px)
                        isProduct ? "sm:max-w-[900px] w-[95vw] md:h-[550px]" : "sm:max-w-[600px] w-[95vw] max-h-[85vh]"
                    )}
                >

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

                    {/* ========================================================
                        LEFT SIDE: Image Section (ONLY FOR PRODUCTS)
                       ======================================================== */}
                    {isProduct && (
                        <div className="relative w-full md:w-[45%] h-64 md:h-full bg-gray-50 flex items-center justify-center overflow-hidden border-r border-gray-100 shrink-0">
                            {displayImage ? (
                                <Image
                                    src={displayImage}
                                    alt={currentItem.name}
                                    fill
                                    className="object-contain p-4"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-300">
                                    <Package className="h-20 w-20 mb-2" />
                                    <span className="text-sm font-medium">No Image Available</span>
                                </div>
                            )}

                            {/* Navigation Arrows (Only show for Products to browse images/items) */}
                            {items.length > 1 && (
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
                    )}

                    {/* ========================================================
                        RIGHT SIDE: Content Section
                       ======================================================== */}
                    <div className={cn(
                        "flex flex-col h-full overflow-y-auto bg-white p-6 md:p-8",
                        // If product, take remaining width. If service, take full width.
                        isProduct ? "w-full md:w-[55%]" : "w-full"
                    )}>

                        {/* Header (Logo + Company Name) */}
                        <div className="flex items-center gap-3 mb-5">
                            <Avatar className="h-12 w-30">
                                <AvatarImage src={companyLogo || ''} />
                                <AvatarFallback>
                                    {companyName ? companyName.charAt(0).toUpperCase() : "B"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">{companyName}</p>
                            </div>
                        </div>

                        {/* Title */}
                        <DialogTitle className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                            {currentItem.name}
                        </DialogTitle>

                        {/* Description */}
                        <div className="text-gray-700 text-base leading-relaxed whitespace-pre-line mb-6 flex-grow overflow-y-auto pr-2">
                            {currentItem.description}
                        </div>

                        {/* Footer Actions (ONLY FOR PRODUCTS) */}
                        {isProduct && (
                            <div className="mt-auto flex flex-wrap items-center w-full pt-4 border-t border-gray-100 gap-3">
                                
                                {/* Link Button */}
                                {currentItem.linkUrl ? (
                                    <Button asChild className="bg-[#0ABED6] hover:bg-[#09A8BD] text-white font-bold h-10 px-6 text-sm rounded-lg shadow-sm transition-all flex-1 md:flex-none">
                                        <a href={currentItem.linkUrl} target="_blank" rel="noopener noreferrer">
                                            View Product <ExternalLink className="ml-2 h-4 w-4 opacity-90" />
                                        </a>
                                    </Button>
                                ) : (
                                    " "
                                )}

                            </div>
                        )}

                        {/* For Service, we show nothing below description as requested */}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Share Modal would go here if needed */}
        </>
    );
}