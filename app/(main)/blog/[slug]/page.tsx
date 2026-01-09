import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CompanyListCard } from '@/components/categories_components/company-list-card';

// Define type based on what the Card needs
type TopCompany = {
  id: string;
  name: string;
  slug: string;
  logoImage: string | null;
  websiteUrl: string | null;
  address: string | null;
  badges: string[];
  rating: number;
  _count: {
    reviews: number;
  };
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await prisma.blog.findFirst({
    where: { blogUrl: slug },
    select: { headline: true }
  });
  if (!blog) return { title: 'Not Found' };
  
  return { title: blog.headline };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // 1. Fetch Blog & Linked Category
  const blog = await prisma.blog.findFirst({
    where: { blogUrl: slug },
    include: {
      linkedCategory: true
    }
  });

  if (!blog) return notFound();

  // 2. Fetch Top 10 Companies (Only if linked)
  let topCompanies: TopCompany[] = [];
  let listTitle = "";

  if (blog.linkedCategoryId) {
    const whereClause: any = {
       categoryId: blog.linkedCategoryId
    };

    if (blog.linkedCity) {
       whereClause.city = { equals: blog.linkedCity, mode: 'insensitive' };
    }

    topCompanies = await prisma.company.findMany({
      where: whereClause,
      orderBy: { rating: 'desc' },
      take: 10,
      select: { 
        id: true, 
        name: true, 
        slug: true, 
        logoImage: true, 
        rating: true, 
        websiteUrl: true, 
        address: true,    
        badges: true,     
        _count: { select: { reviews: true } } 
      }
    });

    listTitle = blog.linkedCity 
     ? `Top 10 ${blog.linkedCategory?.name} Companies in ${blog.linkedCity}`
     : `Top 10 ${blog.linkedCategory?.name} Companies`;
  } // ✅ CLOSED THE IF BLOCK HERE

  // ✅ RETURN STATEMENT IS NOW ACCESSIBLE TO ALL BLOGS
  return (
    <div className="min-h-screen bg-white pb-20">
       
       {/* 1. HEADER SECTION */}
       <div className="bg-gray-50 border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
                <Link href="/blog" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#0ABED6] mb-8 transition-colors">
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Blog
                </Link>
                
                <div className="space-y-6">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#0892A5] text-white text-xs font-bold uppercase tracking-wide">
                        {blog.category}
                    </span>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                        {blog.headline}
                    </h1>

                    <div className="flex items-center gap-3 pt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{blog.authorName}</span>
                        </div>
                        <p>|</p>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(blog.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
       </div>

       {/* 2. COVER IMAGE */}
       {blog.imageUrl && (
            <div className="w-full pb-12 pt-12 md:pt-20 md:pb-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden">
                        <Image
                            src={blog.imageUrl}
                            alt={blog.headline}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
            </div>
        )}

       {/* 3. MAIN CONTENT */}
       <div className="max-w-5xl mx-auto px-4 sm:px-6">
           <div className={!blog.imageUrl ? "pt-12" : ""}>
               <div 
                  dangerouslySetInnerHTML={{ __html: blog.content }} 
                  className="prose prose-lg prose-blue max-w-none text-gray-700 
                             prose-headings:font-bold prose-headings:text-gray-900 
                             prose-a:text-[#0ABED6] prose-img:rounded-xl" 
               />
           </div>
       </div>

       {/* 4. TOP 10 LIST SECTION (Conditional) */}
       {blog.linkedCategory && topCompanies.length > 0 && (
         <div className="pt-16 mt-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="text-center p-8 pb-4">
                        <Badge className="mb-3 bg-[#0ABED6] hover:bg-[#09A8BD] border-none text-white px-3 py-1 text-sm">
                            Recommended
                        </Badge>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#000032] mb-2">
                           {listTitle}
                        </h2>
                        <p className="text-gray-500">
                            Based on verified user reviews and platform ratings
                        </p>
                    </div>

                    <div className="divide-y divide-gray-200 border-t border-gray-200">
                        {topCompanies.map((company) => (
                            <CompanyListCard
                                key={company.id}
                                id={company.id}
                                slug={company.slug}
                                name={company.name}
                                logoImage={company.logoImage}
                                websiteUrl={company.websiteUrl}
                                address={company.address}
                                rating={company.rating}
                                badges={company.badges}
                                reviewCount={company._count.reviews} 
                                trackingContext={{
                                    query: `Blog Post: ${blog.headline}`,
                                    location: "Global"
                                }}
                            />
                        ))}
                    </div>
                    
                    <div className="p-6 text-center bg-white border-t border-gray-200">
                        <Link 
                            href={`/categories/${blog.linkedCategory.slug}`} 
                            className="inline-flex items-center text-sm font-semibold text-[#0ABED6] hover:underline transition-colors"
                        >
                            View all companies in {blog.linkedCategory.name} &rarr;
                        </Link>
                    </div>
                </div>
            </div>
         </div>
       )}
    </div>
  );
}