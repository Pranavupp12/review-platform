'use server';

import { prisma } from "@/lib/prisma";

// 1. Fetch list of competitors (Same Category)
export async function getCompetitors(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { 
      id: true, 
      category: { 
        select: { 
          companies: { 
            select: { id: true, name: true },
            where: { id: { not: companyId } } // Exclude self
          } 
        } 
      } 
    }
  });

  return company?.category?.companies || [];
}

// 2. Fetch Comparison Data
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
      const loc = s.userRegion && s.userRegion !== 'unknown' ? s.userRegion : s.location;
      locMap.set(loc, (locMap.get(loc) || 0) + s.impressions);
    });
    const topLocations = Array.from(locMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

    return { totalImpressions, totalClicks, ctr, topQueries, topLocations };
  };

  const [myData, theirData] = await Promise.all([
    getStats(myCompanyId),
    getStats(competitorId)
  ]);

  return { myData, theirData };
}