// lib/blog-utils.ts
import { prisma } from "@/lib/prisma";

// 1. Fetch Random Featured Blog
export async function getFeaturedBlog() {
  const count = await prisma.blog.count();
  if (count === 0) return null;
  
  const skip = Math.floor(Math.random() * count);
  return await prisma.blog.findFirst({
    skip: skip,
    orderBy: { createdAt: 'desc' }
  });
}

// 2. Fetch Unique Categories from DB
export async function getDistinctCategories() {
  const categories = await prisma.blog.findMany({
    distinct: ['category'],
    select: {
      category: true,
    },
    orderBy: {
      category: 'asc', // Sort A-Z
    },
  });

  // Return just the array of strings: ["Business", "Tech", "Updates"]
  return categories.map((c) => c.category);
}

// 3. Fetch Limited Blogs per Category (for the main page)
export async function getBlogsByCategory(category: string, limit = 4) {
  return await prisma.blog.findMany({
    where: { 
      category: { equals: category, mode: 'insensitive' } 
    },
    take: limit,
    orderBy: { createdAt: 'desc' }
  });
}

// 4. Fetch All Blogs (for the category specific page)
export async function getAllBlogsByCategory(category: string) {
  return await prisma.blog.findMany({
    where: { 
      category: { equals: category, mode: 'insensitive' } 
    },
    orderBy: { createdAt: 'desc' }
  });
}