import { Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Rating } from '@/components/shared/rating';
// ✅ Import Translator
import { TranslatableText } from "@/components/shared/translatable-text";

export function HelpTestimonials() {
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Small Business Owner",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
      content: "As a new business owner, I was terrified of unfair reviews ruining my reputation. This platform's 'Smart Score' gave me a fighting chance. It feels genuinely fair.",
      rating: 5
    },
    {
      name: "David Chen",
      role: "Verified Reviewer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
      content: "I stopped using other sites because they kept hiding my negative feedback. Here, my voice actually counts. The transparency is refreshing.",
      rating: 5
    }
  ];

  return (
    <section className="pb-10 bg-white overflow-hidden">
      <div className="container mx-auto max-w-5xl px-4">
        
        {/* Header */}
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-4">
             <TranslatableText text="Listen to what our community has to say" />
          </h2>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-8 relative "
            >
              {/* Quote Icon */}
              <div className="absolute top-8 right-8 text-gray-200">
                <Quote className="w-10 h-10 fill-gray-200" />
              </div>

              {/* Stars */}
              <div className="mb-6">
                <Rating value={testimonial.rating} size={20} />
              </div>

              {/* Content */}
              <div className="text-lg text-gray-700 leading-relaxed mb-8 font-medium">
                "<TranslatableText text={testimonial.content} />"
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {/* Names are generally not translated, but you can wrap if needed */}
                    <TranslatableText text={testimonial.name} />
                  </h4>
                  <p className="text-sm text-gray-500">
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