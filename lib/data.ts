// lib/data.ts
import { PrismaClient } from "@prisma/client";

function getOptimizedUrl(url: string | null, width: number = 800) {
  if (!url) return null;
  if (!url.includes("cloudinary")) return url; // Skip non-cloudinary images
  // If already optimized, return as is
  if (url.includes("f_auto") || url.includes("q_auto")) return url;

  // Inject transformation params after '/upload/'
  return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
}

// --- 1. Define Types ---
export type CompanyWithRating = {
  id: string;
  slug: string;
  name: string;
  logoImage: string | null;
  websiteUrl: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  claimed: boolean;
  rating: number;
  reviewCount: number;
  createdAt?: Date;
  dateOfExperience?: Date;
  badges?: string[];
};

export type CategoryPageData = {
  id: string;
  name: string;
  slug: string;
  subCategories: {
    id: string;
    name: string;
    slug: string;
  }[];
  companies: CompanyWithRating[];
  pagination: {
    totalItems: number;
    pageSize: number;
    currentPage: number;
  };
};

type FilterOptions = {
  rating?: string;
  city?: string;
  claimed?: string;
  country?: string;
  sort?: string;
};

const prisma = new PrismaClient();

function sortCompanies(companies: any[], sortKey: string) {
  return [...companies].sort((a, b) => {
    switch (sortKey) {
      case "newest":
        // Handle null dates safely (treat null as 0/oldest)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Descending (Newest first)
      case "rating_high":
        return b.rating - a.rating;
      case "rating_low":
        return a.rating - b.rating;
      case "reviews":
        return b.reviewCount - a.reviewCount;
      default: // 'relevant'
        // Fallback: Sort by Bayesian Rating if no pinning logic is applied
        return b.rating - a.rating;
    }
  });
}

// 1. Fetch Top Companies (Using Smart Score from DB)
export async function getTopRatedCompanies() {
  const MAX_DISPLAY = 6;

  // 1. Fetch Featured Companies First
  const featuredCompanies = await prisma.company.findMany({
    where: { featured: true },
    include: {
      reviews: {
        include: { user: true },
        orderBy: [{ starRating: "desc" }, { createdAt: "desc" }],
        take: 3,
      },
    },
    take: MAX_DISPLAY,
  });

  // Calculate slots remaining
  const slotsRemaining = MAX_DISPLAY - featuredCompanies.length;

  let fallbackCompanies: any[] = [];

  // 2. Fallback: Fetch highest rated from DB
  if (slotsRemaining > 0) {
    const featuredIds = featuredCompanies.map((c) => c.id);

    fallbackCompanies = await prisma.company.findMany({
      where: {
        id: { notIn: featuredIds },
        reviewCount: { gt: 0 }, // Optimization: Only companies with reviews
      },
      include: {
        reviews: {
          include: { user: true },
          orderBy: [{ starRating: "desc" }, { createdAt: "desc" }],
          take: 3,
        },
      },
    });
  }

  // 3. Helper to format data
  const formatCompanyData = (company: any) => {
    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      logoImage: getOptimizedUrl(company.logoImage, 200),
      rating: company.rating || 0, // <--- READS SMART SCORE
      reviewCount: company.reviewCount || 0, // <--- READS CACHED COUNT
      badges: company.badges || [],
      claimed: company.claimed,
      testimonials: company.reviews.map((r: any) => ({
        name: r.user.name || "Anonymous",
        rating: r.starRating,
        quote: r.comment || "Great experience!",
        createdAt: r.createdAt,
        dateOfExperience: r.dateOfExperience,
      })),
      isFeatured: company.featured,
    };
  };

  const featuredProcessed = featuredCompanies.map(formatCompanyData);
  const fallbackProcessed = fallbackCompanies.map(formatCompanyData);

  // Sort fallback list strictly by Smart Rating (Highest First)
  fallbackProcessed.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.reviewCount - a.reviewCount;
  });

  const finalResult = [...featuredProcessed, ...fallbackProcessed].slice(
    0,
    MAX_DISPLAY
  );

  return finalResult;
}

// 2. Fetch Recent Reviews
export async function getRecentReviews(limit = 8) {
  const reviews = await prisma.review.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      company: true,
    },
  });

  return reviews.map((review) => ({
    id: review.id,
    userName: review.user.name || "Anonymous",
    userInitials: review.user.name
      ? review.user.name.substring(0, 2).toUpperCase()
      : "NA",
    userAvatarUrl: getOptimizedUrl(review.user.image, 100),
    rating: review.starRating,
    reviewText: review.comment || "",
    createdAt: review.createdAt,
    dateOfExperience: review.dateOfExperience,
    companyName: review.company.name,
    companySlug: review.company.slug,
    companyDomain: review.company.websiteUrl || "",
    companyLogoUrl: getOptimizedUrl(review.company.logoImage, 100),
  }));
}

// 4. Fetch Companies for the "Write a Review" page
export async function getCompaniesForBrowsing() {
  const companies = await prisma.company.findMany({
    take: 12,
    // We don't need 'include: { reviews: true }' anymore! Much faster.
    orderBy: { name: "asc" },
  });

  return companies.map((company) => {
    // --- CHANGE 2: REMOVED CALCULATION ---
    return {
      id: company.id,
      name: company.name,
      logoImage: getOptimizedUrl(company.logoImage, 200),
      websiteUrl: company.websiteUrl,
      rating: company.rating || 0, // <--- READ DB
      reviewCount: company.reviewCount || 0, // <--- READ DB
    };
  });
}

// 5. Fetch All Categories
export async function getAllCategories() {
  const categories = await prisma.category.findMany({
    include: {
      subCategories: { orderBy: { name: "asc" } },
      _count: { select: { companies: true } },
    },
    orderBy: { name: "asc" },
  });
  return categories;
}

// 6. Fetch SubCategory Details
export async function getSubCategoryCompanies(
  subCategorySlug: string,
  filters?: any,
  page: number = 1
) {
  if (!subCategorySlug) return null;
  const PAGE_SIZE = 10;

  try {
    const companyWhereClause: any = {};
    if (filters?.claimed === "true") companyWhereClause.claimed = true;
    if (filters?.country && filters.country !== "all")
      companyWhereClause.country = filters.country;
    if (filters?.city) {
      companyWhereClause.OR = [
        { city: { contains: filters.city, mode: "insensitive" } },
        { isSponsored: true },
      ];
    }

    const subCategory = await prisma.subCategory.findFirst({
      where: { slug: subCategorySlug },
      include: {
        category: { include: { subCategories: { orderBy: { name: "asc" } } } },
        companies: {
          where: companyWhereClause,
          select: {
            id: true,
            slug: true,
            name: true,
            logoImage: true,
            websiteUrl: true,
            address: true,
            rating: true,
            reviewCount: true,
            badges: true,
            city: true,
            country: true,
            claimed: true,
            createdAt: true,
            isSponsored: true,
            sponsoredScope: true,
          },
        },
      },
    });

    if (!subCategory) return null;

    let allCompanies = subCategory.companies.map((c) => ({
      ...c,
      rating: c.rating || 0,
      reviewCount: c.reviewCount || 0,
      logoImage: getOptimizedUrl(c.logoImage, 200),
      badges: (Array.isArray(c.badges) ? [...c.badges] : []).filter(
        (b) => b !== "MOST_RELEVANT"
      ),
    }));

    const sponsored = [];
    let organic = []; // Changed to 'let'
    const searchCity = filters?.city?.toLowerCase() || "";

    for (const company of allCompanies) {
      if (company.isSponsored) {
        if (company.sponsoredScope === "GLOBAL") {
          sponsored.push(company);
        } else if (company.sponsoredScope === "LOCAL") {
          const companyCity = company.city?.toLowerCase() || "";
          if (searchCity && companyCity.includes(searchCity)) {
            sponsored.push(company);
          } else {
            organic.push(company);
          }
        } else {
          organic.push(company);
        }
      } else {
        if (searchCity && !company.city?.toLowerCase().includes(searchCity))
          continue;
        organic.push(company);
      }
    }

    // ✅ USE HELPER: Sort Lists
    const sortedSponsored = sortCompanies(sponsored, "relevant");
    organic = sortCompanies(organic, filters?.sort || "relevant");

    // Award Badge
    const isDefaultSort = !filters?.sort || filters.sort === "relevant";
    if (isDefaultSort) {
      for (let i = 0; i < organic.length; i++) {
        if (i < 5) organic[i].badges = ["MOST_RELEVANT", ...organic[i].badges];
      }
    }

    // Rating Filter
    if (filters?.rating && filters.rating !== "all") {
      const minRating = parseFloat(filters.rating);
      organic = organic.filter((c) => c.rating >= minRating);
    }

    // Pagination
    const totalItems = organic.length;
    const startIndex = (page - 1) * PAGE_SIZE;
    const paginatedOrganic = organic.slice(startIndex, startIndex + PAGE_SIZE);

    return {
      ...subCategory,
      featuredCompanies: sortedSponsored,
      companies: paginatedOrganic,
      pagination: { totalItems, pageSize: PAGE_SIZE, currentPage: page },
    };
  } catch (error) {
    console.error("Database Error:", error);
    return null;
  }
}

// 7. Fetch Category Companies
export async function getCategoryCompanies(
  categorySlug: string,
  filters?: any,
  page: number = 1
) {
  if (!categorySlug) return null;
  const PAGE_SIZE = 10;

  try {
    const companyWhereClause: any = {};
    if (filters?.claimed === "true") companyWhereClause.claimed = true;
    if (filters?.country && filters.country !== "all")
      companyWhereClause.country = filters.country;

    if (filters?.city) {
      companyWhereClause.OR = [
        { city: { contains: filters.city, mode: "insensitive" } },
        { isSponsored: true },
      ];
    }

    const category = await prisma.category.findFirst({
      where: { slug: categorySlug },
      include: {
        subCategories: { orderBy: { name: "asc" } },
        companies: {
          where: companyWhereClause,
          select: {
            id: true,
            slug: true,
            name: true,
            logoImage: true,
            websiteUrl: true,
            address: true,
            rating: true,
            reviewCount: true,
            badges: true,
            city: true,
            country: true,
            claimed: true,
            createdAt: true,
            isSponsored: true,
            sponsoredScope: true,
          },
        },
      },
    });

    if (!category) return null;

    let allCompanies = category.companies.map((c) => ({
      ...c,
      rating: c.rating || 0,
      reviewCount: c.reviewCount || 0,
      logoImage: getOptimizedUrl(c.logoImage, 200),
      badges: (Array.isArray(c.badges) ? [...c.badges] : []).filter(
        (b) => b !== "MOST_RELEVANT"
      ),
    }));

    const sponsored = [];
    let organic = []; // Changed to 'let' so we can re-assign sorted list
    const searchCity = filters?.city?.toLowerCase() || "";

    // Separate Sponsored vs Organic
    for (const company of allCompanies) {
      if (company.isSponsored) {
        if (company.sponsoredScope === "GLOBAL") {
          sponsored.push(company);
        } else if (company.sponsoredScope === "LOCAL") {
          const companyCity = company.city?.toLowerCase() || "";
          if (searchCity && companyCity.includes(searchCity)) {
            sponsored.push(company);
          } else {
            organic.push(company);
          }
        } else {
          organic.push(company);
        }
      } else {
        if (searchCity && !company.city?.toLowerCase().includes(searchCity)) {
          continue;
        }
        organic.push(company);
      }
    }

    // ✅ USE HELPER: Sort Sponsored (Always by Relevance/Rating)
    const sortedSponsored = sortCompanies(sponsored, "relevant");

    // ✅ USE HELPER: Sort Organic (Based on User Filter)
    organic = sortCompanies(organic, filters?.sort || "relevant");

    // Award Badges ONLY if sorting by "Relevant" (Default)
    const isDefaultSort = !filters?.sort || filters.sort === "relevant";
    if (isDefaultSort) {
      for (let i = 0; i < organic.length; i++) {
        if (i < 5) {
          organic[i].badges = ["MOST_RELEVANT", ...organic[i].badges];
        }
      }
    }

    // Apply Rating Filter
    if (filters?.rating && filters.rating !== "all") {
      const minRating = parseFloat(filters.rating);
      organic = organic.filter((c) => c.rating >= minRating);
      // We don't filter sponsored items by rating usually, but you can if you want:
      // sortedSponsored = sortedSponsored.filter(c => c.rating >= minRating);
    }

    // Pagination
    const totalItems = organic.length;
    const startIndex = (page - 1) * PAGE_SIZE;
    const paginatedOrganic = organic.slice(startIndex, startIndex + PAGE_SIZE);

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      subCategories: category.subCategories,
      featuredCompanies: sortedSponsored,
      companies: paginatedOrganic,
      pagination: { totalItems, pageSize: PAGE_SIZE, currentPage: page },
    };
  } catch (error) {
    console.error("Database Error:", error);
    return null;
  }
}

// 8. Fetch Single Company Profile by SLUG
// 8. Fetch Single Company Profile by SLUG
export async function getCompanyBySlug(
  companySlug: string,
  filterTag?: string,
  searchQuery?: string,
  sortBy?: string,
  ratingFilter?: string,
  page: number = 1
) {
  if (!companySlug) return null;

  const PAGE_SIZE = 10;

  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "rating_high") orderBy = { starRating: "desc" };
  else if (sortBy === "rating_low") orderBy = { starRating: "asc" };

  try {
    const company = await prisma.company.findFirst({
      where: { slug: companySlug },
      include: {
        category: true,
        subCategory: true,
        reviews: {
          include: {
            user: { include: { _count: { select: { reviews: true } } } },
            helpfulVotes: {
              include: { user: { select: { name: true } } },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: orderBy,
        },
        updates: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!company) return null;

    // --- 1. Keywords Calculation (Unchanged) ---
    const counts: Record<string, number> = {};
    company.reviews.forEach((r) => {
      r.keywords.forEach((k) => {
        const topic = k.split(":")[0].trim().toLowerCase();
        if (topic) {
          counts[topic] = (counts[topic] || 0) + 1;
        }
      });
    });

    const topKeywords = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key]) => key);

    // --- 2. Distribution Logic (Unchanged) ---
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    company.reviews.forEach((r) => {
      if (Number.isInteger(r.starRating)) {
        const star = r.starRating as keyof typeof distribution;
        if (distribution[star] !== undefined) {
          distribution[star]++;
        }
      }
    });

    // --- 3. Filtering Logic (Unchanged) ---
    let filteredReviews = company.reviews;

    if (filterTag) {
      const normalize = (s: string) => s.toLowerCase().trim();
      const searchTag = normalize(filterTag);
      filteredReviews = filteredReviews.filter((r) => {
        return r.keywords.some((k) => {
          const topic = k.split(":")[0]; 
          return normalize(topic) === searchTag;
        });
      });
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredReviews = filteredReviews.filter(
        (r) =>
          r.reviewTitle.toLowerCase().includes(lowerQuery) ||
          (r.comment && r.comment.toLowerCase().includes(lowerQuery))
      );
    }

    if (ratingFilter) {
      const targetRating = parseInt(ratingFilter);
      if (!isNaN(targetRating)) {
        filteredReviews = filteredReviews.filter(
          (r) => r.starRating === targetRating
        );
      }
    }

    // --- 4. Pagination (Unchanged) ---
    const totalFilteredCount = filteredReviews.length;
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

    return {
      ...company,
      rating: company.rating || 0,
      reviewCount: company.reviewCount || 0,
      logoImage: getOptimizedUrl(company.logoImage, 200),
      // ✅ FIX: Ensure these fields are never null/undefined for the frontend
      plan: company.plan || "FREE", 
      badges: company.badges || [], 
      distribution,
      topKeywords,

      pagination: {
        totalItems: totalFilteredCount,
        pageSize: PAGE_SIZE,
        currentPage: page,
      },

      reviews: paginatedReviews.map((r) => ({
        id: r.id,
        user: {
          id: r.user.id,
          name: r.user.name,
          image: getOptimizedUrl(r.user.image, 100) || "",
          country: r.user.country,
          totalReviews: r.user._count.reviews,
        },
        dateOfExperience: r.dateOfExperience,
        createdAt: r.createdAt,
        starRating: r.starRating,
        reviewTitle: r.reviewTitle,
        comment: r.comment,
        relatedImages: r.relatedImages.map((img) => getOptimizedUrl(img, 800)).filter((url): url is string => url !== null),
        ownerReply: r.ownerReply,
        ownerReplyDate: r.ownerReplyDate,
        // @ts-ignore
        helpfulVotes: r.helpfulVotes || [],
        keywords: r.keywords || [],
      })),
    };
  } catch (error) {
    console.error("Error fetching company:", error);
    return null;
  }
}

export async function getUserReviews(userId: string) {
  console.log("🔍 Fetching reviews for User ID:", userId);
  const reviews = await prisma.review.findMany({
    where: { userId: userId },
    include: { company: true },
    orderBy: { dateOfExperience: "desc" },
  });
  console.log(`✅ Found ${reviews.length} reviews for this user.`);
  return reviews;
}

export async function getUserHelpfulReviews(userId: string) {
  const votes = await prisma.helpfulVote.findMany({
    where: { userId },
    include: {
      review: {
        include: { company: true, user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return votes.map((vote) => vote.review);
}

export async function getHelpfulCountReceived(userId: string) {
  const reviews = await prisma.review.findMany({
    where: { userId },
    select: { _count: { select: { helpfulVotes: true } } },
  });
  return reviews.reduce(
    (total, review) => total + review._count.helpfulVotes,
    0
  );
}

export async function getUserTotalReads(userId: string) {
  const aggregate = await prisma.review.aggregate({
    where: { userId },
    _sum: { reads: true },
  });
  return aggregate._sum.reads || 0;
}

export async function getSimilarCompanies(
  categoryId: string,
  currentCompanyId: string
) {
  try {
    // Assuming you are using Prisma. Adjust 'prisma' import as needed.
    const similar = await prisma.company.findMany({
      where: {
        categoryId: categoryId,
        id: { not: currentCompanyId }, // Exclude the current company
        // Optional: specific logic like 'isPublished: true'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoImage: true,
        address: true,
        websiteUrl: true,
        // We need to calculate/fetch aggregate ratings manually if not stored on the model
        // If you store 'rating' and 'reviewCount' directly on Company model:
        rating: true,
        reviewCount: true,

        // If you need to calculate them from reviews relation:
        // reviews: { select: { starRating: true } }
      },
      take: 6, // Limit to 6 suggestions
      orderBy: {
        reviewCount: "desc", // Show most popular companies first
      },
    });

    return similar.map((c) => ({
      ...c,
      logoImage: getOptimizedUrl(c.logoImage, 200),
    }));
  } catch (error) {
    console.error("Failed to fetch similar companies:", error);
    return [];
  }
}
