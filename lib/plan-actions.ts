"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { Plan } from "@prisma/client"; 
import { BADGE_CONFIG } from "@/lib/badges";

/**
 * 1. CHANGE PLAN
 * When changing a plan, we usually want to RESET any manual overrides 
 * so the company strictly follows the new plan's rules.
 */
export async function updateCompanyPlan(companyId: string, newPlan: Plan) {
  const session = await auth();
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") return { error: "Forbidden" };

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
        hideCompetitors: null
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
 * This replaces the old 'toggleCompanyFeature'. 
 * It handles Limits (numbers) AND Toggles (booleans).
 */
export async function updateCompanyFeatures(companyId: string, formData: FormData) {
  const session = await auth();
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") return { error: "Forbidden" };

  try {
    // 1. Existing Parsing
    const emailRaw = formData.get("emailLimit") as string;
    const updateRaw = formData.get("updateLimit") as string;
    const analyticsRaw = formData.get("analytics") as string;
    const leadGenRaw = formData.get("leadGen") as string;
    const competitorsRaw = formData.get("competitors") as string;

    // ✅ 2. New Badge Parsing
    // We expect badges to be sent as a JSON string or comma-separated
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

    // 3. Prepare Update Data
    const updateData: any = {
        customEmailLimit: parseNullableInt(emailRaw),
        customUpdateLimit: parseNullableInt(updateRaw),
        enableAnalytics: parseTriState(analyticsRaw),
        enableLeadGen: parseTriState(leadGenRaw),
        hideCompetitors: parseTriState(competitorsRaw),
    };

    // Only update badges if they were sent (preserves existing if frontend logic fails)
    if (badgesToSave) {
        updateData.badges = badgesToSave;
    }

    await prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });

    revalidatePath("/admin/companies");
    // Also revalidate plans page
    revalidatePath("/admin/plans"); 
    
    return { success: "Features & Badges updated successfully" };

  } catch (error) {
    console.error(error);
    return { error: "Failed to update features" };
  }
}