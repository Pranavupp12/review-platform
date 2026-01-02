import Link from "next/link";
import { getFeaturedBlog, getBlogsByCategory, getDistinctCategories } from "@/lib/blog-utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { FeaturedBlogCard } from "@/components/blog-components/featured-blog-card";
import { BlogCard } from "@/components/blog-components/blog-card";

export const dynamic = 'force-dynamic'; 

export default async function BlogPage() {
  const featuredBlogData = getFeaturedBlog();
  const categoriesData = getDistinctCategories();

  const [featuredBlog, categories] = await Promise.all([
    featuredBlogData,
    categoriesData
  ]);

  const categorySections = await Promise.all(
    categories.map(async (cat) => ({
      name: cat,
      blogs: await getBlogsByCategory(cat, 4)
    }))
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* 1. TOP SUB NAVBAR (Sticky) */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Heading */}
            <h1 className="text-xl font-bold text-gray-900 shrink-0">
              Help Blogs
            </h1>

            {/* Right: Nav Links */}
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pl-4">
              <Link 
                  href="/blog" 
                  className="text-sm font-medium text-[#0ABED6] whitespace-nowrap transition-colors"
              >
                  Featured
              </Link>
              {categories.length > 0 ? (
                  categories.map((cat) => (
                  <Link 
                      key={cat} 
                      href={`#${cat.toLowerCase()}`} 
                      className="text-sm font-medium text-gray-500 hover:text-[#0ABED6] whitespace-nowrap transition-colors"
                  >
                      {cat}
                  </Link>
                  ))
              ) : (
                  <span className="text-sm text-gray-400 italic">No categories</span>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 2. FEATURED BLOG HERO */}
      {featuredBlog && (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
           <FeaturedBlogCard blog={featuredBlog} />
        </section>
      )}

      {/* 3. DYNAMIC CATEGORY GRIDS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {categorySections.length === 0 && (
            <div className="text-center py-20 text-gray-500">
                <h2 className="text-xl font-semibold">No blogs found</h2>
                <p>Check back later for updates!</p>
            </div>
        )}

        {categorySections.map((section) => (
          section.blogs.length > 0 && (
            <section key={section.name} id={section.name.toLowerCase()} className="scroll-mt-24">
              
              {/* Section Header */}
              <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">{section.name}</h2>
                <Button variant="ghost" className="text-black hover:text-[#0ABED6] hover:underline " asChild>
                  <Link href={`/blog/category/${encodeURIComponent(section.name)}`}>
                    See more blogs <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                {section.blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            </section>
          )
        ))}
      </div>
    </div>
  );
}