"use server";

import { prisma } from "@/lib/prisma";
import { fetchAzureTranslation } from "@/lib/azure-translator";

export async function translateContent(text: string, targetLang: string = "en") {
  if (!text) return { translation: "" };

  try {
    // 1. CLEANUP
    // Trimming helps avoid cache misses on whitespace
    const cleanText = text.trim(); 

    // 2. CHECK CACHE (Database)
    // We try to find if we have already translated this exact text to this language
    const cached = await prisma.translationCache.findFirst({
      where: {
        originalText: cleanText,
        targetLang: targetLang,
      },
    });

    if (cached) {
      return { translation: cached.translatedText, fromCache: true };
    }

    // 3. CALL AZURE (API)
    const translatedText = await fetchAzureTranslation(cleanText, targetLang);

    if (!translatedText) {
      return { error: "Translation service unavailable." };
    }

    // 4. SAVE TO CACHE
    // Next time, this will be free
    await prisma.translationCache.create({
      data: {
        originalText: cleanText,
        targetLang: targetLang,
        translatedText: translatedText,
      },
    });

    return { translation: translatedText, fromCache: false };

  } catch (error) {
    console.error("Translation Action Failed:", error);
    return { error: "Failed to translate content." };
  }
}