'use server';

import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function getSearchAnalytics(companyId: string) {
  
  // 1. Get stats for the last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30);

  // Fetch both Search Stats AND Interaction Stats in parallel
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

  // 2. Aggregate Data by "Query + Location + UserRegion"
  // ✅ UPDATED: Added adClicks to the Map type definition
  const queryMap = new Map<string, { 
      query: string, 
      location: string, 
      userRegion: string, 
      impressions: number, 
      clicks: number,
      adClicks: number // 👈 NEW FIELD
  }>();
  
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalAdClicks = 0; // 👈 NEW COUNTER

  stats.forEach(stat => {
    totalImpressions += stat.impressions;
    totalClicks += stat.clicks;
    // ✅ Safely handle potential nulls if schema wasn't migrated perfectly
    const adClicks = stat.adClicks || 0; 
    totalAdClicks += adClicks;

    const mapKey = `${stat.query}|${stat.location}|${stat.userRegion || 'unknown'}`;

    const existing = queryMap.get(mapKey) || { 
        query: stat.query, 
        location: stat.location,
        userRegion: stat.userRegion || 'unknown',
        impressions: 0, 
        clicks: 0,
        adClicks: 0 // 👈 Initialize
    };

    existing.impressions += stat.impressions;
    existing.clicks += stat.clicks;
    existing.adClicks += adClicks; // 👈 Aggregate
    
    queryMap.set(mapKey, existing);
  });

  // 3. Convert Map to Array & Sort by Clicks
  const topQueries = Array.from(queryMap.values())
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 20); 

  // 4. Calculate Stats
  const estimatedCost = totalClicks * 1.50; 
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0;

  // Calculate Total Leads and Calls
  const totalLeads = interactions.reduce((sum, i) => sum + i.leadsGenerated, 0);
  const totalCalls = interactions.reduce((sum, i) => sum + i.callsGenerated, 0);

  return {
    totals: {
      impressions: totalImpressions,
      clicks: totalClicks,
      adClicks: totalAdClicks, // 👈 ✅ Return Total Ad Clicks
      ctr: ctr,
      adSpend: estimatedCost.toFixed(2),
      leads: totalLeads,
      calls: totalCalls
    },
    topQueries // This now includes adClicks inside each object automatically
  };
}