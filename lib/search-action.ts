// lib/search-action.ts
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

function extractJsonArray(text: string): any[] {
  try {
    // 1. Try clean parse first
    return JSON.parse(text);
  } catch (e) {
    // 2. If that fails, find the first '[' and the last ']'
    // This ignores any "Note:" or markdown text before/after
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    
    if (start !== -1 && end !== -1) {
      const jsonString = text.substring(start, end + 1);
      try {
        return JSON.parse(jsonString);
      } catch (innerE) {
        return [];
      }
    }
    return [];
  }
}

function getSynonymContext(): string {
  const grouped: Record<string, string[]> = {};
  
  Object.entries(CATEGORY_SYNONYMS).forEach(([keyword, category]) => {
    // Capitalize category for consistency
    const catName = category.charAt(0).toUpperCase() + category.slice(1);
    if (!grouped[catName]) grouped[catName] = [];
    grouped[catName].push(keyword);
  });

  return Object.entries(grouped)
    .map(([cat, keywords]) => `- ${cat}: matches terms like "${keywords.join(", ")}"`)
    .join("\n");
}

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  generationConfig: { responseMimeType: "application/json" }, // Force JSON response
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const CATEGORIES_LIST =
  "Bank, Travel Insurance, Retail, Software, Health, Automotive, Real Estate, Education, Fitness, Pets, Legal, Construction, Entertainment, Hospitality";
const SUBCATEGORIES_LIST =
  "Personal Banking, Mortgage Lenders, Credit Unions, International Travel, Student Travel, Fashion, Electronics, Furniture, Jewelry, Productivity, Design Tools, Clinics, Dental Services, Car Dealers, Auto Repair, Gyms, Yoga Studios, Pet Food, Vet Services, Lawyers, Contractors, Plumbing, Hotels, Restaurants, Cafes";

// Map common words to your database Category Slugs or Names
const CATEGORY_SYNONYMS: Record<string, string> = {
  // Health
  clinic: "health",
  doctor: "health",
  hospital: "health",
  medical: "health",
  dental: "health",
  dentist: "health",

  // Restaurants & Hospitality
  food: "restaurants",
  eat: "restaurants",
  dining: "restaurants",
  cafe: "restaurants",
  bistro: "restaurants",
  hotel: "hospitality",
  motel: "hospitality",
  stay: "hospitality",
  resort: "hospitality",

  // Retail
  shop: "retail",
  buy: "retail",
  store: "retail",
  market: "retail",
  mall: "retail",

  // Fitness
  gym: "fitness",
  workout: "fitness",
  yoga: "fitness",
  trainer: "fitness",
  crossfit: "fitness",

  // Pets
  vet: "pets",
  dog: "pets",
  cat: "pets",
  grooming: "pets",
  animal: "pets",

  // Software
  app: "software",
  saas: "software",
  tech: "software",
  dev: "software",
  tool: "software",
  developer: "software",

  // Automotive
  car: "automotive",
  auto: "automotive",
  vehicle: "automotive",
  mechanic: "automotive",
  repair: "automotive",
  tire: "automotive",

  // Real Estate & Home
  house: "real-estate",
  home: "real-estate",
  apartment: "real-estate",
  realtor: "real-estate",
  property: "real-estate",
  contractor: "construction",
  builder: "construction",
  plumber: "construction", // Mapping trade to broader category if subcat missing
  electrician: "construction",

  // Education
  school: "education",
  class: "education",
  university: "education",
  college: "education",
  course: "education",
  tutor: "education",

  // Travel & Finance
  trip: "travel-insurance",
  flight: "travel-insurance",
  vacation: "travel-insurance",
  money: "bank",
  finance: "bank",
  loan: "bank",
  credit: "bank",

  // Legal
  lawyer: "legal",
  attorney: "legal",
  legal: "legal",
};

// This ensures the AI always knows about your latest database categories
async function getTaxonomyForAI() {
  try {
    const [categories, subCategories] = await Promise.all([
      prisma.category.findMany({ select: { name: true } }),
      prisma.subCategory.findMany({ select: { name: true } }),
    ]);

    return {
      categoriesList: categories.map((c) => c.name).join(", "),
      subCategoriesList: subCategories.map((s) => s.name).join(", "),
    };
  } catch (error) {
    console.error("Failed to fetch taxonomy:", error);
    // Fallback to basic lists if DB fails, to prevent crash
    return {
    CATEGORIES_LIST,SUBCATEGORIES_LIST
    };
  }
}

// --- 3. SMART SEARCH (Data Fetcher) ---
export async function smartSearch(
  userQuery: string,
  locationFilter?: string,
  userRegion?: string
) {
  if (!userQuery) return [];

  console.log(
    `🔍 Analyzing: "${userQuery}" | Loc: "${
      locationFilter || "Global"
    }" | Region: "${userRegion}"`
  );

  // Fetch dynamic lists
  const { categoriesList } = await getTaxonomyForAI();

  // Define Prompt
  const prompt = `
      Analyze the user's query: "${userQuery}".
      
      Extract search filters.
      Rules:
      - If query implies quality ("best", "top"), set sortBy="rating".
      - Ignore location words inside the text (like "in London") if strictly extracting keywords.
      - Map intent to one of these Categories: ${categoriesList}
      
      Return JSON:
      {
        "keyword": string | null,
        "category": string | null,
        "subCategoryKeyword": string | null,
        "extractedLocation": string | null,
        "sortBy": "rating" | "relevance"
      }
    `;

  let aiParams;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    aiParams = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (primaryError) {
    console.warn(
      "⚠️ SmartSearch: Gemini failed, switching to Groq:",
      primaryError
    );
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a JSON-only API. Output strict JSON.",
          },
          { role: "user", content: prompt },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0,
        response_format: { type: "json_object" },
      });
      const text = completion.choices[0]?.message?.content || "{}";
      aiParams = JSON.parse(text);
    } catch (fallbackError) {
      console.error("❌ SmartSearch: Both models failed.", fallbackError);
      aiParams = { keyword: userQuery, sortBy: "relevance" };
    }
  }

  // --- Build Database Query ---
  try {
    const whereClause: any = { AND: [] };

    // Location Logic
    const finalLocation =
      locationFilter && locationFilter !== "Global"
        ? locationFilter
        : aiParams?.extractedLocation;

    if (finalLocation) {
      whereClause.AND.push({
        OR: [
          { city: { contains: finalLocation, mode: "insensitive" } },
          { country: { contains: finalLocation, mode: "insensitive" } },
          { address: { contains: finalLocation, mode: "insensitive" } },
        ],
      });
    }

    // Keyword/Category Logic
    const textFilters: any = { OR: [] };

    if (aiParams?.keyword) {
      textFilters.OR.push({
        name: { contains: aiParams.keyword, mode: "insensitive" },
      });
      textFilters.OR.push({
        briefIntroduction: { contains: aiParams.keyword, mode: "insensitive" },
      });
    }
    if (aiParams?.category) {
      textFilters.OR.push({
        category: {
          name: { contains: aiParams.category, mode: "insensitive" },
        },
      });
    }
    if (aiParams?.subCategoryKeyword) {
      textFilters.OR.push({
        subCategory: {
          name: { contains: aiParams.subCategoryKeyword, mode: "insensitive" },
        },
      });
      textFilters.OR.push({
        keywords: { has: aiParams.subCategoryKeyword.toLowerCase() },
      });
    }

    if (textFilters.OR.length === 0) {
      textFilters.OR.push({
        name: { contains: userQuery, mode: "insensitive" },
      });
      textFilters.OR.push({ keywords: { has: userQuery.toLowerCase() } });
    }

    whereClause.AND.push(textFilters);

    // Execute Query
    const companies = await prisma.company.findMany({
      where: whereClause,
      include: { reviews: true },
      orderBy:
        aiParams?.sortBy === "rating"
          ? { reviews: { _count: "desc" } }
          : { name: "asc" },
    });

    // ✅ NEW: LOG IMPRESSIONS FOR FOUND COMPANIES
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Non-blocking logging
    (async () => {
      try {
        const statUpdates = companies.map((company) => {
          return prisma.searchQueryStat.upsert({
            where: {
              // ✅ FIXED: Updated unique key to match new schema
              companyId_query_location_userRegion_date: {
                companyId: company.id,
                query: userQuery.toLowerCase(),
                location: finalLocation || "Global",
                userRegion: userRegion || "unknown", // Must include this in the unique constraint check
                date: today,
              },
            },
            update: {
              impressions: { increment: 1 },
            },
            create: {
              companyId: company.id,
              query: userQuery.toLowerCase(),
              location: finalLocation || "Global",
              date: today,
              impressions: 1,
              clicks: 0,
              userRegion: userRegion || "unknown",
            },
          });
        });
        await prisma.$transaction(statUpdates);
      } catch (err) {
        console.error("Failed to log search stats:", err);
      }
    })();

    // Transform Data
    return companies.map((company) => {
      const totalRating = company.reviews.reduce(
        (acc, r) => acc + r.starRating,
        0
      );
      const avgRating =
        company.reviews.length > 0 ? totalRating / company.reviews.length : 0;
      return {
        id: company.id,
        slug: company.slug,
        name: company.name,
        logoImage: company.logoImage,
        websiteUrl: company.websiteUrl,
        address: company.address,
        city: company.city,
        country: company.country,
        claimed: company.claimed,
        rating: avgRating,
        reviewCount: company.reviews.length,
      };
    });
  } catch (dbError) {
    console.error("SmartSearch DB Error:", dbError);
    return [];
  }
}

// --- 4. IDENTIFY SEARCH INTENT (Traffic Controller) ---
interface IntentParams {
  query: string;
  location?: string;
  userRegion?: string;
}

export async function identifySearchIntent({
  query,
  location, // This is the value from the Dropdown
  userRegion,
}: IntentParams) {
  if (!query) return null;

  const lowerQuery = query.toLowerCase();

  // ✅ HELPER UPDATE: Accepts an AI-extracted location as a fallback
  const buildUrl = (baseUrl: string, sortBy?: string, aiExtractedLoc?: string | null) => {
    const urlParams = new URLSearchParams();
    
    // 1. Pass the original query (so the next page can highlight it/re-process if needed)
    if (query) urlParams.set("q", query);

    // 2. LOCATION LOGIC:
    // Priority 1: Explicit Dropdown Selection
    // Priority 2: AI Extracted Location from text (e.g., "in Delhi")
    // Priority 3: User Region (only passed as 'region', not 'loc')
    
    if (location && location !== "Global") {
        urlParams.set("loc", location);
    } else if (aiExtractedLoc) {
        urlParams.set("loc", aiExtractedLoc);
    }

    if (userRegion) urlParams.set("region", userRegion); 
    if (sortBy) urlParams.set("sort", sortBy);

    const queryString = urlParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  try {
    // 1. EXACT DB CHECKS (Company, SubCategory, Category)
    // Note: Exact matches often imply navigation, but we might miss location context here 
    // if we don't pass it. 
    
    const exactCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { name: { equals: query, mode: "insensitive" } },
          { slug: { equals: query.toLowerCase().trim() } },
        ],
      },
    });
    // For specific companies, we usually just go to the profile
    if (exactCompany) return `/company/${exactCompany.slug}`;

    // For Exact Categories/Subcategories, we still want to attach location if it exists in dropdown
    const exactSub = await prisma.subCategory.findFirst({
      where: { name: { equals: query, mode: "insensitive" } },
      include: { category: true },
    });
    if (exactSub)
      return buildUrl(`/categories/${exactSub.category.slug}/${exactSub.slug}`);

    const exactCategory = await prisma.category.findFirst({
      where: { name: { equals: query, mode: "insensitive" } },
    });
    if (exactCategory) return buildUrl(`/categories/${exactCategory.slug}`);

    // 2. HYBRID AI INTENT CHECK
    const { categoriesList, subCategoriesList } = await getTaxonomyForAI();

    const synonymContext = getSynonymContext();

    // ✅ PROMPT UPDATE: Asked to extract location
    const prompt = `
      Analyze search query: "${query}".
      
      Tasks:
      1. Determine navigation intent (Category, SubCategory, or Company).
      2. Extract Location if present.
      3. Determine sorting intent.

      Database Context:
      - Categories: ${categoriesList}
      - SubCategories: ${subCategoriesList}
      
      Synonym Mapping Rules (Use this to map specific terms to Categories):
      ${synonymContext}
      
      Rules:
      - If user queries a synonym (e.g. "Lawyer"), map it to the corresponding Category (e.g. "Legal").
      - If user implies quality ("best", "top"), set sortBy="rating_high".
      - If user implies recency ("new", "latest"), set sortBy="newest".
      
      Return Strict JSON:
      {
        "isNavigation": boolean,
        "targetCategory": string | null, 
        "targetSubCategory": string | null,
        "targetCompany": string | null,
        "extractedLocation": string | null, 
        "sortBy": "rating_high" | "rating_low" | "newest" | null
      }
    `;

    let intent;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      intent = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (primaryError) {
      console.warn("⚠️ Intent Check: Gemini failed, switching to Groq:", primaryError);
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are a JSON-only API. Output strict JSON." },
            { role: "user", content: prompt },
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0,
          response_format: { type: "json_object" },
        });
        const text = completion.choices[0]?.message?.content || "{}";
        intent = JSON.parse(text);
      } catch (fallbackError) {
        console.error("❌ Intent Check: Both models failed.", fallbackError);
        return null;
      }
    }

    // 3. Process AI Result
    if (intent?.isNavigation) {
      
      // A. Target Company
      if (intent.targetCompany) {
        const company = await prisma.company.findFirst({
          where: {
            name: { contains: intent.targetCompany, mode: "insensitive" },
          },
        });
        if (company) return `/company/${company.slug}`;
      }

      // B. Target SubCategory
      if (intent.targetSubCategory) {
        const sub = await prisma.subCategory.findFirst({
          where: {
            name: { contains: intent.targetSubCategory, mode: "insensitive" },
          },
          include: { category: true },
        });
        if (sub)
          return buildUrl(
            `/categories/${sub.category.slug}/${sub.slug}`,
            intent.sortBy,
            intent.extractedLocation // ✅ Pass extracted location
          );
      }

      // C. Target Category
      if (intent.targetCategory) {
        const cat = await prisma.category.findFirst({
          where: {
            name: { contains: intent.targetCategory, mode: "insensitive" },
          },
        });
        if (cat) 
          return buildUrl(
            `/categories/${cat.slug}`, 
            intent.sortBy,
            intent.extractedLocation // ✅ Pass extracted location
          );
      }
    }
    
    // 4. Fallback for "Search Only" intent (e.g. "Software companies in Delhi" but no specific match found via AI)
    // If the AI found a location but no specific category navigation, you might still want to return 
    // a general search URL with that location.
    if (!intent?.isNavigation && intent?.extractedLocation) {
         // This is optional: redirect to general search with the extracted location
         const urlParams = new URLSearchParams();
         urlParams.set("q", query);
         urlParams.set("loc", intent.extractedLocation);
         if (userRegion) urlParams.set("region", userRegion);
         return `/search?${urlParams.toString()}`;
    }

    return null;
  } catch (error) {
    console.error("Intent Error:", error);
    return null;
  }
}

// Define the type for better type safety
export type ReviewTopic = {
  topic: string;
  sentiment: "positive" | "negative" | "neutral";
  snippet: string; // ✅ NEW FIELD
};

export async function generateReviewKeywords(
  reviewText: string
): Promise<string[]> {
  // 1. Fail fast for short text
  if (!reviewText || reviewText.length < 10) return [];

  const prompt = `
      Perform Aspect-Based Sentiment Analysis (ABSA) on this review.
      
      Review: "${reviewText}"

      ### Task:
      Identify specific topics, assign a sentiment, and extract the exact text snippet that justifies the sentiment.

      ### Rules:
      1. **Standardize Topics:** Map keywords to these core categories:
         - "staff", "service", "waiter", "manager" -> "staff"
         - "price", "cost", "value", "expensive" -> "price"
         - "shipping", "delivery", "package" -> "shipping"
         - "quality", "product", "material" -> "product quality"
         - "technical", "app", "website", "glitch" -> "technical issues"
         - "cleanliness", "dirty", "hygiene" -> "cleanliness"
         - "communication", "updates", "email" -> "communication"

      2. **Sentiment Logic (Crucial):**
         - "positive": Praise, happiness, advantages.
         - "negative": Complaints, anger, bugs, issues.
         - "neutral": Constructive criticism (e.g., "good but..."), mixed feelings (e.g., "fast shipping but damaged box"), or factual statements (e.g., "average experience").
         
         **IMPORTANT:** Do NOT default mixed feedback to negative. Mark it as "neutral".

      3. **Snippet Extraction (Highlighter Logic):**
         - Do not extract just one word. Extract the **noun + the adjective/verb**.
         - Bad: "waiter" 
         - Good: "waiter was rude"
         - Bad: "price"
         - Good: "price is too high"
         - The snippet must be an exact substring from the review.

      4. **Output Format:** Return a JSON array of objects: [{"topic": "string", "sentiment": "string", "snippet": "string"}]
  `;

  let rawData: any[] = [];

  try {
    // 👉 ATTEMPT 1: Primary Model (Gemini)
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    rawData = extractJsonArray(text);

  } catch (primaryError) {
    console.warn("⚠️ Keyword Extraction: Gemini failed, switching to Groq:", primaryError);

    try {
      // 👉 ATTEMPT 2: Fallback Model (Groq)
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are a JSON-only API. Output a strict JSON array." },
          { role: "user", content: prompt },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0,
        // Llama usually handles arrays fine, but we ensure parsing below
      });

      const text = completion.choices[0]?.message?.content || "[]";
      // Clean potential markdown from Llama output as well
     
      rawData = extractJsonArray(text);

    } catch (fallbackError) {
      console.error("❌ Keyword Extraction: Both models failed.", fallbackError);
      return [];
    }
  }

  // 3. Validation
  if (!Array.isArray(rawData)) return [];

  // 4. Transform to "topic:sentiment:snippet" format for the DB
  const formattedKeywords: string[] = rawData
    .filter((item) => item.topic && item.sentiment && item.snippet)
    .map((item) => {
      const cleanSnippet = item.snippet.trim();
      const cleanTopic = item.topic.toLowerCase();
      const cleanSentiment = item.sentiment.toLowerCase();
      return `${cleanTopic}:${cleanSentiment}:${cleanSnippet}`;
    });

  // Deduplicate strings
  return Array.from(new Set(formattedKeywords));
}

//Generate Dashboard Insights ---
export async function generateCompanyInsight(
  reviews: any[],
  metrics?: {
    trustScore: number;
    nss: number;
    totalReviews: number;
    searchImpressions: number;
    ctr: number;
    adValue: string;
    adClicks: number;
  },
  topQueries?: any[]
) {
  // If no data at all, return null
  if ((!reviews || reviews.length === 0) && !metrics) return null;

  // 1. Prepare Data for Prompt
  const reviewsText = reviews
    .slice(0, 20)
    .map(
      (r) =>
        `[Date: ${r.createdAt.toISOString().split("T")[0]}, Rating: ${
          r.starRating
        }]: ${r.comment}`
    )
    .join("\n");

  // ✅ 2. Update metricsText to include Ad Clicks
  const metricsText = metrics
    ? `
    - TrustScore: ${metrics.trustScore.toFixed(1)}/5
    - Net Sentiment Score (NSS): ${metrics.nss}
    - Total Reviews: ${metrics.totalReviews}
    - Search Impressions: ${metrics.searchImpressions}
    - Click-Through Rate (CTR): ${metrics.ctr}%
    - Total Ad Clicks: ${metrics.adClicks} 
    - Est. Ad Value: $${metrics.adValue}
  `
    : "No metric data available.";

  // ✅ 3. Update queriesText to show breakdown
  const queriesText =
    topQueries && topQueries.length > 0
      ? topQueries
          .slice(0, 5)
          .map(
            (q: any) =>
              `${q.query} (${q.clicks} total clicks${
                q.adClicks > 0 ? `, ${q.adClicks} from ads` : ""
              })`
          )
          .join("\n    ")
      : "No search query data.";

  const prompt = `
    Act as a Senior Business Analyst. Analyze the following company performance data:

    ### KEY METRICS:
    ${metricsText}

    ### TOP SEARCH QUERIES (What people search to find us):
    ${queriesText}

    ### RECENT CUSTOMER REVIEWS:
    ${reviewsText}

    ----------------
    ### INSTRUCTIONS:
    1. **Executive Summary:** Write a 2-sentence high-level overview connecting the metrics (like TrustScore/Traffic) to the user feedback. Mention if sponsored ads are driving significant traffic.
    2. **Strategic Suggestions:** Provide 3 bullet points focused on GROWTH (SEO, PPC, Traffic) and REPUTATION management.
    3. **Sentiment Analysis:** (For the reviews only) Summarize the specific emotional drivers.
    4. **Sentiment Action Items:** Provide 2 specific operational fixes based purely on the complaints found in reviews.
    5. **Trend Analysis:** A 1-sentence explanation of the timing/trajectory of reviews.

    Return a JSON object with exactly these fields:
    {
      "summary": "...",
      "suggestions": ["...", "...", "..."],
      "trendAnalysis": "...",
      "sentimentAnalysis": "...",
      "sentimentActions": ["...", "..."]
    }
  `;

  try {
    // 👉 ATTEMPT 1: Primary Model (Gemini)
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (primaryError) {
    // 👉 ATTEMPT 2: Fallback Model (Groq)
    console.warn(
      "⚠️ Insights: Gemini failed, switching to Groq:",
      primaryError
    );

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a JSON-only API. Output strict JSON.",
          },
          { role: "user", content: prompt },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0,
        response_format: { type: "json_object" },
      });

      const text = completion.choices[0]?.message?.content || "{}";
      return JSON.parse(text);
    } catch (fallbackError) {
      console.error("❌ Insights: Both AI models failed.", fallbackError);
      return {
        summary: "AI Analysis currently unavailable.",
        suggestions: ["Check back later."],
        trendAnalysis: "Data unavailable.",
        sentimentAnalysis: "Data unavailable.",
        sentimentActions: [],
      };
    }
  }
}
