import { Mail, MessageSquare, TrendingUp, BarChart2 } from 'lucide-react';
import Image from 'next/image'; 
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function BusinessSolutionsSection() {
  const solutions = [
    {
      title: "Invite your customers",
      description: "Build a representative profile by automatically inviting all your customers to leave a review.",
      icon: Mail
    },
    {
      title: "Engage with feedback",
      description: "Show the world you listen. Reply to reviews to solve problems and thank loyal customers.",
      icon: MessageSquare
    },
    {
      title: "Accelerate conversions",
      description: "Use customer testimonials as social proof at every stage of the purchasing journey.",
      icon: TrendingUp
    },
    {
      title: "Data-driven decisions",
      description: "Inform your strategy with deep insights and sentiment data to navigate to success.",
      icon: BarChart2
    }
  ];

  return (
    <section className="py-20 sm:py-10 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Image */}
        <div className="relative order-2 lg:order-1 h-[500px] w-full">
           <div className="relative h-full w-full overflow-hidden">
              <Image 
                src="/images/solutions-banner.png" 
                alt="Business Solutions Team"
                fill
                className="object-cover"
              />
              
              {/* Optional: Floating Badge Overlay */}
              <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100 max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-1000">
                 <p className="text-sm font-bold text-[#000032] mb-1">
                    <TranslatableText text="Boost Conversion" />
                 </p>
                 <p className="text-xs text-gray-600">
                    <TranslatableText text="Companies with reviews see up to 27% higher conversion rates." />
                 </p>
              </div>
           </div>
        </div>

        {/* Right: Content */}
        <div className="order-1 lg:order-2 space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#000032] tracking-tight">
            <TranslatableText text="Go further with Help solutions" />
          </h2>
          
          <ul className="space-y-6">
            {solutions.map((item, index) => (
              <li key={index} className="flex gap-4 items-start group">
                <div className="mt-1 p-2 rounded-lg shrink-0">
                   <item.icon className="w-7 h-7 text-[#0892A5]" />
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 text-lg">
                      <TranslatableText text={item.title} />
                   </h3>
                   <div className="text-gray-600 leading-relaxed mt-1">
                     <TranslatableText text={item.description} />
                   </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
}