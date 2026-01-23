
// ✅ Import Translator
import { TranslatableText } from "@/components/shared/translatable-text";

export function ScoringHero() {
  return (
    <div className="bg-gray-100 py-30 text-center relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-60 left-110 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-48 h-24 bg-accent/40 rounded-full blur-3xl pointer-events-none" style={{ transform: 'rotate(-20deg)' }} />
      <div className="absolute hidden sm:block top-25 right-40 w-40 h-32 bg-accent/40 rounded-full blur-3xl pointer-events-none" style={{ transform: 'rotate(10deg)' }} />
      
      <div className="container mx-auto max-w-5xl px-4 relative z-10">
        <h1 className="text-4xl md:text-5xl text-black font-bold mb-6 tracking-tight">
          <TranslatableText text="A Fair Start for Everyone" />
        </h1>
        <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
          <TranslatableText text="Trust isn't built overnight. Our 'Smart Scoring' system is designed to level the playing field, ensuring that a single lucky review doesn't outweigh years of consistent service." />
        </p>
      </div>
    </div>
  );
}