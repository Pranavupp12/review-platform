import { Star, MessageCircle, Building2, FileText } from 'lucide-react';

export function StatsSection() {
  const stats = [
    {
      icon: Star,
      value: "50+",
      label: "Active Categories",
      description: "From tech to travel, covering every industry."
    },
    {
      icon: MessageCircle,
      value: "1 Million+",
      label: "Total Reviews",
      description: "Authentic experiences shared by our community."
    },
    {
      icon: Building2,
      value: "20,000+",
      label: "Businesses",
      description: "Trust our platform to build their reputation."
    },
    {
      icon: FileText,
      value: "5,000+",
      label: "New Reviews",
      description: "Added to the platform every single day."
    }
  ];

  return (
    <div className="bg-[#0892A5] py-20 sm:py-15 border-t border-gray-100">
      <div className="container mx-auto max-w-6xl px-4">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center space-y-4 group"
            >
              {/* Icon Circle */}
              <div className="h-16 w-16 rounded-full bg-[#0892A5] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="h-8 w-8 text-white" strokeWidth={1.5} />
              </div>
              
              {/* Number */}
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {stat.value}
              </h3>
              
              {/* Label & Description */}
              <div className="space-y-1 max-w-[200px]">
                <p className="font-bold text-white text-lg">
                  {stat.label}
                </p>
                <p className="text-sm text-white leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}