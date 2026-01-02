// components/home_components/info-banner.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming you have this button
import Image from 'next/image';

export function InfoBanner() {
  return (
    <section>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="bg-[#0ABED6] rounded-2xl shadow-xl overflow-hidden md:grid md:grid-cols-2 lg:grid-cols-3">
          
          {/* Left Column: Main Message */}
          <div className="p-8 md:p-10  col-span-1 md:col-span-1 lg:col-span-2 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              At Help
            </h2>
            <p className="text-lg text-white mb-6">
              We're a review platform that's open to everyone. Our vision is to
              become the universal symbol of trust by empowering people
              to shop with confidence, and helping companies improve.
            </p>
            <Link href="/about">
              <Button className=" w-[130px] px-6 py-3 bg-white text-[#0ABED6] hover:bg-accent hover:text-white transition-colors duration-200 rounded-full">
                What we do
              </Button>
            </Link>
          </div>

          <div className="relative min-h-[300px] md:min-h-full col-span-1 flex items-center justify-center"> 
             {/* Note: I added a slightly darker bg color (#09A8BD) here to make it pop, 
                 you can remove 'bg-[#09A8BD]' if you want it all one color */}
            
            <div className="relative w-full h-64 md:h-full m-5">
              <Image 
                src="/images/teamwork.svg" // <--- REPLACE THIS with your filename
                alt="Banner Illustration"
                fill // This makes the image fill the container
                className="object-contain" // Ensures the SVG scales correctly without stretching
                priority // Loads this image immediately since it's above the fold
              />
            </div>
          </div>

         

        </div>
      </div>
    </section>
  );
}