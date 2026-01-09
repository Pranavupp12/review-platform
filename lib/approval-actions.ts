'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getOriginalData(model: "COMPANY" | "BLOG", id: string) {
  try {
    if (model === "COMPANY") {
      return await prisma.company.findUnique({ where: { id } });
    }
    if (model === "BLOG") {
      return await prisma.blog.findUnique({ where: { id } });
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function resolveCategoryNames(categoryId: string | null | undefined, subCategoryId: string | null | undefined) {
  if (!categoryId) return { categoryName: "", subCategoryName: "" };

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { subCategories: true }
    });

    if (!category) return { categoryName: "Unknown ID", subCategoryName: "Unknown ID" };

    const subCategory = subCategoryId 
        ? category.subCategories.find(s => s.id === subCategoryId) 
        : null;

    return {
      categoryName: category.name,
      subCategoryName: subCategory ? subCategory.name : ""
    };
  } catch (error) {
    return { categoryName: "Error", subCategoryName: "Error" };
  }
}

export async function processApproval(changeId: string, decision: "APPROVE" | "REJECT", adminNote?: string) {
  const session = await auth();
  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

  const changeRequest = await prisma.pendingChange.findUnique({ where: { id: changeId } });
  if (!changeRequest) return { error: "Request not found" };

  // --- REJECTION LOGIC ---
  if (decision === "REJECT") {
    await prisma.pendingChange.update({
      where: { id: changeId },
      data: { status: "REJECTED", adminNote: adminNote || "No reason provided." }
    });
    revalidatePath("/admin/data-approval");
    return { success: true };
  }

  // --- APPROVAL LOGIC ---
  try {
    let payload = changeRequest.data as any;

    // 🔧 FIX: Restore Date Objects for Company
    if (payload.domainVerified && typeof payload.domainVerified === 'string') {
        payload.domainVerified = new Date(payload.domainVerified);
    }

    // 1. Handle BLOG Changes
    if (changeRequest.model === "BLOG") {
      if (changeRequest.action === "CREATE") {
        await prisma.blog.create({ data: payload });
      } else if (changeRequest.action === "UPDATE" && changeRequest.targetId) {
        await prisma.blog.update({ where: { id: changeRequest.targetId }, data: payload });
      }
    }

    // 2. Handle COMPANY Changes
    else if (changeRequest.model === "COMPANY") {
      delete payload.id; 
      delete payload.createdAt;
      delete payload.updatedAt;

      if (changeRequest.action === "CREATE") {
        // Ideally, sanitize CREATE payload too if it has extra fields, 
        // but for now we focus on the reported UPDATE error.
        
        // Remove known non-schema fields to prevent CREATE errors
        const { contactEmail, phone, socialLinks, ...createData } = payload;
        await prisma.company.create({ data: createData });

      } else if (changeRequest.action === "UPDATE" && changeRequest.targetId) {
        
        // ✅ FIX: Sanitize the payload
        // Remove 'contactEmail', 'phone', and 'socialLinks' so Prisma doesn't crash
        const { 
            categoryId, 
            subCategoryId, 
            socialLinks, 
            contactEmail, // <--- REMOVE THIS
            phone,        // <--- REMOVE THIS
            ...restData 
        } = payload;

        // 2. Prepare the Prisma Update Object
        const updateData: any = { ...restData };

        // 3. Connect Category if present
        if (categoryId) {
           updateData.category = { connect: { id: categoryId } };
        }

        // 4. Connect SubCategory if present
        if (subCategoryId) {
           updateData.subCategory = { connect: { id: subCategoryId } };
        }

        // 5. Execute Update
        await prisma.company.update({ 
           where: { id: changeRequest.targetId }, 
           data: updateData 
        });
      }
    }

    // 3. Mark as Approved
    await prisma.pendingChange.update({
        where: { id: changeId },
        data: { status: "APPROVED" }
    });

    revalidatePath("/admin/data-approval");
    revalidatePath("/admin/companies");
    revalidatePath("/admin/blogs");
    revalidatePath("/data-entry"); 

    return { success: true };

  } catch (error) {
    console.error("Approval Execution Failed:", error);
    return { error: "Failed to apply changes. Check server logs." };
  }
}