
'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { PLAN_TEMPLATES } from "@/lib/plan-config";
import { Plan } from "@prisma/client"; 

/**
 * Updates a company's plan and resets their features to the plan's default template.
 * @param companyId - The ID of the company to update
 * @param newPlan - The new Plan Enum (FREE, GROWTH, SCALE, CUSTOM)
 */
export async function updateCompanyPlan(companyId: string, newPlan: Plan) {
  const session = await auth();
  
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") return { error: "Forbidden" };

  try {
    // Get the default features for the selected plan from your config
    // If switching to CUSTOM, this defaults to an empty array (or you could keep existing)
    // @ts-ignore
    const defaultFeatures = PLAN_TEMPLATES[newPlan] || [];

    await prisma.company.update({
      where: { id: companyId },
      data: { 
        plan: newPlan,
        // CRITICAL: This overwrites any manual changes with the new plan's defaults.
        // This ensures the company gets exactly what the plan promises.
        features: defaultFeatures 
      }
    });

    revalidatePath("/admin/plans");
    return { success: `Plan updated to ${newPlan}` };
  } catch (error) {
    console.error("Plan Update Error:", error);
    return { error: "Failed to update plan" };
  }
}

/**
 * Manually adds or removes a specific feature for a company.
 * Useful for the "CUSTOM" plan or creating specific overrides.
 * @param companyId - The ID of the company
 * @param featureKey - The unique key of the feature (e.g., "analytics_advanced")
 * @param isEnabled - True to add the feature, False to remove it
 */
export async function toggleCompanyFeature(companyId: string, featureKey: string, isEnabled: boolean) {
  const session = await auth();
  
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") return { error: "Forbidden" };

  try {
    // 1. Fetch current features
    const company = await prisma.company.findUnique({ 
        where: { id: companyId }, 
        select: { features: true } 
    });

    if (!company) return { error: "Company not found" };

    let updatedFeatures = [...company.features];

    if (isEnabled) {
      // Add if not present
      if (!updatedFeatures.includes(featureKey)) {
        updatedFeatures.push(featureKey);
      }
    } else {
      // Remove if present
      updatedFeatures = updatedFeatures.filter(f => f !== featureKey);
    }

    // 2. Save updates
    await prisma.company.update({
      where: { id: companyId },
      data: { features: updatedFeatures }
    });

    revalidatePath("/admin/plans");
    return { success: "Features updated successfully" };
  } catch (error) {
    console.error("Feature Toggle Error:", error);
    return { error: "Failed to update feature" };
  }
}