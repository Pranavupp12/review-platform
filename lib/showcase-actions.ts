"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CompanyType } from "@prisma/client";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        folder: "showcase-items", // Organized folder name
        transformation: [{ width: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }] 
      }, 
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || "");
      }
    ).end(buffer);
  });

}

// Handle Image Upload
export async function uploadShowcaseImage(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  try {
    const url = await uploadToCloudinary(file);
    return { success: true, url };
  } catch (error) {
    console.error("Upload failed:", error);
    return { success: false, error: "Failed to upload image" };
  }
}

// ✅ 1. UPDATE ITEM
export async function updateShowcaseItem(
  itemId: string,
  data: { name: string; description: string; images: string[]; linkUrl?: string }
) {
  try {
    await prisma.showcaseItem.update({
      where: { id: itemId },
      data: {
        name: data.name,
        description: data.description,
        images: data.images,
        // Save linkUrl if present, otherwise set to null
        // This effectively "removes" the link if a user clears the input
        linkUrl: data.linkUrl && data.linkUrl.trim() !== "" ? data.linkUrl : null,
      }
    });
    
    revalidatePath("/business/showcase");
    return { success: true };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "Failed to update item" };
  }
}

// ✅ 2. ADD ITEM
export async function addShowcaseItem(
  companyId: string, 
  data: { name: string; description: string; images: string[]; linkUrl?: string; type: CompanyType; }
) {
  try {
    await prisma.showcaseItem.create({
      data: {
        companyId,
        name: data.name,
        description: data.description,
        images: data.images,
        // Only save link if provided
        linkUrl: data.linkUrl && data.linkUrl.trim() !== "" ? data.linkUrl : null,
        type: data.type
      }
    });

    revalidatePath("/business/showcase");
    return { success: true };
  } catch (error) {
    console.error("Add Error:", error);
    return { success: false, error: "Failed to add item" };
  }
}

// ✅ 3. DELETE ITEM
export async function deleteShowcaseItem(itemId: string) {
  try {
    await prisma.showcaseItem.delete({ where: { id: itemId } });
    revalidatePath("/business/showcase");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete item" };
  }
}

// ✅ 4. UPDATE TYPE
export async function updateCompanyType(companyId: string, type: "SERVICE" | "PRODUCT") {
  try {
    const current = await prisma.company.findUnique({
        where: { id: companyId },
        select: { companyType: true }
    });

    if (current?.companyType) {
        return { success: false, error: "Business type is already locked. Contact support to change it." };
    }

    await prisma.company.update({
      where: { id: companyId },
      data: { companyType: type }
    });

    revalidatePath("/business/showcase");
    revalidatePath("/business/settings"); 
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update type" };
  }
}