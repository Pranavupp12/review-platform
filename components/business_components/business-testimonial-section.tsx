import { Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Rating } from '@/components/shared/rating';
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function BusinessTestimonialSection() {
  const testimonials = [
    {
      name: "Elena Rodriguez",
      role: "CMO at TechFlow",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      content: "Claiming our profile was the turning point for our digital presence. We saw a 40% increase in organic traffic within the first three months of actively collecting reviews.",
      rating: 5
    },
    {
      name: "Marcus Chen",
      role: "Founder of Urban Wear",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
      content: "The analytics tools helped us identify a critical issue in our shipping process. We fixed it, and our average rating jumped from 3.5 to 4.8 stars in just six weeks.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto max-w-5xl px-4">
        
        {/* Header */}
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-black tracking-tight mb-4">
             <TranslatableText text="Trusted by businesses like yours" />
          </h2>
          <p className="text-lg text-gray-600">
            <TranslatableText text="See how companies are using Help to build reputation and grow revenue." />
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-gray-50 p-8 relative "
            >
              {/* Quote Icon */}
              <div className="absolute top-8 right-8 text-gray-200">
                <Quote className="w-10 h-10 fill-gray-200 text-gray-200" />
              </div>

              {/* Stars */}
              <div className="mb-6">
                <Rating value={testimonial.rating} size={20} />
              </div>

              {/* Content */}
              <div className="text-lg text-gray-700 leading-relaxed mb-8 font-medium relative z-10">
                "<TranslatableText text={testimonial.content} />"
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 ">
                  <AvatarImage src={testimonial.image} alt={testimonial.name} className="object-cover" />
                  <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-gray-900">
                    <TranslatableText text={testimonial.name} />
                  </h4>
                  <p className="text-sm text-gray-500 font-medium">
                    <TranslatableText text={testimonial.role} />
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}