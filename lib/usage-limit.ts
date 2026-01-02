import { prisma } from "@/lib/prisma";
import { addMonths, isAfter } from "date-fns";
// Import your Plan enum type if needed, or just compare strings
// import { Plan } from "@prisma/client"; 

const FREE_LIMIT = 10;

export async function checkEmailLimit(companyId: string, emailsToSend: number) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { 
      plan: true, // ✅ Fetch 'plan' instead of 'isPro'
      emailUsageCount: true, 
      emailUsageResetDate: true 
    }
  });

  if (!company) throw new Error("Company not found");

  // ✅ 1. Check if Plan is PRO
  if (company.plan === 'PRO') {
    return { allowed: true, currentUsage: 0, limit: "Unlimited" };
  }

  // 2. Check for Monthly Reset (The "Lazy Reset" Logic)
  // If today is AFTER the reset date, wipe the slate clean.
  let currentUsage = company.emailUsageCount;

  const resetDate = company.emailUsageResetDate || new Date();
  
  if (isAfter(new Date(), resetDate)) {
    // Reset usage and set next reset date to 1 month from now
    await prisma.company.update({
      where: { id: companyId },
      data: {
        emailUsageCount: 0,
        emailUsageResetDate: addMonths(new Date(), 1)
      }
    });
    currentUsage = 0;
  }

  // 3. Check Capacity for FREE Plan
  const remaining = FREE_LIMIT - currentUsage;
  
  if (emailsToSend > remaining) {
    return { 
      allowed: false, 
      error: `Limit exceeded. You have ${remaining} free emails left this month.`,
      currentUsage,
      limit: FREE_LIMIT
    };
  }

  return { allowed: true, currentUsage, limit: FREE_LIMIT };
}

export async function incrementEmailUsage(companyId: string, count: number) {
  // Check plan before incrementing
  const company = await prisma.company.findUnique({ 
    where: { id: companyId }, 
    select: { plan: true }
  });

  // If PRO, we usually don't need to track strict limits, but you can if you want stats.
  // Generally, we only strictly track FREE usage to enforce the cap.
  if (company?.plan === 'PRO') return;

  await prisma.company.update({
    where: { id: companyId },
    data: {
      emailUsageCount: { increment: count }
    }
  });
}