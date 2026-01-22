"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, ChevronLeft, ChevronRight, Package, ExternalLink, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils"; 
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface ShowcaseItem {
    id: string;
    name: string;
    description: string;
    images: string[];
    linkUrl?: string | null; 
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
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialStartIndex);
            setImageIndex(0);
        }
    }, [isOpen, initialStartIndex]);

    useEffect(() => {
        setImageIndex(0);
    }, [currentIndex]);

    if (!items || items.length === 0) return null;

    const currentItem = items[currentIndex];
    const hasNextProduct = currentIndex < items.length - 1;
    const hasPrevProduct = currentIndex > 0;
    const isProduct = type === 'PRODUCT';

    const displayImage = currentItem.images && currentItem.images.length > 0
        ? currentItem.images[imageIndex]
        : null;

    const hasMultipleImages = currentItem.images && currentItem.images.length > 1;

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasMultipleImages && imageIndex < currentItem.images.length - 1) {
            setImageIndex(prev => prev + 1);
        } else {
            setImageIndex(0);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasMultipleImages && imageIndex > 0) {
            setImageIndex(prev => prev - 1);
        } else {
            setImageIndex(currentItem.images.length - 1);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent 
                className={cn(
                    "[&>button]:hidden p-0 overflow-hidden bg-white border-none rounded-xl flex flex-col md:flex-row gap-0",
                    isProduct ? "sm:max-w-[900px] w-[95vw] md:h-[550px]" : "sm:max-w-[600px] w-[95vw] max-h-[85vh]"
                )}
            >
                <div className="absolute right-4 top-4 z-50">
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors backdrop-blur-sm shadow-sm border border-gray-100"
                    >
                        <X className="h-5 w-5 text-gray-700" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>

                {isProduct && (
                    <div className="relative w-full md:w-[45%] h-64 md:h-full bg-gray-50 flex items-center justify-center overflow-hidden border-r border-gray-100 shrink-0 select-none">
                        {displayImage ? (
                            <div className="relative w-full h-full p-4 flex items-center justify-center">
                                <Image
                                    src={displayImage}
                                    alt={currentItem.name}
                                    fill
                                    className="object-contain p-4 transition-opacity duration-300"
                                />
                                {hasMultipleImages && (
                                    <>
                                        <button 
                                            onClick={prevImage}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/5 hover:bg-black/10 text-gray-600 transition-colors z-10"
                                            title="Previous Image"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>

                                        <button 
                                            onClick={nextImage}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/5 hover:bg-black/10 text-gray-600 transition-colors z-10"
                                            title="Next Image"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>

                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                                            {currentItem.images.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setImageIndex(idx)}
                                                    className={cn(
                                                        "h-2 w-2 rounded-full transition-all shadow-sm",
                                                        idx === imageIndex 
                                                            ? "bg-[#0ABED6] w-4" 
                                                            : "bg-gray-300 hover:bg-gray-400"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-300">
                                <Package className="h-20 w-20 mb-2" />
                                <span className="text-sm font-medium">
                                    {/* ✅ Translatable Empty State */}
                                    <TranslatableText text="No Image Available" />
                                </span>
                            </div>
                        )}

                        {items.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentIndex(currentIndex - 1)}
                                    disabled={!hasPrevProduct}
                                    className="absolute left-4 top-4 bg-white/80 text-gray-700 hover:bg-white shadow-sm rounded-full h-9 w-9 disabled:opacity-0 transition-all border border-gray-200 z-20"
                                    title="Previous Product"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentIndex(currentIndex + 1)}
                                    disabled={!hasNextProduct}
                                    className="absolute right-4 top-4 bg-white/80 text-gray-700 hover:bg-white shadow-sm rounded-full h-9 w-9 disabled:opacity-0 transition-all border border-gray-200 z-20"
                                    title="Next Product"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </>
                        )}
                    </div>
                )}

                <div className={cn(
                    "flex flex-col h-full overflow-y-auto bg-white p-6 md:p-8",
                    isProduct ? "w-full md:w-[55%]" : "w-full"
                )}>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5">
                        <Avatar className="h-12 w-27 border-none">
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
                        {/* ✅ Translatable Title */}
                        <TranslatableText text={currentItem.name} />
                    </DialogTitle>

                    {/* Description */}
                    <div className="text-gray-700 text-base leading-relaxed whitespace-pre-line mb-6 flex-grow overflow-y-auto pr-2">
                        {/* ✅ Translatable Content */}
                        <TranslatableText text={currentItem.description} />
                    </div>

                    {/* Footer Actions */}
                    {isProduct && (
                        <div className="mt-auto flex flex-wrap items-center w-full pt-4 border-t border-gray-100 gap-3">
                            {currentItem.linkUrl ? (
                                <Button asChild className="bg-[#0ABED6] hover:bg-[#09A8BD] text-white font-bold h-10 px-6 text-sm rounded-lg shadow-sm transition-all flex-1 md:flex-none">
                                    <a href={currentItem.linkUrl} target="_blank" rel="noopener noreferrer">
                                        {/* ✅ Translatable Button */}
                                        <TranslatableText text="View Product" /> <ExternalLink className="ml-2 h-4 w-4 opacity-90" />
                                    </a>
                                </Button>
                            ) : (
                                <Button className="bg-[#0ABED6] hover:bg-[#09A8BD] text-white font-bold h-10 px-6 text-sm rounded-lg shadow-sm transition-all flex-1 md:flex-none">
                                    <MessageCircle className="mr-2 h-4 w-4 opacity-90" />
                                    {/* ✅ Translatable Button */}
                                    <TranslatableText text="Inquire Now" />
                                </Button>
                            )}

                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}