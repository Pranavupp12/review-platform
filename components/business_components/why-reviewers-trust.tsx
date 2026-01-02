import { Lock, EyeOff, Megaphone } from 'lucide-react';

export function WhyReviewersTrustSection() {
  const reasons = [
    {
      icon: Megaphone,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      title: "Your Voice is Uncensored",
      description: "We believe in the complete picture. Companies cannot pay us to delete bad reviews or hide critical feedback. As long as it's honest, it stays."
    },
    {
      icon: EyeOff,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      title: "Privacy by Default",
      description: "You can share your experience without sharing your data. We protect your personal contact info from being sold or misused by businesses."
    },
    {
      icon: Lock,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      title: "Real Companies Only",
      description: "We strictly verify business profiles to ensure you are interacting with the real brand, not imposters or scams."
    }
  ];

  return (
    <div className="bg-gray-50 py-20 sm:py-10 ">
      <div className="container mx-auto max-w-6xl px-4 text-center">
        
        {/* Section Header */}
        <div className="mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-6">
            Why reviewers trust our platform
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Trust is a two-way street. We work hard to ensure that when you speak, the world listens—safely and freely.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center space-y-4 px-4 group"
            >
              {/* Icon Circle */}
              <div className={`h-24 w-24 rounded-full ${reason.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <reason.icon className={`h-10 w-10 ${reason.color}`} strokeWidth={1.5} />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900">
                {reason.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 leading-relaxed text-sm">
                {reason.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}