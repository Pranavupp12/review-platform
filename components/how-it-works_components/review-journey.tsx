import { PenLine, ShieldCheck, Globe, MessageSquare,ArrowRight } from "lucide-react";

export function ReviewJourney() {
  const steps = [
    {
      icon: PenLine,
      title: "1. You share your story",
      description: "You have an experience—good or bad—and write a review. It's free and open to everyone.",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      icon: ShieldCheck,
      title: "2. We screen for integrity",
      description: "Our AI and fraud detection tools scan for fakes, spam, and harmful content before it settles.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Globe,
      title: "3. Your voice goes live",
      description: "Once posted, your review is visible to the world. We don't delay negative reviews.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: MessageSquare,
      title: "4. The company responds",
      description: "Businesses are encouraged to reply publicly to solve issues or say thanks.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    }
  ];

  return (
    <div className="py-20 sm:py-10 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center max-w-3xl mx-auto ">
          <h2 className="text-2xl md:text-3xl text-black font-bold">User Journey in a Nutshell</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          
          {/* REMOVED: The old connector line div */}

          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center group">
              
              {/* Icon Circle */}
              <div className={`w-24 h-24 rounded-full ${step.bgColor} flex items-center justify-center mb-6 transition-transform hover:scale-110 duration-300 relative z-10`}>
                <step.icon className={`h-10 w-10 ${step.color}`} />
              </div>
              
              {/* Text Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-md text-gray-600 leading-relaxed px-2">
                {step.description}
              </p>

              {/* --- THE ARROW CONNECTOR ( > ) --- */}
              {/* Only show if it's NOT the last item */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-6 text-[#0892A5] z-0">
                  <ArrowRight className="h-6 w-6" strokeWidth={3} />
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}