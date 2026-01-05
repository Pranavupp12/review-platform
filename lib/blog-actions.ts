'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// --- HELPER: Get Current User with Role ---
async function getUserSession() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user; // Returns object with { id, role, ... }
}

// 1. Create Blog (Intercepts for Data Entry)
export async function createBlog(formData: FormData, content: string) {
  const user = await getUserSession();
  if (!user) return { success: false, error: "Unauthorized" };

  // @ts-ignore
  const userRole = user.role;

  // 1. Check Permissions
  if (userRole !== 'ADMIN' && userRole !== 'DATA_ENTRY') {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    const rawData = {
      headline: formData.get('headline') as string,
      blogUrl: formData.get('blogUrl') as string,
      category: formData.get('category') as string,
      authorName: formData.get('authorName') as string,
      metaTitle: formData.get('metaTitle') as string,
      metaDescription: formData.get('metaDescription') as string,
      metaKeywords: formData.get('metaKeywords') as string,
      imageUrl: formData.get('imageUrl') as string,
      content: content, 
    };

    // Validation
    if (!rawData.headline || !rawData.content || !rawData.blogUrl) {
        return { success: false, error: "Missing required fields." };
    }

    // ✅ INTERCEPTION LOGIC: If Data Entry, save to PendingChange
    if (userRole === 'DATA_ENTRY') {
        await prisma.pendingChange.create({
            data: {
                model: "BLOG",
                action: "CREATE",
                data: rawData, // Stores the form data
                // @ts-ignore
                requesterId: user.id,
                status: "PENDING"
            }
        });
        return { success: true, message: "Draft submitted for Admin approval." };
    }

    // ✅ IF ADMIN: Execute Immediately
    await prisma.blog.create({
      data: rawData
    });

    revalidatePath('/admin/blogs');
    revalidatePath('/data-entry/blogs');
    return { success: true, message: "Blog published successfully." };

  } catch (error) {
    console.error("Create Blog Error:", error);
    return { success: false, error: "Failed to create blog. URL might be duplicate." };
  }
}

// 2. Update Blog (Intercepts for Data Entry)
export async function updateBlog(id: string, formData: FormData, content: string) {
  const user = await getUserSession();
  if (!user) return { success: false, error: "Unauthorized" };

  // @ts-ignore
  const userRole = user.role;

  if (userRole !== 'ADMIN' && userRole !== 'DATA_ENTRY') {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    const rawData = {
      headline: formData.get('headline') as string,
      blogUrl: formData.get('blogUrl') as string,
      category: formData.get('category') as string,
      authorName: formData.get('authorName') as string,
      metaTitle: formData.get('metaTitle') as string,
      metaDescription: formData.get('metaDescription') as string,
      metaKeywords: formData.get('metaKeywords') as string,
      imageUrl: formData.get('imageUrl') as string,
      content: content, 
    };

    // Validation
    if (!rawData.headline || !rawData.content || !rawData.blogUrl) {
        return { success: false, error: "Missing required fields." };
    }

    // ✅ INTERCEPTION LOGIC: If Data Entry, save to PendingChange
    if (userRole === 'DATA_ENTRY') {
        await prisma.pendingChange.create({
            data: {
                model: "BLOG",
                action: "UPDATE",
                targetId: id, // Track which blog is being edited
                data: rawData,
                // @ts-ignore
                requesterId: user.id,
                status: "PENDING"
            }
        });
        return { success: true, message: "Changes submitted for Admin approval." };
    }

    // ✅ IF ADMIN: Update Immediately
    await prisma.blog.update({
      where: { id },
      data: rawData
    });

    revalidatePath('/admin/blogs');
    revalidatePath('/data-entry/blogs');
    revalidatePath(`/blog/${rawData.blogUrl}`);
    return { success: true, message: "Blog updated successfully." };

  } catch (error) {
    console.error("Update Blog Error:", error);
    return { success: false, error: "Failed to update blog." };
  }
}

// 3. Delete Blog (Direct for both, or restrict if preferred)
export async function deleteBlog(id: string) {
    const user = await getUserSession();
    // @ts-ignore
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DATA_ENTRY')) {
        return { success: false, error: "Unauthorized access." };
    }

    try {
        // Note: Currently allowing Data Entry to delete directly. 
        // If you want to require approval for deletion, you would add the PendingChange logic here too.
        await prisma.blog.delete({ where: { id } });
        
        revalidatePath('/admin/blogs');
        revalidatePath('/data-entry/blogs');
        return { success: true };
    } catch (error) {
        console.error("Delete Error:", error);
        return { success: false, error: "Failed to delete blog." };
    }
}

// 4. Link Category (Direct for both - minor edit)
export async function linkCategoryToBlog(blogId: string, categoryId: string | null, city: string | null) {
  const user = await getUserSession();
  // @ts-ignore
  if (!user || (user.role !== 'ADMIN' && user.role !== 'DATA_ENTRY')) {
      return { success: false, error: "Unauthorized access." };
  }

  try {
    await prisma.blog.update({
      where: { id: blogId },
      data: { linkedCategoryId: categoryId, linkedCity: city }
    });
    
    revalidatePath("/admin/blogs");
    revalidatePath('/data-entry/blogs');
    return { success: true };
  } catch (error) {
    console.error("Failed to link category:", error);
    return { success: false, error: "Failed to update blog settings." };
  }
}