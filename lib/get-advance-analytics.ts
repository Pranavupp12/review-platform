'use server';

import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function getSearchAnalytics(
  companyId: string, 
  page: number = 1, 
  limit: number = 5, 
  search: string = "",
  sortBy: string = "clicks" // ✅ NEW PARAMETER
) {
  
  const thirtyDaysAgo = subDays(new Date(), 30);

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

  const queryMap = new Map<string, { 
      query: string, 
      location: string, 
      userRegion: string, 
      impressions: number, 
      clicks: number,
      adClicks: number,
      ctr?: string 
  }>();
  
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalAdClicks = 0;

  stats.forEach(stat => {
    totalImpressions += stat.impressions;
    totalClicks += stat.clicks;
    const adClicks = stat.adClicks || 0; 
    totalAdClicks += adClicks;

    const mapKey = `${stat.query}|${stat.location}|${stat.userRegion || 'unknown'}`;

    const existing = queryMap.get(mapKey) || { 
        query: stat.query, 
        location: stat.location,
        userRegion: stat.userRegion || 'unknown',
        impressions: 0, 
        clicks: 0,
        adClicks: 0
    };

    existing.impressions += stat.impressions;
    existing.clicks += stat.clicks;
    existing.adClicks += adClicks;
    
    queryMap.set(mapKey, existing);
  });

  // --- FILTERING & PAGINATION ---

  let allQueries = Array.from(queryMap.values());

  // 1. Search Filter
  if (search) {
    const lowerSearch = search.toLowerCase();
    allQueries = allQueries.filter(q => 
        q.query.toLowerCase().includes(lowerSearch) || 
        q.location.toLowerCase().includes(lowerSearch)
    );
  }

  // 2. ✅ SORTING LOGIC
  allQueries.sort((a, b) => {
    switch (sortBy) {
        case 'impressions':
            return b.impressions - a.impressions;
        case 'ctr':
            // Calculate CTR on the fly for sorting
            const ctrA = a.impressions > 0 ? (a.clicks / a.impressions) : 0;
            const ctrB = b.impressions > 0 ? (b.clicks / b.impressions) : 0;
            return ctrB - ctrA;
        case 'adClicks':
            return b.adClicks - a.adClicks;
        case 'clicks':
        default:
            return b.clicks - a.clicks;
    }
  });

  // 3. Pagination
  const totalItems = allQueries.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const paginatedQueries = allQueries.slice(startIndex, startIndex + limit);

  const estimatedCost = totalClicks * 1.50; 
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0;
  const totalLeads = interactions.reduce((sum, i) => sum + i.leadsGenerated, 0);
  const totalCalls = interactions.reduce((sum, i) => sum + i.callsGenerated, 0);

  return {
    totals: {
      impressions: totalImpressions,
      clicks: totalClicks,
      adClicks: totalAdClicks,
      ctr: ctr,
      adSpend: estimatedCost.toFixed(2),
      leads: totalLeads,
      calls: totalCalls
    },
    topQueries: paginatedQueries,
    pagination: {
        currentPage: page,
        totalPages: totalPages || 1,
        totalItems: totalItems
    }
  };
}