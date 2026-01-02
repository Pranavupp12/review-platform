import { prisma } from "@/lib/prisma";
import { BlogManagement } from "@/components/admin_components/blog-components/blog-management";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Blog Management - Admin' };

type PageProps = {
  searchParams: Promise<{ 
    page?: string;
    query?: string;
    category?: string;
  }>;
};

export default async function AdminBlogPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  
  // 1. Pagination Setup
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  // 2. Filters Setup
  const query = resolvedSearchParams.query || "";
  const category = resolvedSearchParams.category || "";

  // 3. Build Prisma Where Clause
  const where: Prisma.BlogWhereInput = {};

  if (query) {
    where.OR = [
      { headline: { contains: query, mode: 'insensitive' } },
      { authorName: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = { equals: category, mode: 'insensitive' };
  }

  // 4. Fetch Data in Parallel
  const [blogs, totalCount, distinctBlogCategories, allCompanyCategories,distinctCities] = await Promise.all([
    // A. Fetch Blogs
    prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: pageSize,
      select: { 
         id: true, headline: true, blogUrl: true, category: true, 
         createdAt: true, imageUrl: true, authorName: true,
         linkedCategoryId: true ,
         linkedCity:true,
      }
    }),
    
    // B. Count Total Blogs
    prisma.blog.count({ where }),

    // C. Fetch "Blog Categories" (Strings: News, Updates, etc.)
    // Used for the filter dropdown on this page
    prisma.blog.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    }),

    // D. Fetch "Company Categories" (IDs: Software, Plumbing, etc.)
    // Used for the "Attach Top 10 List" modal
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),

    prisma.company.findMany({
       select: { city: true },
       distinct: ['city'],
       where: { city: { not: null } },
       orderBy: { city: 'asc' }
    }),

  ]);

  // Extract strings for the blog filter dropdown
  const uniqueBlogCategories = distinctBlogCategories
    .map(b => b.category)
    .filter((c): c is string => !!c);

  const uniqueCities = distinctCities.map(c => c.city).filter((c): c is string => !!c);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
        <p className="text-gray-500">Create, edit, and manage your platform's content.</p>
      </div>

      <BlogManagement 
        initialBlogs={blogs} 
        uniqueCategories={uniqueBlogCategories} // For the Filter Dropdown (Strings)
        companyCategories={allCompanyCategories} // For the Link Modal (IDs) ✅
        cityOptions={uniqueCities} 
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
      />
    </div>
  );
}