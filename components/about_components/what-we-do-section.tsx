import Image from 'next/image';

export function WhatWeDoSection() {
  return (
    <div className="bg-gray-50 py-20 sm:py-10 border-t border-gray-100">
      <div className="container mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center gap-12">
        
        {/* Left Column (Image) */}
        <div className="flex-1 w-full relative aspect-[4/3] md:aspect-auto md:h-[500px] rounded-2xl overflow-hidden bg-gray-50">
           <Image
              src="/images/what-we-do-banner.svg" 
              alt="People sharing their experiences on our platform"
              fill
              className="object-cover"
            />
        </div>

        {/* Right Column (Text) */}
        <div className="flex-1 text-left space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            What We Do
          </h2>
          
          <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-900">
              We&apos;re here to help businesses and consumers.
            </p>
            <p>
              Anyone can leave a review for a company, as long as it&apos;s based on a genuine
              experience. And the reviews help millions of consumers find trusted
              companies, and make more informed and confident buying choices.
            </p>
            <p>
              The reviews also help businesses earn trust by helping them interact with
              consumers, understand customer feedback, and take proactive measures to
              improve their business.
            </p>
            <p>
              Our mission is to build trust between consumers and businesses by making
              our platform visible wherever people go.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}