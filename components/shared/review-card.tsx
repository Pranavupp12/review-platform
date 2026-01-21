import Link from 'next/link';
import Image from 'next/image'; 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { BlockRating } from './block-rating';
// ✅ Import the Translator Component
import { TranslatableText } from "@/components/shared/translatable-text";

type ReviewCardProps = {
  userName: string;
  userInitials: string;
  userAvatarUrl?: string | null;
  rating: number;
  reviewText: string;
  companyLogoUrl: string | null;
  companyName: string;
  companyDomain: string;
  companySlug: string;
  dateOfExperience: Date;
  createdAt: Date;
  className?: string;
  textClassName?: string;
};


export function ReviewCard({
  userName,
  userInitials,
  userAvatarUrl,
  rating,
  reviewText,
  companyLogoUrl,
  companyName,
  companyDomain,
  companySlug,
  dateOfExperience,
  createdAt,
  className,
  textClassName,
}: ReviewCardProps) {
  
  const createdDate = createdAt ? new Date(createdAt) : new Date();
  const displayDate = format(createdDate, "MMM d, yyyy");

  const experienceDate = dateOfExperience ? new Date(dateOfExperience) : new Date();
  const displayExpDate = format(experienceDate, "MMM d, yyyy");

  return (
    <Link 
      href={`/company/${companySlug}`} 
      className={cn("block h-full w-full max-w-[350px] mx-auto", className)}
    >
      <Card className="h-full w-full rounded-md border-gray-200 flex flex-col transition-shadow overflow-hidden">
        
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-gray-100">
                <AvatarImage src={userAvatarUrl || ''} alt={userName} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-gray-800 text-sm line-clamp-1"><TranslatableText text={userName}/></span>
            </div>
            
            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
              {/* ✅ Translated Date */}
              <TranslatableText text={displayDate} />
            </span>
          </div>
          
          <div className="mt-2">
            <BlockRating value={rating} size="sm" />
          </div>
        </CardHeader>

        <CardContent className="pb-4 flex-1 flex flex-col">
          {/* ✅ Translated Review Text (Maintains line-clamp) */}
          <div className={cn("text-gray-700 text-sm mb-4 flex-1", textClassName || "line-clamp-3")}>
             <TranslatableText text={reviewText} />
          </div>
          
          <div>
             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                <TranslatableText text="Date of Experience" />: <TranslatableText text={displayExpDate} />
             </span>
          </div>
        </CardContent>

        <CardFooter className="pt-4 border-t bg-gray-50/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-8 w-8 bg-white border border-gray-200 rounded-md flex items-center justify-center shrink-0 overflow-hidden relative">
               {companyLogoUrl ? (
                 <Image 
                   src={companyLogoUrl} 
                   alt={companyName} 
                   fill
                   className="p-0.5 object-contain" 
                 />
               ) : (
                 <span className="text-xs font-bold">{companyName?.[0]}</span>
               )}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-800 text-sm truncate">
                  <TranslatableText text={companyName} />
              </div>
              <div className="text-xs text-muted-foreground truncate">{companyDomain}</div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}