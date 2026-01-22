import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function AboutHero() {
  return (
    <div className="bg-gray-50 py-20 sm:py-10">
      <div className="container mx-auto max-w-6xl px-4 flex flex-col-reverse md:flex-row items-center gap-12">
        
        {/* Left Column (Text) */}
        <div className="flex-1 text-left space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
            <TranslatableText text="help gives everybody a say" />
          </h1>
          <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
            <TranslatableText text="The world's largest independent customer feedback platform." />
          </p>
          {/* Buttons Container */}
          <div className="flex flex-col sm:flex-row gap-4">
            
            {/* 1. Primary Button */}
            <Link href="/how-help-works">
              <Button size="lg" className="w-full sm:w-auto bg-[#0ABED6] hover:bg-[#09A8BD] text-white font-semibold rounded-full px-8 h-14 text-base shadow-sm transition-all">
                <TranslatableText text="How help works" />
              </Button>
            </Link>

            {/* 2. Secondary Ghost Button (Explore) */}
            <Link href="/">
              <Button 
                variant="ghost" 
                size="lg" 
                className="w-full sm:w-auto text-[#0ABED6] hover:text-[#09A8BD] hover:bg-[#0ABED6]/10 font-semibold rounded-full px-8 h-14 text-base transition-all"
              >
                <TranslatableText text="Explore our platform" />
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
          </div>
        </div>

        {/* Right Column (Image) */}
        <div className="flex-1 w-full relative aspect-[4/3] md:aspect-auto md:h-[400px] rounded-2xl overflow-hidden bg-gray-50">
           <Image
              src="/images/about-banner.svg" 
              alt="People connecting through help"
              fill
              className="object-cover"
              priority
            />
        </div>

      </div>
    </div>
  );
}