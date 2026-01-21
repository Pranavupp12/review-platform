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
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "hi", name: "Hindi (हिंदी)" },
];

export function LanguageSelector() {
  const { targetLang, setTargetLang } = useTranslation();

  return (
    <div className="relative">
      <Select value={targetLang} onValueChange={setTargetLang}>
        <SelectTrigger 
            className="w-[180px] h-11 rounded-full bg-white text-[#0892A5] border-0 shadow-lg hover:bg-gray-50 transition-all font-semibold focus:ring-0 focus:ring-offset-0"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#0892A5]" />
            {/* Render value directly to ensure visibility */}
            <span className="truncate pt-0.5">
                <SelectValue placeholder="Language" />
            </span>
          </div>
        </SelectTrigger>
        
        <SelectContent align="end" className="bg-white border-gray-100 rounded-xl shadow-xl min-w-[180px]">
          {LANGUAGES.map((lang) => (
            <SelectItem 
                key={lang.code} 
                value={lang.code} 
                className="cursor-pointer py-2.5 focus:bg-[#0892A5]/10 focus:text-[#0892A5]"
            >
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}