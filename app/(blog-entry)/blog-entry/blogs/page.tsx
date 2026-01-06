import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BlogManagement } from "@/components/admin_components/blog-components/blog-management";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Blog Management - Blog Entry' };

type PageProps = {
  searchParams: Promise<{ 
    page?: string;
    query?: string;
    category?: string;
  }>;
};

export default async function BlogEntryManagementPage({ searchParams }: PageProps) {
  const session = await auth();
  
  // 🔒 Security Check
  // @ts-ignore
  if (!session || (session.user.role !== "BLOG_ENTRY" && session.user.role !== "ADMIN")) {
    return redirect("/admin/login");
  }

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

  // 4. Fetch Data
  const [blogs, totalCount, distinctBlogCategories, allCompanyCategories, distinctCities] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: pageSize,
      select: { 
         id: true, 
         headline: true, 
         blogUrl: true, 
         category: true, 
         createdAt: true, 
         imageUrl: true, 
         authorName: true,
         linkedCategoryId: true,
         linkedCity: true,
         linkedCategory: true,
         content: true,
         metaTitle: true,
         metaDescription: true,
         metaKeywords: true
      }
    }),
    prisma.blog.count({ where }),
    prisma.blog.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    }),
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

  const uniqueBlogCategories = distinctBlogCategories.map(b => b.category).filter((c): c is string => !!c);
  const uniqueCities = distinctCities.map(c => c.city).filter((c): c is string => !!c);
  
  // Format categories correctly for the component
  const formattedCompanyCategories = allCompanyCategories.map(c => ({ id: c.id, name: c.name }));

  return (
    // ✅ FIX: Use 'max-w-7xl' (matches Data Entry) and 'overflow-x-hidden' (prevents scrollbar)
    <div className="max-w-xl lg:max-w-5xl mx-auto pb-20 px-4 md:px-6 overflow-x-hidden">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage Blogs</h1>
        <p className="text-gray-500">Create, edit, and publish content.</p>
      </div>

      <div className="w-full">
        <BlogManagement 
          initialBlogs={blogs} 
          uniqueCategories={uniqueBlogCategories}
          companyCategories={formattedCompanyCategories}
          cityOptions={uniqueCities}
          totalCount={totalCount}
          currentPage={page}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}