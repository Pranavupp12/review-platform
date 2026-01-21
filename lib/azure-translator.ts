import axios from "axios";

const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT || "https://api.cognitive.microsofttranslator.com";
const key = process.env.AZURE_TRANSLATOR_KEY;
const region = process.env.AZURE_TRANSLATOR_REGION;

export async function fetchAzureTranslation(text: string, targetLang: string): Promise<string | null> {
  if (!key || !region) {
    console.error("❌ Azure Translator credentials missing.");
    return null;
  }

  try {
    const response = await axios.post(
      `${endpoint}/translate`,
      [{ Text: text }], // Azure expects array of objects
      {
        params: {
          "api-version": "3.0",
          to: targetLang,
        },
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Ocp-Apim-Subscription-Region": region,
          "Content-Type": "application/json",
        },
      }
    );

    // Azure structure: [{ translations: [{ text: "Hola", ... }] }]
    return response.data[0]?.translations[0]?.text || null;
  } catch (error) {
    console.error("❌ Azure Translation API Error:", error);
    return null;
  }
}