'use server';

import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function getSearchAnalytics(companyId: string) {
  
  // 1. Get stats for the last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30);

  const stats = await prisma.searchQueryStat.findMany({
    where: {
      companyId: companyId,
      date: { gte: thirtyDaysAgo }
    }
  });

  // 2. Aggregate Data by "Query + Location + UserRegion"
  // ✅ FIX: Added userRegion to the Map Key and the Value Type
  const queryMap = new Map<string, { 
      query: string, 
      location: string, 
      userRegion: string, // <-- Added this
      impressions: number, 
      clicks: number 
  }>();
  
  let totalImpressions = 0;
  let totalClicks = 0;

  stats.forEach(stat => {
    totalImpressions += stat.impressions;
    totalClicks += stat.clicks;

    // ✅ FIX: Include userRegion in the unique key
    // Otherwise, searches from "Delhi" and "New York" for the same query would merge.
    const mapKey = `${stat.query}|${stat.location}|${stat.userRegion || 'unknown'}`;

    const existing = queryMap.get(mapKey) || { 
        query: stat.query, 
        location: stat.location,
        userRegion: stat.userRegion || 'unknown', // <-- Capture it here
        impressions: 0, 
        clicks: 0 
    };

    existing.impressions += stat.impressions;
    existing.clicks += stat.clicks;
    queryMap.set(mapKey, existing);
  });

  // 3. Convert Map to Array & Sort by Clicks
  // You are currently limiting to 10. If you want to see more during testing, increase this number.
  const topQueries = Array.from(queryMap.values())
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 20); // Increased to 20 just in case

  // 4. Calculate Stats
  const estimatedCost = totalClicks * 1.50; 
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0;

  return {
    totals: {
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: ctr,
      adSpend: estimatedCost.toFixed(2)
    },
    topQueries 
  };
}