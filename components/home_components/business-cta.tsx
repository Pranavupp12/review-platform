
import Link from 'next/link';
import { Button } from '@/components/ui/button';
// ✅ Import the Translator Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function BusinessCTA() {
  return (
    <section > 
      <div className="container mx-auto max-w-7xl px-4">
        <div className="relative bg-[#0ABED6] rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          
          {/* Background pattern */}
          <div className="absolute inset-0 ">
            <div className="absolute w-20 h-19 bg-[#8AECF9] rounded-full -bottom-8 -left-8" />
            <div className="absolute w-36 h-36 bg-[#8AECF9] rounded-full -top-12 -right-12" />
            <div className="absolute w-18 h-18 bg-[#8AECF9] rounded-full bottom-4 right-1/4" />
          </div>

          <div className="relative z-10 text-center md:text-left max-w-lg">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              {/* ✅ Translatable Headline */}
              <TranslatableText text="Looking to grow your business?" />
            </h2>
            <p className="text-white text-base md:text-lg">
              {/* ✅ Translatable Description */}
              <TranslatableText text="Strengthen your reputation with reviews on Help." />
            </p>
          </div>

          <div className="relative z-10">
            <Link href="/business" passHref> 
              <Button className="w-full md:w-auto px-8 py-3 bg-white text-[#0ABED6] hover:bg-accent hover:text-white transition-colors duration-200 rounded-full font-semibold">
                {/* ✅ Translatable Button */}
                <TranslatableText text="Get started" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}