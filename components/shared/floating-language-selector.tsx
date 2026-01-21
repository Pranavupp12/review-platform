"use client";

import { useTranslation } from "@/components/shared/translation-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "Original (English)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "hi", name: "Hindi (हिंदी)" },
];

export function FloatingLanguageSelector() {
  const { targetLang, setTargetLang } = useTranslation();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] shadow-2xl rounded-full">
      <Select value={targetLang} onValueChange={setTargetLang}>
        <SelectTrigger className="w-auto h-12 rounded-full bg-[#000032] text-white border-2 border-[#0ABED6] px-4 gap-2 hover:bg-[#000050] transition-all">
          <Globe className="h-5 w-5 text-[#0ABED6] animate-pulse" />
          <span className="font-semibold hidden md:inline">Translate</span>
          {/* Only show value on larger screens to keep button small on mobile */}
          {/* <SelectValue /> */} 
        </SelectTrigger>
        <SelectContent align="end" side="top" className="mb-2">
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="cursor-pointer">
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}