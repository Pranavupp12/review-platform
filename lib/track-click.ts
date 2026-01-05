'use server';

import { prisma } from "@/lib/prisma";

// Helper to ensure all stats for the day are grouped together at midnight
function getTodayNormalized() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

// ✅ 1. Track Single Impression (Keep for single search/detail views if needed)
export async function trackSearchImpression(
  companyId: string, 
  query: string, 
  location: string = 'global',
  userRegion: string = 'unknown'
) {
  if (!companyId || !query) return;
  const today = getTodayNormalized();

  try {
    await prisma.searchQueryStat.upsert({
      where: {
        companyId_query_location_userRegion_date: { 
          companyId,
          query: query.toLowerCase().trim(),
          location: location.toLowerCase().trim(),
          userRegion: userRegion || "unknown",
          date: today
        }
      },
      update: { impressions: { increment: 1 } },
      create: {
        companyId,
        query: query.toLowerCase().trim(),
        location: location.toLowerCase().trim(),
        userRegion: userRegion || "unknown",
        date: today,
        impressions: 1,
        clicks: 0
      }
    });
  } catch (error) {
    console.error("Failed to track impression:", error);
  }
}

// ✅ 2. Track Click (Call this onClick)
export async function trackSearchClick(
  companyId: string, 
  query: string, 
  location: string = 'global',
  userRegion: string = 'unknown'
) {
  if (!companyId || !query) return;
  const today = getTodayNormalized();

  try {
    await prisma.searchQueryStat.upsert({
      where: {
        companyId_query_location_userRegion_date: { 
          companyId,
          query: query.toLowerCase().trim(),
          location: location.toLowerCase().trim(),
          userRegion: userRegion || "unknown",
          date: today
        }
      },
      update: { clicks: { increment: 1 } },
      create: {
        companyId,
        query: query.toLowerCase().trim(),
        location: location.toLowerCase().trim(),
        userRegion: userRegion || "unknown",
        date: today,
        impressions: 1, // Self-healing
        clicks: 1
      }
    });
  } catch (error) {
    console.error("Failed to track click:", error);
  }
}

// ✅ 3. NEW: Track Batch Impressions (For Category/Listing pages)
export async function trackBatchImpressions(
  companyIds: string[], 
  query: string, 
  location: string = 'global',
  userRegion: string = 'unknown'
) {
  if (!companyIds.length || !query) return;
  const today = getTodayNormalized();

  try {
    // Run all updates in parallel inside a single transaction
    await prisma.$transaction(
      companyIds.map((companyId) => 
        prisma.searchQueryStat.upsert({
          where: {
            companyId_query_location_userRegion_date: { 
              companyId,
              query: query.toLowerCase().trim(),
              location: location.toLowerCase().trim(),
              userRegion: userRegion || "unknown",
              date: today
            }
          },
          update: { impressions: { increment: 1 } },
          create: {
            companyId,
            query: query.toLowerCase().trim(),
            location: location.toLowerCase().trim(),
            userRegion: userRegion || "unknown",
            date: today,
            impressions: 1,
            clicks: 0
          }
        })
      )
    );
  } catch (error) {
    console.error("Failed to batch track impressions:", error);
  }
}