import Image from 'next/image';
import { BlockRating } from '@/components/shared/block-rating';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import {Button} from "@/components/ui/button";
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

type CompanyHeaderProps = {
  id: string;
  name: string;
  slug:string;
  claimed: boolean;
  logoImage: string | null;
  websiteUrl: string | null;
  address: string | null;
  rating: number;
  reviewCount: number;
  categoryName: string;
  categorySlug: string;
  isLoggedIn: boolean;
};

export function CompanyHeader({
  id,
  name,
  slug,
  logoImage,
  claimed,
  websiteUrl,
  address,
  rating,
  reviewCount,
  categoryName,
  categorySlug,
  isLoggedIn,
}: CompanyHeaderProps) {
  const displayWebsite = websiteUrl?.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '');

  // Breadcrumbs usually take simple strings for labels, but if the Breadcrumb component supports it,
  // we could update it. For now, assuming it takes strings, we might leave breadcrumbs as is 
  // or handle translation inside the Breadcrumb component itself.
  const breadcrumbItems = [
    { label: "Categories", href: "/categories" },
    { label: categoryName, href: `/categories/${categorySlug}` },
    { label: name, href: "#", current: true },
  ];

  const writeReviewUrl = isLoggedIn 
    ? `/write-review/${slug}` 
    : `/login?callbackUrl=/company/${slug}`;

  return (
    <div className="bg-white border-b border-gray-200 pt-8 pb-12">
      <div className="container mx-auto max-w-6xl px-4">
        
        {/* Breadcrumbs */}
        <div className="mb-6">
           <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Big Logo Box */}
          <div className="w-24 h-14 md:w-32 md:h-24 shrink-0 border-none overflow-hidden bg-white flex items-center justify-center ">
            {logoImage ? (
              <div className="relative w-full h-full ">
                <Image 
                  src={logoImage || ''} 
                  alt={name} 
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-300 uppercase">{name.substring(0, 2)}</span>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0892A5] tracking-tight">
              <TranslatableText text={name}/>
            </h1>
            
            {/* Rating Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <BlockRating value={rating} size="md" />
              </div>
              <span className="text-lg font-bold text-gray-900">{rating.toFixed(1)}</span>
              <span className="text-gray-500">| {reviewCount} <TranslatableText text="reviews" /></span>
              
              {/* Trust Badge:Only show if claimed */}
              {claimed && (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full ml-2 cursor-help">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <TranslatableText text="Verified Company" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px] bg-gray-900 text-white border-gray-800">
                      <p className="text-xs leading-relaxed">
                        <TranslatableText text="This company has claimed their Help profile as their own. Any company can claim theirs for free to reply to reviews, ask customers to review them, and more." />
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* Action Column (Write Review) */}
          <Link href={writeReviewUrl}>
             <Button className="w-full md:w-auto bg-[#0ABED6] hover:bg-[#0ABED6]/80 text-white font-bold h-12 px-8 text-base shadow-sm rounded-full">
               <TranslatableText text="Write a Review" />
             </Button>
          </Link>

        </div>
      </div>
    </div>
  );
}