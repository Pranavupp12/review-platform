import { prisma } from "@/lib/prisma";

// --- PART 1: PLATFORM ANALYTICS ---

export async function generatePlatformReport() {
  console.log("📊 Starting Platform Analysis...");

  // 1. Fetch Current Counts
  const totalUsers = await prisma.user.count();
  const totalReviews = await prisma.review.count();
  const totalCompanies = await prisma.company.count();
  const claimedCount = await prisma.company.count({ where: { claimed: true } });

  // 2. Fetch Previous Snapshot (to calc growth)
  const lastSnapshot = await prisma.platformAnalytics.findFirst({
    orderBy: { date: 'desc' }
  });

  const newUsers = lastSnapshot ? totalUsers - lastSnapshot.totalUsers : 0;
  const newReviews = lastSnapshot ? totalReviews - lastSnapshot.totalReviews : 0;
  const newCompanies = lastSnapshot ? totalCompanies - lastSnapshot.totalCompanies : 0;

  // 3. Calculate Sentiment Distribution
  const reviews = await prisma.review.findMany({ select: { starRating: true } });
  
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRatingSum = 0;

  reviews.forEach(r => {
    const star = Math.round(r.starRating) as 1|2|3|4|5; // Round to integer for bucketing
    // @ts-ignore
    if (distribution[star] !== undefined) distribution[star]++;
    totalRatingSum += r.starRating;
  });

  const avgSentiment = totalReviews > 0 ? totalRatingSum / totalReviews : 0;

  // 4. Save Snapshot
  await prisma.platformAnalytics.create({
    data: {
      totalUsers,
      totalReviews,
      totalCompanies,
      claimedCount,
      newUsers: Math.max(0, newUsers), // Prevent negatives if DB was wiped
      newReviews: Math.max(0, newReviews),
      newCompanies: Math.max(0, newCompanies),
      sentimentBreakdown: distribution,
      avgSentiment
    }
  });

  console.log("✅ Platform Report Generated!");
}


// --- PART 2: COMPANY ANALYTICS (Batch Process) ---

export async function generateAllCompanyReports() {
  console.log("🏭 Starting Company Analysis...");
  
  const companies = await prisma.company.findMany({
    include: { reviews: { select: { starRating: true } } }
  });

  for (const company of companies) {
    // 1. Calculate Net Sentiment Score (NSS)
    // Formula: (% Promoters [5★]) - (% Detractors [1-3★])
    const total = company.reviews.length;
    let promoters = 0;
    let detractors = 0;

    company.reviews.forEach(r => {
        if (r.starRating >= 4.5) promoters++;
        if (r.starRating <= 3.5) detractors++;
    });

    const percentPromoters = total > 0 ? (promoters / total) * 100 : 0;
    const percentDetractors = total > 0 ? (detractors / total) * 100 : 0;
    const nss = Math.round(percentPromoters - percentDetractors);

    // 2. Save Snapshot
    await prisma.companyAnalytics.create({
        data: {
            companyId: company.id,
            trustScore: company.rating || 0,
            reviewCount: total,
            nss: nss,
            // View counts would come from your ViewTracker logic if connected
            profileViews: 0, 
        }
    });
  }
  
  console.log(`✅ Generated reports for ${companies.length} companies.`);
}