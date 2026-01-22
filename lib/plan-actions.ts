"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { Plan } from "@prisma/client"; 
import { BADGE_CONFIG } from "@/lib/badges";

/**
 * 1. CHANGE PLAN
 * When changing a plan, we reset manual overrides AND enforce sponsorship rules.
 */
export async function updateCompanyPlan(companyId: string, newPlan: Plan) {
  const session = await auth();
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") return { error: "Forbidden" };

  // ✅ LOGIC ADDITION: Determine Sponsorship settings based on the NEW plan
  let sponsorshipUpdate = {};

  if (newPlan === "SCALE") {
    // Requirement 1: SCALE gets auto-sponsored (Local)
    sponsorshipUpdate = {
      isSponsored: true,
      sponsoredScope: "LOCAL" // 👈 FIXED: Changed from sponsorScope to sponsoredScope
    };
  } else if (newPlan === "CUSTOM") {
    // Requirement 2: CUSTOM keeps whatever settings it had (No change)
    sponsorshipUpdate = {}; 
  } else {
    // Requirement 3: FREE/GROWTH must have sponsorship disabled
    sponsorshipUpdate = {
      isSponsored: false,
      sponsoredScope: null // 👈 FIXED: Changed from sponsorScope to sponsoredScope
    };
  }

  try {
    await prisma.company.update({
      where: { id: companyId },
      data: { 
        plan: newPlan,
        
        // RESET overrides so they inherit the new plan's defaults
        customEmailLimit: null,
        customUpdateLimit: null,
        enableAnalytics: null,
        enableLeadGen: null,
        hideCompetitors: null,

        // ✅ APPLY SPONSORSHIP ENFORCEMENT
        ...sponsorshipUpdate
      }
    });

    revalidatePath("/admin/companies");
    return { success: `Plan updated to ${newPlan}` };
  } catch (error) {
    console.error("Plan Update Error:", error);
    return { error: "Failed to update plan" };
  }
}

/**
 * 2. MANAGE FEATURES (OVERRIDES)
 * (Keep this function exactly as it is in your snippet)
 */
export async function updateCompanyFeatures(companyId: string, formData: FormData) {
  // ... existing code ...
  const session = await auth();
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") return { error: "Forbidden" };

  try {
    const emailRaw = formData.get("emailLimit") as string;
    const updateRaw = formData.get("updateLimit") as string;
    const analyticsRaw = formData.get("analytics") as string;
    const leadGenRaw = formData.get("leadGen") as string;
    const competitorsRaw = formData.get("competitors") as string;
    const badgesRaw = formData.get("badges") as string; 
    
    let badgesToSave: string[] | undefined;

    if (badgesRaw) {
       try {
          badgesToSave = JSON.parse(badgesRaw);
       } catch (e) {
          console.error("Failed to parse badges", e);
       }
    }

    const parseTriState = (val: string) => {
        if (val === "true") return true;
        if (val === "false") return false;
        return null;
    };

    const parseNullableInt = (val: string) => {
        return val === "" ? null : parseInt(val);
    };

    const updateData: any = {
        customEmailLimit: parseNullableInt(emailRaw),
        customUpdateLimit: parseNullableInt(updateRaw),
        enableAnalytics: parseTriState(analyticsRaw),
        enableLeadGen: parseTriState(leadGenRaw),
        hideCompetitors: parseTriState(competitorsRaw),
    };

    if (badgesToSave) {
        updateData.badges = badgesToSave;
    }

    await prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });

    revalidatePath("/admin/companies");
    revalidatePath("/admin/plans"); 
    
    return { success: "Features & Badges updated successfully" };

  } catch (error) {
    console.error(error);
    return { error: "Failed to update features" };
  }
}