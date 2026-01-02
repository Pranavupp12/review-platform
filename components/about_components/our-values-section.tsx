import { 
  HeartHandshake, 
  ShieldCheck, 
  Users, 
  Zap, 
  Award 
} from 'lucide-react';

export function OurValuesSection() {
  const values = [
    {
      icon: HeartHandshake,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      title: "The Customer Comes First",
      description: "We are deeply focused on solving challenges for both consumers and businesses, letting trust lead the way."
    },
    {
      icon: ShieldCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      title: "Uncompromising Integrity",
      description: "We uphold high ethical standards and choose the right path, regardless of difficulty."
    },
    {
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      title: "Embracing Humanity",
      description: "We support one another, foster connection, and champion diverse perspectives within our community."
    },
    {
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      title: "Decisive Action",
      description: "We turn ideas into reality through proactive effort and committed execution."
    },
    {
      icon: Award,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      title: "Collective Success",
      description: "We achieve more by working as a unified team, sharing our victories together."
    }
  ];

  // Split the values: First 3 for top row, remaining for bottom row
  const topRowValues = values.slice(0, 3);
  const bottomRowValues = values.slice(3);

  // Helper component for rendering a single value card
  const ValueCard = ({ value }: { value: any }) => (
    <div className="flex flex-col items-center text-center space-y-4 px-4 group">
      {/* Icon Circle */}
      <div className={`h-24 w-24 rounded-full ${value.bgColor} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
        <value.icon className={`h-10 w-10 ${value.color}`} strokeWidth={1.5} />
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900">
        {value.title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
        {value.description}
      </p>
    </div>
  );

  return (
    <div className="bg-gray-50 py-20 sm:py-10 ">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        
        {/* Section Header */}
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-6">
            The Principles That Guide Us
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Our goal to become the definitive standard of trust is bold. To realize this, we must embody openness and clarity in all our actions. We rely on these shared principles to direct our behavior.
          </p>
        </div>

        {/* --- LAYOUT GRID --- */}
        <div className="space-y-12">
          
          {/* Top Row: Exactly 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {topRowValues.map((value, index) => (
              <ValueCard key={index} value={value} />
            ))}
          </div>

          {/* Bottom Row: Flex Centered (To center the 2 items) */}
          <div className="flex flex-col md:flex-row justify-center gap-12">
            {bottomRowValues.map((value, index) => (
              // Add width constraint on desktop to match grid sizing roughly
              <div key={index} className="md:w-1/3"> 
                 <ValueCard value={value} />
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}