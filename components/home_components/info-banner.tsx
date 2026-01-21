import Link from 'next/link';
import { Button } from '@/components/ui/button'; 
import Image from 'next/image';
// ✅ Import the Translator Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function InfoBanner() {
  return (
    <section>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="bg-[#0ABED6] rounded-2xl shadow-xl overflow-hidden md:grid md:grid-cols-2 lg:grid-cols-3">
          
          {/* Left Column: Main Message */}
          <div className="p-8 md:p-10  col-span-1 md:col-span-1 lg:col-span-2 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              <TranslatableText text="At Help" />
            </h2>
            <div className="text-lg text-white mb-6">
              <TranslatableText 
                text="We're a review platform that's open to everyone. Our vision is to become the universal symbol of trust by empowering people to shop with confidence, and helping companies improve." 
              />
            </div>
            <Link href="/about">
              <Button className="w-[130px] px-6 py-3 bg-white text-[#0ABED6] hover:bg-accent hover:text-white transition-colors duration-200 rounded-full">
                <TranslatableText text="What we do" />
              </Button>
            </Link>
          </div>

          <div className="relative min-h-[300px] md:min-h-full col-span-1 flex items-center justify-center"> 
            <div className="relative w-full h-64 md:h-full m-5">
              <Image 
                src="/images/teamwork.svg" 
                alt="Banner Illustration"
                fill 
                className="object-contain" 
                priority 
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}