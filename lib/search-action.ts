// lib/search-action.ts
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  generationConfig: { responseMimeType: "application/json" }, // Force JSON response
});

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY 
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
  developer:"software",

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
            prisma.subCategory.findMany({ select: { name: true } })
        ]);

        return {
            categoriesList: categories.map(c => c.name).join(", "),
            subCategoriesList: subCategories.map(s => s.name).join(", ")
        };
    } catch (error) {
        console.error("Failed to fetch taxonomy:", error);
        // Fallback to basic lists if DB fails, to prevent crash
        return {
            categoriesList: "Software, Health, Retail, Finance, Automotive, Education, Travel",
            subCategoriesList: "Web Dev, Dentists, Gyms, Restaurants"
        };
    }
}

// --- 3. SMART SEARCH (Data Fetcher) ---
export async function smartSearch(userQuery: string, locationFilter?: string, userRegion?: string) {
    if (!userQuery) return [];

    console.log(`🔍 Analyzing: "${userQuery}" | Loc: "${locationFilter || 'Global'}" | Region: "${userRegion}"`);

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
        console.warn("⚠️ SmartSearch: Gemini failed, switching to Groq:", primaryError);
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a JSON-only API. Output strict JSON." },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.1-8b-instant", 
                temperature: 0,
                response_format: { type: "json_object" }
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
        const finalLocation = (locationFilter && locationFilter !== 'Global') 
            ? locationFilter 
            : aiParams?.extractedLocation;

        if (finalLocation) {
            whereClause.AND.push({
                OR: [
                    { city: { contains: finalLocation, mode: 'insensitive' } },
                    { country: { contains: finalLocation, mode: 'insensitive' } },
                    { address: { contains: finalLocation, mode: 'insensitive' } }
                ]
            });
        }

        // Keyword/Category Logic
        const textFilters: any = { OR: [] };

        if (aiParams?.keyword) {
            textFilters.OR.push({ name: { contains: aiParams.keyword, mode: 'insensitive' } });
            textFilters.OR.push({ briefIntroduction: { contains: aiParams.keyword, mode: 'insensitive' } });
        }
        if (aiParams?.category) {
            textFilters.OR.push({ category: { name: { contains: aiParams.category, mode: 'insensitive' } } });
        }
        if (aiParams?.subCategoryKeyword) {
            textFilters.OR.push({ subCategory: { name: { contains: aiParams.subCategoryKeyword, mode: 'insensitive' } } });
            textFilters.OR.push({ keywords: { has: aiParams.subCategoryKeyword.toLowerCase() } });
        }

        if (textFilters.OR.length === 0) {
            textFilters.OR.push({ name: { contains: userQuery, mode: 'insensitive' } });
            textFilters.OR.push({ keywords: { has: userQuery.toLowerCase() } });
        }

        whereClause.AND.push(textFilters);

        // Execute Query
        const companies = await prisma.company.findMany({
            where: whereClause,
            include: { reviews: true },
            orderBy: aiParams?.sortBy === 'rating' ? { reviews: { _count: 'desc' } } : { name: 'asc' }
        });

        // ✅ NEW: LOG IMPRESSIONS FOR FOUND COMPANIES
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        // Non-blocking logging
        (async () => {
            try {
                const statUpdates = companies.map(company => {
                    return prisma.searchQueryStat.upsert({
                        where: {
                            // ✅ FIXED: Updated unique key to match new schema
                            companyId_query_location_userRegion_date: {
                                companyId: company.id,
                                query: userQuery.toLowerCase(),
                                location: finalLocation || "Global",
                                userRegion: userRegion || "unknown", // Must include this in the unique constraint check
                                date: today
                            }
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
                            userRegion: userRegion || "unknown" 
                        }
                    });
                });
                await prisma.$transaction(statUpdates);
            } catch (err) {
                console.error("Failed to log search stats:", err);
            }
        })();

        // Transform Data
        return companies.map((company) => {
            const totalRating = company.reviews.reduce((acc, r) => acc + r.starRating, 0);
            const avgRating = company.reviews.length > 0 ? totalRating / company.reviews.length : 0;
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

export async function identifySearchIntent({ query, location, userRegion }: IntentParams) {
  if (!query) return null;

  const lowerQuery = query.toLowerCase();

  // Helper to construct URLs consistently
  const buildUrl = (baseUrl: string, sortBy?: string) => {
    const urlParams = new URLSearchParams();
    if (query) urlParams.set("q", query);
    if (location && location !== "Global") urlParams.set("loc", location);
    if (userRegion) urlParams.set("region", userRegion); // Pass region to next page
    if (sortBy) urlParams.set("sort", sortBy);
    
    const queryString = urlParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  try {
    // 1. EXACT DB CHECKS
    const exactCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { name: { equals: query, mode: "insensitive" } },
          { slug: { equals: query.toLowerCase().trim() } },
        ],
      },
    });
    if (exactCompany) return `/company/${exactCompany.slug}`;

    const exactSub = await prisma.subCategory.findFirst({
      where: { name: { equals: query, mode: "insensitive" } },
      include: { category: true },
    });
    if (exactSub) return buildUrl(`/categories/${exactSub.category.slug}/${exactSub.slug}`);

    const exactCategory = await prisma.category.findFirst({
      where: { name: { equals: query, mode: "insensitive" } },
    });
    if (exactCategory) return buildUrl(`/categories/${exactCategory.slug}`);

    // 2. BROAD CATEGORY MATCH
    const allCategories = await prisma.category.findMany({
      select: { name: true, slug: true }
    });
    allCategories.sort((a, b) => b.name.length - a.name.length);

    const matchedCategory = allCategories.find(cat => 
      lowerQuery.includes(cat.name.toLowerCase())
    );

    if (matchedCategory) {
      const isBest = lowerQuery.includes("best") || lowerQuery.includes("top");
      const sortBy = isBest ? "rating_high" : undefined;
      return buildUrl(`/categories/${matchedCategory.slug}`, sortBy);
    }

    // 3. HYBRID AI INTENT CHECK
    const { categoriesList, subCategoriesList } = await getTaxonomyForAI();

    const prompt = `
      Analyze search query: "${query}".
      Determine navigation intent.
      
      Database Context:
      - Categories: ${categoriesList}
      - SubCategories: ${subCategoriesList}
      
      Rules:
      - If user implies quality ("best", "top"), set sortBy="rating_high".
      - If user implies recency ("new", "latest"), set sortBy="newest".
      
      Return JSON:
      {
        "isNavigation": boolean,
        "targetCategory": string | null, 
        "targetSubCategory": string | null,
        "targetCompany": string | null,
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
                    { role: "user", content: prompt }
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0,
                response_format: { type: "json_object" }
            });
            const text = completion.choices[0]?.message?.content || "{}";
            intent = JSON.parse(text);
        } catch (fallbackError) {
            console.error("❌ Intent Check: Both models failed.", fallbackError);
            return null;
        }
    }

    // 4. Process AI Result
    if (intent?.isNavigation) {
      if (intent.targetCompany) {
        const company = await prisma.company.findFirst({
          where: { name: { contains: intent.targetCompany, mode: "insensitive" } },
        });
        if (company) return `/company/${company.slug}`;
      }

      if (intent.targetSubCategory) {
        const sub = await prisma.subCategory.findFirst({
          where: { name: { contains: intent.targetSubCategory, mode: "insensitive" } },
          include: { category: true },
        });
        if (sub) return buildUrl(`/categories/${sub.category.slug}/${sub.slug}`, intent.sortBy);
      }

      if (intent.targetCategory) {
        const cat = await prisma.category.findFirst({
          where: { name: { contains: intent.targetCategory, mode: "insensitive" } },
        });
        if (cat) return buildUrl(`/categories/${cat.slug}`, intent.sortBy);
      }
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
  sentiment: 'positive' | 'negative' | 'neutral';
  snippet: string; // ✅ NEW FIELD
};

export async function generateReviewKeywords(reviewText: string): Promise<ReviewTopic[]> {
  if (!reviewText || reviewText.length < 10) return [];

  try {
    const prompt = `
      Perform Aspect-Based Sentiment Analysis (ABSA) on this review.
      Extract main TOPICS, assign a SENTIMENT, and identify the exact text SNIPPET.

      Review: "${reviewText}"

      ### Rules for Extraction:
      1. **Standardize Topics:** Map specific keywords to these core categories:
         - "waiter", "manager", "staff", "reception" -> "staff"
         - "support", "agent", "help desk", "service" -> "customer support"
         - "cost", "price", "expensive", "cheap", "value" -> "price"
         - "shipping", "delivery", "arrived late", "package" -> "shipping"
         - "quality", "broken", "flimsy", "durable" -> "product quality"
         - "app", "website", "ui", "login", "glitch" -> "technical performance"
         - "clean", "dirty", "hygiene", "messy" -> "cleanliness"
         - "refund", "money back", "chargeback" -> "refunds"
         - "communication", "emails", "updates", "ghosted" -> "communication"
      
      2. **Contextual Sentiment:** Determine sentiment (positive/negative/neutral) for *each specific topic* based on the text.
      
      3. **Snippet Extraction:** Extract the EXACT word or short phrase from the original text that refers to the topic.
         - Example Text: "The waiter was rude." -> Topic: "staff", Sentiment: "negative", Snippet: "waiter"
         - Example Text: "Too expensive." -> Topic: "price", Sentiment: "negative", Snippet: "expensive"

      4. **Mixed Sentiment:** If a topic has mixed feedback, mark as "negative".
      
      5. **Output Format:** Return ONLY a valid JSON array of objects.
         Example: [{"topic": "staff", "sentiment": "positive", "snippet": "waiter"}, {"topic": "price", "sentiment": "negative", "snippet": "price"}]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean up json markdown
    const jsonString = text.replace(/```json|```/g, "").trim();
    const rawData = JSON.parse(jsonString);

    // Validate and clean structure
    if (!Array.isArray(rawData)) return [];

    // Deduplicate by topic (taking the last occurrence if duplicates exist)
    const uniqueMap = new Map();
    rawData.forEach((item) => {
      if (item.topic && item.sentiment && item.snippet) {
        uniqueMap.set(item.topic.toLowerCase(), {
          topic: item.topic.toLowerCase(),
          sentiment: item.sentiment.toLowerCase(),
          snippet: item.snippet.toLowerCase() // ✅ Capture the snippet
        });
      }
    });

    return Array.from(uniqueMap.values());

  } catch (error) {
    console.error("AI Keyword Extraction Failed:", error);
    return [];
  }
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
  },
  topQueries?: any[]
) {
  // If no data at all, return null
  if ((!reviews || reviews.length === 0) && !metrics) return null;

  // 1. Prepare Data for Prompt
  const reviewsText = reviews
    .slice(0, 20)
    .map((r) =>
      `[Date: ${r.createdAt.toISOString().split("T")[0]}, Rating: ${r.starRating}]: ${r.comment}`
    )
    .join("\n");

  const metricsText = metrics ? `
    - TrustScore: ${metrics.trustScore.toFixed(1)}/5
    - Net Sentiment Score (NSS): ${metrics.nss}
    - Total Reviews: ${metrics.totalReviews}
    - Search Impressions: ${metrics.searchImpressions}
    - Click-Through Rate (CTR): ${metrics.ctr}%
    - Est. Ad Value: $${metrics.adValue}
  ` : "No metric data available.";

  const queriesText = topQueries && topQueries.length > 0 ? 
    topQueries.slice(0, 5).map((q: any) => `${q.query} (${q.clicks} clicks)`).join(", ") 
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
    1. **Executive Summary:** Write a 2-sentence high-level overview connecting the metrics (like TrustScore/Traffic) to the user feedback. Mention if search traffic aligns with reputation.
    2. **Strategic Suggestions:** Provide 3 bullet points focused on GROWTH (SEO, PPC, Traffic) and REPUTATION management.
    3. **Sentiment Analysis:** (For the reviews only) Summarize the specific emotional drivers (e.g., "Positive sentiment driven by staff, negative by wait times").
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
    console.warn("⚠️ Insights: Gemini failed, switching to Groq:", primaryError);
    
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a JSON-only API. Output strict JSON." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant", 
            temperature: 0, 
            response_format: { type: "json_object" }
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
            sentimentActions: []
        };
    }
  }
}