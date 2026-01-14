"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from 'cloudinary';
// ✅ Import the sender helper (Keep your existing lib/mail.ts file)
import { sendProfessionalCampaign } from "@/lib/mail"; 
// ✅ Import the new feature helper
import { getCompanyFeatures } from "@/lib/plan-config";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * ✅ CHECK LIMITS + HANDLE MONTHLY RESET
 * This function does two things:
 * 1. Resets the counter if the billing month has passed.
 * 2. Checks if the user has enough tokens left based on their Dynamic Plan.
 */
async function checkEmailLimit(companyId: string, recipientCount: number) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { 
        plan: true, 
        emailUsageCount: true, 
        emailUsageResetDate: true, // Needed for reset logic
        customEmailLimit: true     // Needed for override logic
    }
  });

  if (!company) return { allowed: false, error: "Company not found" };

  // --- 1. HANDLE MONTHLY RESET ---
  let currentUsage = company.emailUsageCount || 0;
  
  // If reset date is missing or today is AFTER the reset date, wipe the slate clean.
  const now = new Date();
  const resetDate = company.emailUsageResetDate ? new Date(company.emailUsageResetDate) : now;

  // Compare dates (if resetDate is in the past, we reset)
  if (now > resetDate || !company.emailUsageResetDate) {
      const nextReset = new Date();
      nextReset.setMonth(nextReset.getMonth() + 1); // Set next reset to 1 month from now

      await prisma.company.update({
          where: { id: companyId },
          data: {
              emailUsageCount: 0,
              emailUsageResetDate: nextReset
          }
      });
      currentUsage = 0; // Reset local variable for calculation below
  }

  // --- 2. CHECK DYNAMIC LIMIT ---
  const features = getCompanyFeatures(company);
  const limit = features.emailLimit;

  // Infinite limits (Custom/Scale/Pro) are always allowed
  if (limit === Infinity) return { allowed: true };

  // Check calculation
  if ((currentUsage + recipientCount) > limit) {
     return { 
         allowed: false, 
         error: `Limit exceeded. You have ${limit - currentUsage} emails left this month, but tried to send ${recipientCount}.` 
     };
  }

  return { allowed: true };
}

/**
 * Helper to Increment Usage
 */
async function incrementEmailUsage(companyId: string, count: number) {
    await prisma.company.update({
        where: { id: companyId },
        data: { emailUsageCount: { increment: count } }
    });
}

// --- 1. CREATE CAMPAIGN ACTION ---
export async function createCampaign(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.companyId) return { error: "Unauthorized" };
  const companyId = session.user.companyId;

  // Check action type
  const actionType = formData.get("actionType") as string; 

  const name = formData.get("name") as string;
  const subject = formData.get("subject") as string;
  const senderEmail = formData.get("senderEmail") as string;
  const htmlContent = formData.get("htmlContent") as string;
  const recipientsRaw = formData.get("recipients") as string;

  // Template Fields
  const templateType = (formData.get("templateType") as "INVITE" | "PROMOTIONAL") || "INVITE";
  const customBtnText = formData.get("customBtnText") as string;
  const customBtnUrl = formData.get("customBtnUrl") as string;

  if (!name || !subject) return { error: "Name and Subject are required." };

  // Handle Images
  const logoFile = formData.get("logo") as File;
  const bannerFile = formData.get("banner") as File;
  let logoUrl = null;
  let bannerUrl = null;

  try {
     const uploadImage = async (file: File, folder: string) => {
        if(file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const res = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream({ folder, transformation: [{ width: 800, crop: "limit", quality: "auto", fetch_format: "auto" }] }, (err, result) => err ? reject(err) : resolve(result)).end(buffer);
            });
            return res.secure_url;
        }
        return null;
     };
     if (logoFile.size > 0) logoUrl = await uploadImage(logoFile, "campaign_logos");
     if (bannerFile.size > 0) bannerUrl = await uploadImage(bannerFile, "campaign_banners");
  } catch (e) {
     console.error("Image Upload Failed", e);
  }

  // Process Recipients
  const recipientList = recipientsRaw
    .split(/[\n, ]+/) 
    .map(email => email.trim())
    .filter(email => email.includes("@"));

  // Fetch Company Info
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true, slug: true, logoImage: true }
  });
  
  const finalLogo = logoUrl || company?.logoImage;

  // Button Logic
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const profileLink = `${domain}/company/${company?.slug}`;
  
  const finalBtnText = templateType === "PROMOTIONAL" ? customBtnText : "Rate Your Experience";
  const finalBtnUrl = templateType === "PROMOTIONAL" ? customBtnUrl : profileLink;

  // --- SENDING LOGIC ---
  let sentCount = 0;
  let status = "DRAFT";
  let sentAt = null;

  if (actionType === "SEND") {
      if (recipientList.length === 0) return { error: "Recipients required for sending." };

      // ✅ Use Updated Check
      const limitCheck = await checkEmailLimit(companyId, recipientList.length);
      if (!limitCheck.allowed) {
          return { error: limitCheck.error };
      }
      
      for (const recipient of recipientList) {
        await sendProfessionalCampaign(
           recipient,
           company?.name || "Business",
           senderEmail,
           subject,
           htmlContent,
           finalBtnUrl, 
           finalLogo,
           bannerUrl,
           finalBtnText 
        );
        sentCount++;
      }
      await incrementEmailUsage(companyId, sentCount);

      status = "SENT";
      sentAt = new Date();
  }

  // Save to DB
  await prisma.campaign.create({
    data: {
      companyId,
      name,
      subject,
      senderEmail,
      content: htmlContent,
      logoUrl: finalLogo,
      bannerUrl,
      recipients: recipientList,
      sentCount,
      status: status as any, 
      sentAt,
      templateType,
      buttonText: templateType === "PROMOTIONAL" ? customBtnText : null,
      buttonUrl: templateType === "PROMOTIONAL" ? customBtnUrl : null
    }
  });

  revalidatePath('/business/dashboard/marketing');
  return { success: true, status };
}

// --- 2. UPDATE DRAFT ACTION ---
export async function updateDraft(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.companyId) return { error: "Unauthorized" };

  const campaignId = formData.get("campaignId") as string;
  const name = formData.get("name") as string;
  const subject = formData.get("subject") as string;
  const htmlContent = formData.get("htmlContent") as string;
  const recipientsRaw = formData.get("recipients") as string;
  
  const templateType = (formData.get("templateType") as "INVITE" | "PROMOTIONAL") || "INVITE";
  const customBtnText = formData.get("customBtnText") as string;
  const customBtnUrl = formData.get("customBtnUrl") as string;

  const logoFile = formData.get("logo") as File;
  const bannerFile = formData.get("banner") as File;

  try {
    const existingCampaign = await prisma.campaign.findUnique({
        where: { id: campaignId, companyId: session.user.companyId }
    });

    if (!existingCampaign || existingCampaign.status === "SENT") {
        return { error: "Cannot edit this campaign." };
    }

    let logoUrl = existingCampaign.logoUrl;
    let bannerUrl = existingCampaign.bannerUrl;

    const uploadImage = async (file: File, folder: string) => {
        if(file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const res = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream({ folder }, (err, result) => err ? reject(err) : resolve(result)).end(buffer);
            });
            return res.secure_url;
        }
        return null;
    };

    if (logoFile && logoFile.size > 0) logoUrl = await uploadImage(logoFile, "campaign_logos");
    if (bannerFile && bannerFile.size > 0) bannerUrl = await uploadImage(bannerFile, "campaign_banners");

    const recipientList = recipientsRaw
      .split(/[\n, ]+/) 
      .map(email => email.trim())
      .filter(email => email.includes("@"));

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        name,
        subject,
        content: htmlContent,
        recipients: recipientList,
        logoUrl,
        bannerUrl,
        updatedAt: new Date(),
        templateType,
        buttonText: templateType === "PROMOTIONAL" ? customBtnText : null,
        buttonUrl: templateType === "PROMOTIONAL" ? customBtnUrl : null
      }
    });

    revalidatePath('/business/dashboard/marketing');
    return { success: "Draft updated successfully!" };
  } catch (error) {
    console.error("Update Draft Error:", error);
    return { error: "Failed to update draft." };
  }
}

// --- 3. SEND DRAFT ACTION ---
export async function sendDraft(campaignId: string) {
    const session = await auth();
    if (!session?.user?.companyId) return { error: "Unauthorized" };

    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId, companyId: session.user.companyId }
    });

    if (!campaign || campaign.status === "SENT") return { error: "Invalid campaign." };

    // ✅ Uses the new dynamic check
    const limitCheck = await checkEmailLimit(session.user.companyId, campaign.recipients.length);
    if (!limitCheck.allowed) {
        return { error: limitCheck.error };
    }

    const company = await prisma.company.findUnique({
        where: { id: session.user.companyId },
        select: { name: true, slug: true }
    });

    const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const profileLink = `${domain}/company/${company?.slug}`;

    const finalBtnText = campaign.templateType === "PROMOTIONAL" 
       ? campaign.buttonText || "View Details" 
       : "Rate Your Experience";

    const finalBtnUrl = campaign.templateType === "PROMOTIONAL" 
       ? campaign.buttonUrl || profileLink
       : profileLink;

    let count = 0;
    for (const recipient of campaign.recipients) {
        await sendProfessionalCampaign(
            recipient,
            company?.name || "Business",
            campaign.senderEmail,
            campaign.subject,
            campaign.content,
            finalBtnUrl, 
            campaign.logoUrl,
            campaign.bannerUrl,
            finalBtnText 
        );
        count++;
    }

    await incrementEmailUsage(session.user.companyId, count);

    await prisma.campaign.update({
        where: { id: campaignId },
        data: {
            status: "SENT",
            sentCount: count,
            sentAt: new Date()
        }
    });

    revalidatePath('/business/dashboard/marketing');
    return { success: true };
}

// --- 4. DELETE CAMPAIGN ---
export async function deleteCampaign(campaignId: string) {
  const session = await auth();
  if (!session?.user?.companyId) return { error: "Unauthorized" };

  try {
    await prisma.campaign.delete({
      where: { 
        id: campaignId,
        companyId: session.user.companyId 
      }
    });
    
    revalidatePath('/business/dashboard/marketing');
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete campaign." };
  }
}