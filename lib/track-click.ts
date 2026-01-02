'use server';

import { prisma } from "@/lib/prisma";

// ✅ 1. Add userRegion to arguments
export async function trackSearchClick(
  companyId: string, 
  query: string, 
  location: string = 'global',
  userRegion: string = 'unknown' // Added parameter
) {
  if (!companyId || !query) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight

  try {
    await prisma.searchQueryStat.upsert({
      where: {
        // ✅ 2. Use the NEW unique key name from your updated schema
        companyId_query_location_userRegion_date: { 
          companyId,
          query: query.toLowerCase().trim(),
          location: location.toLowerCase().trim(),
          userRegion: userRegion || "unknown", // Must match schema constraint
          date: today
        }
      },
      update: {
        clicks: { increment: 1 },
        // Optional: Update userRegion to latest if unknown, but usually not needed for clicks
      },
      create: {
        companyId,
        query: query.toLowerCase().trim(),
        location: location.toLowerCase().trim(),
        // ✅ 3. Include userRegion in creation
        userRegion: userRegion || "unknown",
        date: today,
        impressions: 1, // If they clicked, they saw it
        clicks: 1
      }
    });
  } catch (error) {
    console.error("Failed to track click:", error);
  }
}