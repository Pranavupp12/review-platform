import Link from "next/link";
import Image from "next/image";
import {format} from 'date-fns'

interface FeaturedBlogCardProps {
  blog: {
    blogUrl: string;
    imageUrl: string | null;
    headline: string;
    category: string;
    metaDescription: string;
    authorName: string;
    createdAt: Date | string;
  };
}

export function FeaturedBlogCard({ blog }: FeaturedBlogCardProps) {
  return (
    <Link href={`/blog/${blog.blogUrl}`} className="group block">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Image Side */}
        <div className="relative aspect-[16/9] lg:aspect-[3/2] w-full rounded-2xl overflow-hidden bg-gray-100 shadow-sm border">
          {blog.imageUrl ? (
            <Image
              src={blog.imageUrl}
              alt={blog.headline}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-400">
              No Image
            </div>
          )}
        </div>

        {/* Text Side */}
        {/* 👇 CHANGED: Removed lg:col-span-4. It now naturally takes the second half. */}
        <div className="flex flex-col justify-center space-y-4">
          <span className="text-sm font-semibold text-[#0892A5] uppercase tracking-wider">
            Featured • {blog.category}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight group-hover:text-[#0892A5] hover:underline transition-colors">
            {blog.headline}
          </h1>
          <p className="text-gray-500 text-lg line-clamp-3 leading-relaxed">
            {blog.metaDescription}
          </p>
          <div className="flex items-center gap-3 pt-4">
            <div className="h-10 w-10 rounded-full bg-[#0ABED6]/30 flex items-center justify-center text-sm font-bold text-[#0892A5]">
              {blog.authorName.charAt(0)}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900 block">{blog.authorName}</span>
              <span className="text-gray-400">
                 {format(new Date(blog.createdAt),"dd MMM,yyyy")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}