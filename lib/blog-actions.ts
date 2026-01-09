'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { uploadToCloud } from "./cloudinary";

// --- HELPER: Upload Image to Cloudinary ---
export async function uploadEditorImage(formData: FormData) {
  try {
    const file = formData.get('file') as File;

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload using the helper function
    // @ts-ignore
    const result: any = await uploadToCloud(buffer, 'blog-content-images');

    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error('Image upload failed:', error);
    return { success: false, error: 'Failed to upload image' };
  }
}

// --- HELPER: Get Current User with Role ---
async function getUserSession() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user; 
}


// 1. Create Blog (Intercepts for Staff)
export async function createBlog(formData: FormData, content: string) {
  const user = await getUserSession();
  if (!user) return { success: false, error: "Unauthorized" };

  // @ts-ignore
  const userRole = user.role;

  // ✅ 1. UPDATE PERMISSIONS: Allow BLOG_ENTRY
  if (userRole !== 'ADMIN' && userRole !== 'DATA_ENTRY' && userRole !== 'BLOG_ENTRY') {
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

    if (!rawData.headline || !rawData.content || !rawData.blogUrl) {
        return { success: false, error: "Missing required fields." };
    }

    // ✅ 2. INTERCEPTION: If Staff (Data Entry OR Blog Entry), submit for approval
    if (userRole === 'DATA_ENTRY' || userRole === 'BLOG_ENTRY') {
        await prisma.pendingChange.create({
            data: {
                model: "BLOG",
                action: "CREATE",
                data: rawData, 
                // @ts-ignore
                requesterId: user.id,
                status: "PENDING"
            }
        });
        return { success: true, message: "Draft submitted for Admin approval." };
    }

    // ✅ 3. ADMIN: Execute Immediately
    await prisma.blog.create({
      data: rawData
    });

    revalidatePath('/admin/blogs');
    revalidatePath('/data-entry/blogs');
    revalidatePath('/blog-entry/blogs'); // ✅ Revalidate new dashboard
    return { success: true, message: "Blog published successfully." };

  } catch (error) {
    console.error("Create Blog Error:", error);
    return { success: false, error: "Failed to create blog. URL might be duplicate." };
  }
}

// 2. Update Blog (Intercepts for Staff)
export async function updateBlog(id: string, formData: FormData, content: string) {
  const user = await getUserSession();
  if (!user) return { success: false, error: "Unauthorized" };

  // @ts-ignore
  const userRole = user.role;

  // ✅ UPDATE PERMISSIONS
  if (userRole !== 'ADMIN' && userRole !== 'DATA_ENTRY' && userRole !== 'BLOG_ENTRY') {
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

    if (!rawData.headline || !rawData.content || !rawData.blogUrl) {
        return { success: false, error: "Missing required fields." };
    }

    // ✅ INTERCEPTION
    if (userRole === 'DATA_ENTRY' || userRole === 'BLOG_ENTRY') {
        await prisma.pendingChange.create({
            data: {
                model: "BLOG",
                action: "UPDATE",
                targetId: id, 
                data: rawData,
                // @ts-ignore
                requesterId: user.id,
                status: "PENDING"
            }
        });
        return { success: true, message: "Changes submitted for Admin approval." };
    }

    // ✅ ADMIN EXECUTION
    await prisma.blog.update({
      where: { id },
      data: rawData
    });

    revalidatePath('/admin/blogs');
    revalidatePath('/data-entry/blogs');
    revalidatePath('/blog-entry/blogs'); // ✅ Revalidate
    revalidatePath(`/blog/${rawData.blogUrl}`);
    return { success: true, message: "Blog updated successfully." };

  } catch (error) {
    console.error("Update Blog Error:", error);
    return { success: false, error: "Failed to update blog." };
  }
}

// 3. Delete Blog
export async function deleteBlog(id: string) {
    const user = await getUserSession();
    // @ts-ignore
    const userRole = user?.role;

    // ✅ UPDATE PERMISSIONS
    if (!user || (userRole !== 'ADMIN' && userRole !== 'DATA_ENTRY' && userRole !== 'BLOG_ENTRY')) {
        return { success: false, error: "Unauthorized access." };
    }

    try {
        await prisma.blog.delete({ where: { id } });
        
        revalidatePath('/admin/blogs');
        revalidatePath('/data-entry/blogs');
        revalidatePath('/blog-entry/blogs'); // ✅ Revalidate
        return { success: true };
    } catch (error) {
        console.error("Delete Error:", error);
        return { success: false, error: "Failed to delete blog." };
    }
}

// 4. Link Category
export async function linkCategoryToBlog(blogId: string, categoryId: string | null, city: string | null) {
  const user = await getUserSession();
  // @ts-ignore
  const userRole = user?.role;

  // ✅ UPDATE PERMISSIONS
  if (!user || (userRole !== 'ADMIN' && userRole !== 'DATA_ENTRY' && userRole !== 'BLOG_ENTRY')) {
      return { success: false, error: "Unauthorized access." };
  }

  try {
    await prisma.blog.update({
      where: { id: blogId },
      data: { linkedCategoryId: categoryId, linkedCity: city }
    });
    
    revalidatePath("/admin/blogs");
    revalidatePath('/data-entry/blogs');
    revalidatePath('/blog-entry/blogs'); // ✅ Revalidate
    return { success: true };
  } catch (error) {
    console.error("Failed to link category:", error);
    return { success: false, error: "Failed to update blog settings." };
  }
}