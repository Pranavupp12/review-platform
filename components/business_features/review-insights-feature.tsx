
 import Image from "next/image"; 

export function ReviewInsightsFeature() {
  return (
    <section className="py-20 bg-gray-50"> {/* Slightly off-white background */}
      <div className="container mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* Left Column: Image Placeholder (Charts/Graphs) */}
        <div className="relative h-[500px] w-full flex items-center justify-center order-2 lg:order-1">
              
              {/* Main Image Placeholder */}
              <div className="relative h-full w-full overflow-hidden flex items-center justify-center">
                    <Image
                      src="/images/features-banner4.png" 
                      alt="Review Insights Dashboard"
                      fill
                      className="object-cover"
                    />
              </div>
        </div>

        {/* Right Column: Text Content */}
        <div className="space-y-8 order-1 lg:order-2 max-w-3xl text-center lg:text-left">
          <div className="space-y-4">
            <span className="text-[#0892A5] font-bold tracking-wide uppercase text-sm">
              Review Insights
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight tracking-tight">
              Make data-driven decisions
            </h2>
          </div>
          
          <div className="space-y-6 text-lg text-gray-600 font-medium leading-relaxed mx-auto lg:mx-0">
            <p>
              Dynamic and practical insights delivered by artificial intelligence. Uncover big picture trends within your reviews.
            </p>
            <p>
              Start doing more of what's working, and less of what's not. Turn customer feedback into your roadmap for growth.
            </p>
          </div>
        
        </div>

      </div>
    </section>
  );
}