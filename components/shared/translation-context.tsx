"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type TranslationContextType = {
  targetLang: string;
  setTargetLang: (lang: string) => void;
  isTranslating: boolean;
  setIsTranslating: (loading: boolean) => void;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [targetLang, setTargetLang] = useState("en"); // Default 'en' (Original)
  const [isTranslating, setIsTranslating] = useState(false);

  return (
    <TranslationContext.Provider value={{ targetLang, setTargetLang, isTranslating, setIsTranslating }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) throw new Error("useTranslation must be used within a TranslationProvider");
  return context;
}