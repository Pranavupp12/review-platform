import { Sprout, TrendingUp, Medal, ArrowRight } from 'lucide-react';

export function TrustBuildingVisual() {
  const steps = [
    {
      icon: Sprout,
      title: "Equal Opportunity",
      desc: "Every business enters our ecosystem on equal footing. There are no paid head-starts or fast lanes. A reputation must be built from scratch, relying entirely on genuine customer experiences.",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: TrendingUp,
      title: "Gaining Momentum",
      desc: "As positive reviews come in, the score climbs. The 'stabilizer' weight decreases naturally as the volume of real voices increases.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Medal,
      title: "Established Trust",
      desc: "Once a company has many reviews, the score purely reflects their performance. Consistency is the key to earning a 5-star rating.",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ];

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4">
        
        {/* Header */}
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-6">
            How Trust is earned over time
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative flex flex-col items-center text-center group px-4"
            >
              {/* Icon Circle - Matching 'Our Values' Style */}
              <div className={`h-24 w-24 rounded-full ${step.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                <step.icon className={`h-10 w-10 ${step.color}`} strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-lg leading-relaxed">
                {step.desc}
              </p>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}