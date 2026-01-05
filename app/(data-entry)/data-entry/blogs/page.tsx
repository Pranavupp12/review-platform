import { prisma } from "@/lib/prisma";
import { BlogManagement } from "@/components/admin_components/blog-components/blog-management"; // ✅ Reusing your existing component
import { Prisma } from "@prisma/client";

// Force dynamic rendering so staff always see the latest posts
export const dynamic = 'force-dynamic';

export const metadata = { title: 'Blog Management - Data Entry' };

type PageProps = {
  searchParams: Promise<{ 
    page?: string;
    query?: string;
    category?: string;
  }>;
};

export default async function DataEntryBlogPage({ searchParams }: PageProps) {
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

  // 4. Fetch Data (Identical to Admin Page)
  const [blogs, totalCount, distinctBlogCategories, allCompanyCategories, distinctCities] = await Promise.all([
    // A. Fetch Blogs
    prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: pageSize,
      select: { 
         // --- Existing Fields (For Table) ---
         id: true, 
         headline: true, 
         blogUrl: true, 
         category: true, 
         createdAt: true, 
         imageUrl: true, 
         authorName: true,
         linkedCategoryId: true,
         linkedCity: true,

         // --- ✅ NEW FIELDS (Required for Edit Modal) ---
         content: true,
         metaTitle: true,
         metaDescription: true,
         metaKeywords: true
      }
    }),
    
    // B. Count Total Blogs
    prisma.blog.count({ where }),

    // C. Fetch Blog Categories for Filter
    prisma.blog.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    }),

    // D. Fetch Company Categories for Linking
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),

    // E. Fetch Cities for Linking
    prisma.company.findMany({
       select: { city: true },
       distinct: ['city'],
       where: { city: { not: null } },
       orderBy: { city: 'asc' }
    }),
  ]);

  // Extract strings for dropdowns
  const uniqueBlogCategories = distinctBlogCategories
    .map(b => b.category)
    .filter((c): c is string => !!c);

  const uniqueCities = distinctCities
    .map(c => c.city)
    .filter((c): c is string => !!c);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Header specific to Data Entry */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#000032]">Blog Management</h1>
        <p className="text-gray-500">
           Data Entry Portal: Create and manage articles.
        </p>
      </div>

      {/* ✅ Reuse the exact same Client Component */}
      <BlogManagement 
        initialBlogs={blogs} 
        uniqueCategories={uniqueBlogCategories} 
        companyCategories={allCompanyCategories} 
        cityOptions={uniqueCities} 
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
      />
    </div>
  );
}