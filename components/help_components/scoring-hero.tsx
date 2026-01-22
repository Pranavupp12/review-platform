
// ✅ Import Translator
import { TranslatableText } from "@/components/shared/translatable-text";

export function ScoringHero() {
  return (
    <div className="bg-[#0892A5] py-20  text-center text-white relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-10 -mr-20 -mt-20 pointer-events-none" />
      
      <div className="container mx-auto max-w-5xl px-4 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          <TranslatableText text="A Fair Start for Everyone" />
        </h1>
        <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
          <TranslatableText text="Trust isn't built overnight. Our 'Smart Scoring' system is designed to level the playing field, ensuring that a single lucky review doesn't outweigh years of consistent service." />
        </p>
      </div>
    </div>
  );
}