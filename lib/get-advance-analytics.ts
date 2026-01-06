'use server';

import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function getSearchAnalytics(companyId: string) {
  
  // 1. Get stats for the last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30);

  // ✅ UPDATED: Fetch both Search Stats AND Interaction Stats in parallel
  const [stats, interactions] = await Promise.all([
    prisma.searchQueryStat.findMany({
      where: {
        companyId: companyId,
        date: { gte: thirtyDaysAgo }
      }
    }),
    prisma.companyAnalytics.findMany({
      where: {
        companyId: companyId,
        date: { gte: thirtyDaysAgo }
      },
      select: { leadsGenerated: true, callsGenerated: true }
    })
  ]);

  // 2. Aggregate Data by "Query + Location + UserRegion" (EXISTING LOGIC)
  const queryMap = new Map<string, { 
      query: string, 
      location: string, 
      userRegion: string, 
      impressions: number, 
      clicks: number 
  }>();
  
  let totalImpressions = 0;
  let totalClicks = 0;

  stats.forEach(stat => {
    totalImpressions += stat.impressions;
    totalClicks += stat.clicks;

    const mapKey = `${stat.query}|${stat.location}|${stat.userRegion || 'unknown'}`;

    const existing = queryMap.get(mapKey) || { 
        query: stat.query, 
        location: stat.location,
        userRegion: stat.userRegion || 'unknown',
        impressions: 0, 
        clicks: 0 
    };

    existing.impressions += stat.impressions;
    existing.clicks += stat.clicks;
    queryMap.set(mapKey, existing);
  });

  // 3. Convert Map to Array & Sort by Clicks (EXISTING LOGIC)
  const topQueries = Array.from(queryMap.values())
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 20); 

  // 4. Calculate Stats (EXISTING LOGIC)
  const estimatedCost = totalClicks * 1.50; 
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0;

  // ✅ NEW: Calculate Total Leads and Calls
  const totalLeads = interactions.reduce((sum, i) => sum + i.leadsGenerated, 0);
  const totalCalls = interactions.reduce((sum, i) => sum + i.callsGenerated, 0);

  return {
    totals: {
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: ctr,
      adSpend: estimatedCost.toFixed(2),
      // ✅ Return new stats
      leads: totalLeads,
      calls: totalCalls
    },
    topQueries 
  };
}