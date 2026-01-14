'use server';

import { prisma } from "@/lib/prisma";

// 1. Fetch list of competitors (Prioritizing Sub-Category)
export async function getCompetitors(companyId: string) {
  // A. Get the current company's IDs first
  const currentCompany = await prisma.company.findUnique({
    where: { id: companyId },
    select: { categoryId: true, subCategoryId: true }
  });

  if (!currentCompany) return [];

  // B. Find competitors that match EITHER SubCategory OR Category
  const competitors = await prisma.company.findMany({
    where: {
      id: { not: companyId }, // Exclude self
      OR: [
        // Priority 1: Exact Sub-Category Match (e.g., "Cosmetic Dentists")
        { subCategoryId: currentCompany.subCategoryId },
        // Priority 2: Broad Category Match (e.g., "Health & Medical")
        { categoryId: currentCompany.categoryId }
      ]
    },
    select: { id: true, name: true },
    take: 20 // Limit to keep the dropdown manageable
  });

  return competitors;
}

// 2. Fetch Comparison Data (No changes needed here, your logic was good)
export async function getComparisonData(myCompanyId: string, competitorId: string) {
  // Helper to aggregate stats
  const getStats = async (id: string) => {
    const stats = await prisma.searchQueryStat.findMany({
      where: { companyId: id },
    });

    // Aggregate Totals
    const totalImpressions = stats.reduce((sum, s) => sum + s.impressions, 0);
    const totalClicks = stats.reduce((sum, s) => sum + s.clicks, 0);
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // Aggregate Top Queries
    const queryMap = new Map<string, number>();
    stats.forEach(s => {
      queryMap.set(s.query, (queryMap.get(s.query) || 0) + s.impressions);
    });
    const topQueries = Array.from(queryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([query, count]) => ({ query, count }));

    // Aggregate Top Locations
    const locMap = new Map<string, number>();
    stats.forEach(s => {
      // Use userRegion if available, else location
      let loc = s.userRegion && s.userRegion !== 'unknown' ? s.userRegion : s.location;
      loc = loc.toLowerCase().trim();
      locMap.set(loc, (locMap.get(loc) || 0) + s.impressions);
    });
    const topLocations = Array.from(locMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location, count]) => ({ 
          location: location.charAt(0).toUpperCase() + location.slice(1), 
          count 
      }));

    return { totalImpressions, totalClicks, ctr, topQueries, topLocations };
  };

  const [myData, theirData] = await Promise.all([
    getStats(myCompanyId),
    getStats(competitorId)
  ]);

  return { myData, theirData };
}