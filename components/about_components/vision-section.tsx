// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function VisionSection() {
  return (
    <div className="bg-gray-50 py-20 sm:py-10">
      <div className="container mx-auto max-w-5xl px-4 text-center space-y-12">
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          <TranslatableText text="Our vision is to be the universal symbol of trust" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left leading-relaxed text-gray-600 text-lg">
          <div className="space-y-4">
            <p>
              <TranslatableText text="Founded in 2024," /> <span className="font-semibold text-gray-900">help</span> <TranslatableText text="began with a simple yet powerful vision: to become the universal symbol of trust, connecting consumers and businesses through reviews." />
            </p>
            <p>
              <TranslatableText text="As an open, independent, and impartial service, our platform helps people make confident choices and businesses earn loyalty at every step." />
            </p>
          </div>
          <div className="space-y-4">
            <p>
              <TranslatableText text="Today, we have millions of active reviews and a growing user base worldwide. We're generating billions of brand impressions, and the numbers keep growing." />
            </p>
            <p>
              <TranslatableText text="With a team of dedicated professionals, we are committed to building a more trusted world where transparency drives success." />
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}