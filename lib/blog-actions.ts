'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Create Blog
export async function createBlog(formData: FormData, content: string) {
  try {
    const rawData = {
      headline: formData.get('headline') as string,
      blogUrl: formData.get('blogUrl') as string,
      category: formData.get('category') as string,
      authorName: formData.get('authorName') as string,
      metaTitle: formData.get('metaTitle') as string,
      metaDescription: formData.get('metaDescription') as string,
      metaKeywords: formData.get('metaKeywords') as string,
      imageUrl: formData.get('imageUrl') as string, // Valid URL from Cloudinary
      content: content, 
    };

    // Basic Validation
    if (!rawData.headline || !rawData.content || !rawData.blogUrl) {
        return { success: false, error: "Missing required fields: Headline, URL, or Content." };
    }

    await prisma.blog.create({
      data: rawData
    });

    revalidatePath('/admin/blogs');
    return { success: true };
  } catch (error) {
    console.error("Create Blog Error:", error);
    return { success: false, error: "Failed to create blog. The URL Slug might already exist." };
  }
}

// 2. Delete Blog
export async function deleteBlog(id: string) {
    try {
        await prisma.blog.delete({ where: { id } });
        revalidatePath('/admin/blogs');
        return { success: true };
    } catch (error) {
        console.error("Delete Error:", error);
        return { success: false, error: "Failed to delete blog." };
    }
}

export async function updateBlog(id: string, formData: FormData, content: string) {
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

    await prisma.blog.update({
      where: { id },
      data: rawData
    });

    revalidatePath('/admin/blogs');
    revalidatePath(`/blog/${rawData.blogUrl}`); // Revalidate the specific blog page
    return { success: true };
  } catch (error) {
    console.error("Update Blog Error:", error);
    return { success: false, error: "Failed to update blog." };
  }
}


export async function linkCategoryToBlog(blogId: string, categoryId: string | null,city: string | null) {
  try {
    await prisma.blog.update({
      where: { id: blogId },
      data: { linkedCategoryId: categoryId,linkedCity:city }
    });
    
    revalidatePath("/admin/blogs");
    return { success: true };
  } catch (error) {
    console.error("Failed to link category:", error);
    return { success: false, error: "Failed to update blog settings." };
  }
}