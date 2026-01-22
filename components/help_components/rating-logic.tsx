import { ShieldCheck, Users } from 'lucide-react';
import { Rating } from '@/components/shared/rating'; 
// ✅ Import Translator
import { TranslatableText } from "@/components/shared/translatable-text";

export function RatingLogic() {
  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto max-w-6xl px-4">
        
        {/* Main Header */}
        <div className="mb-5 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-4">
            <TranslatableText text="How Smart Scoring works." />
          </h2>
        </div>

        <div className="space-y-20">

          {/* --- ROW 1: THE STABILIZER --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Side */}
            <div className="order-1 lg:order-1 space-y-8">
              <div className="w-16 h-16 bg-gray-50  flex items-center justify-center mb-4 text-purple-600 ">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                <TranslatableText text="The 'Stabilizer' Effect" />
              </h3>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
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

            {/* Visual Side */}
            <div className="order-2 lg:order-2">
               <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-purple-900/5 border border-purple-100/50 hover:shadow-2xl hover:shadow-purple-900/10 transition-all duration-500">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                  <span className="font-bold text-xl text-gray-900">
                    <TranslatableText text="New Company (1 Review)" />
                  </span>
                  <span className="text-sm font-bold px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full">
                    <TranslatableText text="1 x 5-Star" />
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                            <TranslatableText text="Standard Math" />
                        </p>
                        <div className="flex flex-col gap-1">
                            <span className="text-4xl font-extrabold text-gray-300">5.0</span>
                            {/* Fake 5 stars */}
                            <div className="flex gap-1 text-gray-300">
                                {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-4 bg-gray-200 rounded-full" />)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs text-purple-600 uppercase font-bold tracking-wider">
                            <TranslatableText text="Our Smart Score" />
                        </p>
                        <div className="flex flex-col gap-1">
                            <span className="text-4xl font-extrabold text-purple-600">3.7</span>
                            <Rating value={3.7} size={20} /> 
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 pt-6 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500">
                    <span className="font-bold text-purple-700"><TranslatableText text="Result" />:</span> <TranslatableText text="The score stays realistic (3.7) despite a perfect first review." />
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* --- ROW 2: STRICT VISUALS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Visual Side */}
            <div className="order-2 lg:order-1">
               <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-blue-900/5 border border-blue-100/50 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                  <span className="font-bold text-xl text-gray-900">
                    <TranslatableText text="Strong Company" />
                  </span>
                  <span className="text-sm font-bold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full">
                    <TranslatableText text="Avg 4.8" />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                            <TranslatableText text="Standard Math" />
                        </p>
                        <div className="flex flex-col gap-1">
                            <span className="text-4xl font-extrabold text-gray-300">4.8</span>
                            <div className="flex gap-1 text-gray-300">
                                {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-4 bg-gray-200 rounded-full" />)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs text-blue-600 uppercase font-bold tracking-wider">
                            <TranslatableText text="Our Strict Score" />
                        </p>
                        <div className="flex flex-col gap-1">
                            <span className="text-4xl font-extrabold text-blue-600">4.8</span>
                            <Rating value={4.8} size={20} /> 
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500">
                    <span className="font-bold text-blue-700"><TranslatableText text="Result" />:</span> <TranslatableText text="We show 4.5 stars visually. You must earn true perfection (4.95+)." />
                  </p>
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div className="order-1 lg:order-2 space-y-8">
              <div className="w-16 h-16 bg-gray-50 flex items-center justify-center mb-4 text-blue-600">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                    <TranslatableText text="Strict Visuals" />
              </h3>
              <div className="space-y-6 text-lg  text-gray-600 leading-relaxed">
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