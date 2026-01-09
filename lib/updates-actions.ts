"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { startOfMonth, endOfMonth } from "date-fns";
import { z } from "zod";
import { v2 as cloudinary } from 'cloudinary';

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Validation Schema
const UpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  content: z.string().min(10, "Content must be at least 10 characters"),
  linkUrl: z.string().optional().or(z.literal("")),
  companyId: z.string(),
});

// 3. Helper to upload file to Cloudinary
async function uploadToCloudinary(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        folder: "business-updates",
        transformation: [{ width: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }] 
      }, 
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || "");
      }
    ).end(buffer);
  });
}

// --- 4. CREATE UPDATE (With Monthly Limits) ---
export async function createBusinessUpdate(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // Extract Data
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const linkUrl = formData.get("linkUrl") as string;
    const companyId = formData.get("companyId") as string;
    const imageFile = formData.get("image") as File;

    // Validate Text Fields
    const validated = UpdateSchema.safeParse({ title, content, linkUrl, companyId });
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Verify Ownership & Get Plan
    const claim = await prisma.businessClaim.findFirst({
      where: { userId: session.user.id, companyId },
      include: { company: { select: { plan: true } } } 
    });

    // ✅ FIX: Check if 'claim' OR 'claim.company' is missing to satisfy TypeScript
    if (!claim || !claim.company) {
        return { error: "Unauthorized operation." };
    }

    // CHECK LIMITS (Server-Side Enforcement)
    const plan = claim.company.plan || "FREE";
    
    const limits: Record<string, number> = {
       FREE: 0,
       GROWTH: 10,
       SCALE: 20,
       PRO: 20, // Legacy support
       CUSTOM: 9999 
    };
    
    const limit = limits[plan] || 0;

    // Count usage for current month
    const now = new Date();
    const currentUsage = await prisma.businessUpdate.count({
       where: {
          companyId,
          createdAt: {
             gte: startOfMonth(now),
             lte: endOfMonth(now)
          }
       }
    });

    // 🛑 STOP if limit reached
    if (currentUsage >= limit) {
       return { error: `Monthly limit of ${limit} posts reached for ${plan} plan. Please upgrade to post more.` };
    }

    // Handle Image Upload
    if (!imageFile || imageFile.size === 0) {
      return { error: "Image is required." };
    }

    let imageUrl = "";
    try {
      imageUrl = await uploadToCloudinary(imageFile);
    } catch (uploadError) {
      console.error("Upload failed:", uploadError);
      return { error: "Failed to upload image." };
    }

    // Save to DB
    await prisma.businessUpdate.create({
      data: {
        title,
        content,
        imageUrl,
        linkUrl: linkUrl || "",
        companyId,
      },
    });

    revalidatePath(`/business/dashboard/updates`);
    revalidatePath(`/company/[slug]`); 
    
    return { success: "Update published successfully!" };

  } catch (error) {
    console.error("Server Action Error:", error);
    return { error: "Something went wrong." };
  }
}

// --- 5. UPDATE EXISTING (No Limit Check) ---
export async function updateBusinessUpdate(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // Extract Data
    const updateId = formData.get("updateId") as string;
    const companyId = formData.get("companyId") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const linkUrl = formData.get("linkUrl") as string;
    const imageFile = formData.get("image") as File;

    if (!updateId || !companyId || !title || !content) {
      return { error: "Missing required fields." };
    }

    // Security: Verify Ownership
    const claim = await prisma.businessClaim.findFirst({
      where: { userId: session.user.id, companyId },
    });

    if (!claim) {
      return { error: "Unauthorized: You do not have permission to manage this company." };
    }

    // Handle Image Logic
    let imageUrl; 
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadToCloudinary(imageFile);
      } catch (uploadError) {
        console.error("Upload failed:", uploadError);
        return { error: "Failed to upload new image." };
      }
    }

    // Update Database
    const dataToUpdate: any = {
      title,
      content,
      linkUrl: linkUrl || "",
      // ⚠️ IMPORTANT: We DO NOT update 'createdAt' here to prevent the "Edit Loophole"
    };

    if (imageUrl) {
      dataToUpdate.imageUrl = imageUrl;
    }

    await prisma.businessUpdate.update({
      where: { id: updateId },
      data: dataToUpdate,
    });

    revalidatePath(`/business/dashboard/updates`);
    revalidatePath(`/company/[slug]`);
    
    return { success: "Article updated successfully!" };

  } catch (error) {
    console.error("Update Action Error:", error);
    return { error: "Failed to update article." };
  }
}

// --- 6. DELETE UPDATE ---
export async function deleteBusinessUpdate(updateId: string, companyId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // SECURITY CHECK
    const claim = await prisma.businessClaim.findFirst({
      where: {
        userId: session.user.id,
        companyId: companyId,
      }
    });

    if (!claim) {
      return { error: "Unauthorized operation." };
    }

    await prisma.businessUpdate.delete({
      where: { id: updateId },
    });

    revalidatePath(`/business/dashboard/updates`);
    revalidatePath(`/company/[slug]`);
    
    return { success: "Update deleted successfully" };
  } catch (error) {
    console.error("Delete error:", error);
    return { error: "Failed to delete update" };
  }
}