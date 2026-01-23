import Link from "next/link";
import { getAllBlogsByCategory } from "@/lib/blog-utils";
import { BlogCard } from "@/components/blog-components/blog-card"; 
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const categoryName = decodeURIComponent(resolvedParams.category);
  
  const blogs = await getAllBlogsByCategory(categoryName);

  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* 1. FULL WIDTH HEADER SECTION */}
      <div className="w-full bg-gray-100 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
           <Link 
             href="/blog" 
             className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#0ABED6] hover:underline mb-6 transition-colors"
           >
              <ArrowLeft className="w-4 h-4 mr-2" /> <TranslatableText text="Back to All Blogs" />
           </Link>
           
           <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 capitalize tracking-tight">
             <TranslatableText text={categoryName} />
           </h1>
           <p className="mt-4 text-gray-500 text-lg max-w-2xl">
              <TranslatableText text="Latest news, updates, and insights about" /> <TranslatableText text={categoryName} />.
           </p>
        </div>
      </div>

      {/* 2. BLOG CARDS GRID SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                <TranslatableText text="No blogs found" />
            </h2>
            <p className="text-gray-500 mb-6">
              <TranslatableText text="It looks like there aren't any posts in the" /> {categoryName} <TranslatableText text="category yet." />
            </p>
            <Button asChild>
              <Link href="/blog">
                  <TranslatableText text="Browse Other Categories" />
              </Link>
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}