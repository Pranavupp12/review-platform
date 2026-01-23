import { Rating } from '@/components/shared/rating'; 
// ✅ Import Translator
import { TranslatableText } from "@/components/shared/translatable-text";

export function RatingLogic() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto max-w-6xl px-4">
        
        {/* Main Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-6">
            <TranslatableText text="How Smart Scoring works." />
          </h2>
        </div>

        <div className="space-y-32">

          {/* --- ROW 1: THE STABILIZER --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Text Side */}
            <div className="order-1 lg:order-1 space-y-8">
              <div className="border-l-4 border-purple-600 pl-6">
                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">
                    <TranslatableText text="The 'Stabilizer' Effect" />
                </h3>
                <p className="text-purple-600 font-semibold tracking-wide uppercase text-sm">
                    <TranslatableText text="Trust Anchor Protocol" />
                </p>
              </div>
              
              <div className="space-y-6 text-md text-gray-600 leading-relaxed">
                <p>
                  <TranslatableText text="Every company on our platform starts with" /> <strong>7 <TranslatableText text="hypothetical 'neutral' signals" /></strong> <TranslatableText text="blended into their score. Think of this as a trust anchor." />
                </p>
                <p>
                  <TranslatableText text="Without this safeguard, a brand-new business could manipulate their way to the #1 spot with just a single 5-star review, unfairly outranking veterans with thousands of happy customers." />
                </p>
                <p>
                  <TranslatableText text="We intentionally pull the score toward a safe baseline until a business proves consistency over time. True trust is cumulative." />
                </p>
              </div>
            </div>

            {/* Visual Side (Redesigned Card) */}
            <div className="order-2 lg:order-2">
               {/* Card Container */}
               <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
                
                {/* Card Header */}
                <div className="bg-gray-100/50 p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-gray-900"><TranslatableText text="New Company Scenario" /></h4>
                        <p className="text-xs text-gray-500"><TranslatableText text="1 Review (5 Stars)" /></p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                </div>
                
                {/* Comparison Grid */}
                <div className="grid grid-cols-2 divide-x divide-gray-200">
                    
                    {/* Left: Standard */}
                    <div className="p-8 text-center space-y-4 opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <TranslatableText text="Standard Math" />
                        </p>
                        <div className="text-6xl font-black text-gray-300 tracking-tighter">
                            5.0
                        </div>
                        <p className="text-sm text-gray-400 font-medium">
                            <TranslatableText text="Too volatile" />
                        </p>
                    </div>

                    {/* Right: Smart Score */}
                    <div className="p-8 text-center space-y-4 bg-white">
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                            <TranslatableText text="Smart Score" />
                        </p>
                        <div className="text-6xl font-black text-purple-600 tracking-tighter">
                            3.7
                        </div>
                        <div className="flex justify-center">
                             <Rating value={3.7} size={16} />
                        </div>
                    </div>
                </div>
                
                {/* Insight Footer */}
                <div className="bg-purple-600 p-4 text-center">
                  <p className="text-white text-sm font-medium">
                    <span className="opacity-80"><TranslatableText text="Result" />: </span> 
                    <TranslatableText text="The score stays realistic (3.7) despite a perfect first review." />
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* --- ROW 2: STRICT VISUALS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Visual Side (Redesigned Card) */}
            <div className="order-2 lg:order-1">
               <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
                
                {/* Card Header */}
                <div className="bg-gray-100/50 p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-gray-900"><TranslatableText text="High Performer Scenario" /></h4>
                        <p className="text-xs text-gray-500"><TranslatableText text="4.8 Average Rating" /></p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-2 divide-x divide-gray-200">
                    
                    {/* Left: Standard */}
                    <div className="p-8 text-center space-y-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <TranslatableText text="Others Show" />
                        </p>
                        <div className="text-6xl font-black text-gray-300 tracking-tighter">
                            5.0
                        </div>
                        <div className="flex justify-center gap-1">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className="w-3 h-3 bg-gray-300 rounded-full" />
                            ))}
                        </div>
                    </div>

                    {/* Right: Strict Score */}
                    <div className="p-8 text-center space-y-4 bg-white">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                            <TranslatableText text="We Show" />
                        </p>
                        <div className="text-6xl font-black text-blue-600 tracking-tighter">
                            4.5
                        </div>
                        <div className="flex justify-center">
                             <Rating value={4.8} size={16} />
                        </div>
                    </div>
                </div>

                {/* Insight Footer */}
                <div className="bg-blue-600 p-4 text-center">
                  <p className="text-white text-sm font-medium">
                    <span className="opacity-80"><TranslatableText text="Result" />: </span>
                    <TranslatableText text="We round down visually. 5 stars is reserved for true perfection." />
                  </p>
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div className="order-1 lg:order-2 space-y-8">
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">
                    <TranslatableText text="Strict Visuals" />
                </h3>
                <p className="text-blue-600 font-semibold tracking-wide uppercase text-sm">
                    <TranslatableText text="No Grade Inflation" />
                </p>
              </div>

              <div className="space-y-6 text-md text-gray-600 leading-relaxed">
                <p>
                  <TranslatableText text="Most platforms round up. If a business has a 4.5 rating, they show 5 stars. We believe this is misleading." />
                </p>
                <p>
                  <TranslatableText text="We only display a full star if the rating is truly perfect. If a company has a" /> <strong>4.9 <TranslatableText text="rating" /></strong>, <TranslatableText text="we show" /> <strong>4.5 <TranslatableText text="stars" /></strong> <TranslatableText text="visually." /> 
                </p>
                <p>
                  <TranslatableText text="This keeps expectations realistic. A full 5-star visual rating on our platform is the gold standard of excellence—it means near-absolute perfection, not just 'pretty good'." />
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}