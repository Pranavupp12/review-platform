"use client";

import { useState, useEffect } from "react";
import { translateContent } from "@/lib/translation-action";
import { useTranslation } from "@/components/shared/translation-context";
import { Loader2 } from "lucide-react";

interface TranslatableTextProps {
  text: string | null | undefined;
  className?: string;
}

export function TranslatableText({ text, className }: TranslatableTextProps) {
  const { targetLang } = useTranslation();
  const [displayText, setDisplayText] = useState<string>(text || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. If text is empty, do nothing
    if (!text) return;

    // 2. If language is back to English (or original), show original text
    if (targetLang === "en") {
      setDisplayText(text);
      return;
    }

    // 3. Otherwise, fetch translation
    let isMounted = true;
    const fetchTranslation = async () => {
      setLoading(true);
      // Pass the selected target language (e.g., 'es', 'fr', 'hi')
      const res = await translateContent(text, targetLang);
      if (isMounted && res.translation) {
        setDisplayText(res.translation);
      }
      if (isMounted) setLoading(false);
    };

    fetchTranslation();

    return () => { isMounted = false; };
  }, [targetLang, text]);

  if (!text) return null;

  return (
    <span className={className}>
      {loading ? (
        <span className="inline-flex items-center gap-1 animate-pulse text-gray-400">
           Translating... <Loader2 className="h-3 w-3 animate-spin" />
        </span>
      ) : (
        displayText
      )}
    </span>
  );
}