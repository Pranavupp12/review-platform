'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper to get start of day for analytics grouping
function getTodayNormalized() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export async function submitQuoteRequest(companyId: string, formData: FormData) {
  const session = await auth();
  
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const details = formData.get("details") as string;

  if (!name || !email || !details) {
    return { success: false, error: "All fields are required." };
  }

  try {
    // 1. Create the Lead Record
    await prisma.lead.create({
      data: {
        companyId: companyId,
        userName: name,
        userEmail: email,
        message: details,
        userId: session?.user?.id || null, // Link if logged in, null if guest
        source: "PROFILE_QUOTE_BUTTON"
      }
    });

    // 2. Update Analytics (Increment Lead Count)
    const today = getTodayNormalized();
    
    await prisma.companyAnalytics.upsert({
      where: {
        companyId_date: {
          companyId: companyId,
          date: today
        }
      },
      update: {
        leadsGenerated: { increment: 1 }
      },
      create: {
        companyId: companyId,
        date: today,
        leadsGenerated: 1,
        reviewCount: 0, // Default values for other fields
        trustScore: 0,
        nss: 0,
        profileViews: 0,
        clickThroughs: 0
      }
    });

    // 3. Send Email (Mocking the send function here)
    // In production, replace this with your actual email service (Resend/Nodemailer)
    // await sendLeadNotificationEmail(companyEmail, { name, email, details });
    console.log(`📧 Quote Request sent to Company ${companyId} from ${email}`);

    return { success: true, message: "Quote request sent successfully!" };

  } catch (error) {
    console.error("Failed to submit quote:", error);
    return { success: false, error: "Failed to send request. Please try again." };
  }
}

export async function trackPhoneClick(companyId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    await prisma.companyAnalytics.upsert({
      where: {
        companyId_date: {
          companyId: companyId,
          date: today
        }
      },
      update: {
        callsGenerated: { increment: 1 }
      },
      create: {
        companyId: companyId,
        date: today,
        callsGenerated: 1,
        // Defaults
        reviewCount: 0,
        trustScore: 0,
        nss: 0,
        profileViews: 0,
        clickThroughs: 0,
        leadsGenerated: 0
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to track call click:", error);
    return { success: false };
  }
}