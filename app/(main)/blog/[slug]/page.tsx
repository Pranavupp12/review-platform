import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CompanyListCard } from '@/components/categories_components/company-list-card';
import { TranslatableText } from "@/components/shared/translatable-text";
import { TranslatableHtml } from "@/components/shared/translatable-html";
import { Metadata } from "next";

// --- TYPES ---
type TopCompany = {
  id: string;
  name: string;
  slug: string;
  logoImage: string | null;
  websiteUrl: string | null;
  address: string | null;
  badges: string[];
  rating: number;
  _count: { reviews: number };
};

// --- HELPERS ---
function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// ✅ 1. SEO METADATA GENERATOR
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  const blog = await prisma.blog.findUnique({
    where: { blogUrl: slug },
    select: { 
      headline: true,
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
      authorName: true,
      category: true
    }
  });

  if (!blog) return { title: 'Not Found' };

  // Parse keywords from "tech, ai, news" -> ["tech", "ai", "news"]
  const keywordsList = blog.metaKeywords 
    ? blog.metaKeywords.split(',').map((k) => k.trim()) 
    : [];

  const title = blog.metaTitle || blog.headline;
  const description = blog.metaDescription;

  return {
    title: title,
    description: description,
    keywords: keywordsList,
    authors: [{ name: blog.authorName }],
    category: blog.category,
    
    // Open Graph (Facebook, LinkedIn, Discord)
    openGraph: {
      title: title,
      description: description,
      type: 'article',
      publishedTime: blog.createdAt.toISOString(),
      modifiedTime: blog.updatedAt.toISOString(),
      authors: [blog.authorName],
      images: blog.imageUrl ? [
        {
          url: blog.imageUrl,
          width: 1200,
          height: 630,
          alt: blog.headline,
        }
      ] : [],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: blog.imageUrl ? [blog.imageUrl] : [],
    }
  };
}

// --- MAIN PAGE COMPONENT ---
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // 1. Fetch Blog Data
  const blog = await prisma.blog.findUnique({
    where: { blogUrl: slug },
    include: {
      linkedCategory: true
    }
  });

  if (!blog) return notFound();

  // ✅ 2. Construct JSON-LD Schema (Structured Data for Google)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.headline,
    "description": blog.metaDescription,
    "image": blog.imageUrl ? [blog.imageUrl] : [],
    "author": {
      "@type": "Person",
      "name": blog.authorName
    },
    "datePublished": blog.createdAt.toISOString(),
    "dateModified": blog.updatedAt.toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://yourdomain.com/blog/${blog.blogUrl}` // Replace with actual domain
    }
  };

  // 3. Fetch Linked Companies Logic
  let topCompanies: TopCompany[] = [];
  let listTitlePrefix = "Top 10";
  let listTitleSuffix = "";

  if (blog.linkedCategoryId) {
    const whereClause: any = { categoryId: blog.linkedCategoryId };
    if (blog.linkedCity) {
       whereClause.city = { equals: blog.linkedCity, mode: 'insensitive' };
    }

    topCompanies = await prisma.company.findMany({
      where: whereClause,
      orderBy: { rating: 'desc' },
      take: 10,
      select: { 
        id: true, name: true, slug: true, logoImage: true, rating: true, 
        websiteUrl: true, address: true, badges: true, 
        _count: { select: { reviews: true } } 
      }
    });

    const categoryName = blog.linkedCategory?.name || "";
    const city = blog.linkedCity ? ` in ${blog.linkedCity}` : "";
    listTitleSuffix = `${categoryName} Companies${city}`;
  } 

  const dateStr = formatDate(blog.createdAt);

  return (
    <div className="min-h-screen bg-white pb-20">
       
       {/* ✅ Insert JSON-LD Script */}
       <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

       {/* HEADER SECTION */}
       <div className="bg-gray-100 border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
                <Link href="/blog" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#0ABED6] hover:underline mb-8 transition-colors">
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> <TranslatableText text="Back to Blog" />
                </Link>
                
                <div className="space-y-6">
                    <span className="inline-block  rounded-full  text-[#0892A5] text-sm font-bold uppercase tracking-wide">
                        <TranslatableText text={blog.category} />
                    </span>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                        <TranslatableText text={blog.headline} />
                    </h1>

                    <div className="flex items-center gap-3 pt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                                <TranslatableText text={blog.authorName} />
                            </span>
                        </div>
                        <p>|</p>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{dateStr}</span>
                        </div>
                    </div>
                </div>
            </div>
       </div>

       {/* COVER IMAGE */}
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

       {/* MAIN CONTENT */}
       <div className="max-w-5xl mx-auto px-4 sm:px-6">
           <div className={!blog.imageUrl ? "pt-12" : ""}>
               {/* Use the TranslatableHtml component we built earlier */}
               <TranslatableHtml 
                  content={blog.content} 
                  className="prose prose-lg prose-blue max-w-none text-gray-700 
                             prose-headings:font-bold prose-headings:text-gray-900 
                             prose-a:text-[#0ABED6] prose-img:rounded-xl"
               />
           </div>
       </div>

       {/* TOP 10 LIST SECTION (Conditional) */}
       {blog.linkedCategory && topCompanies.length > 0 && (
         <div className="pt-16 mt-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="text-center p-8 pb-4">
                        <Badge className="mb-3 bg-[#0ABED6] hover:bg-[#09A8BD] border-none text-white px-3 py-1 text-sm">
                            <TranslatableText text="Recommended" />
                        </Badge>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#000032] mb-2">
                           <TranslatableText text={listTitlePrefix} /> {listTitleSuffix}
                        </h2>
                        <p className="text-gray-500">
                            <TranslatableText text="Based on verified user reviews and platform ratings" />
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
                            <TranslatableText text="View all companies in" /> {blog.linkedCategory.name} &rarr;
                        </Link>
                    </div>
                </div>
            </div>
         </div>
       )}
    </div>
  );
}