import Link from "next/link";
import Image from "next/image";
import {format} from 'date-fns'
// ✅ Import Translator
import { TranslatableText } from "@/components/shared/translatable-text";

interface BlogCardProps {
  blog: {
    blogUrl: string;
    imageUrl: string | null;
    headline: string;
    category: string;
    metaDescription: string;
    createdAt: Date | string;
  };
}

export function BlogCard({ blog }: BlogCardProps) {
  const dateStr = format(new Date(blog.createdAt), "dd MMM, yyyy");

  return (
    <Link href={`/blog/${blog.blogUrl}`} className="group h-full flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-4 border shadow-sm">
        {blog.imageUrl ? (
          <Image
            src={blog.imageUrl}
            alt={blog.headline}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-gray-300 text-sm">
            <TranslatableText text="No Image" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <span className="text-xs font-semibold text-[#0892A5] mb-2 uppercase tracking-wide">
          <TranslatableText text={blog.category} />
        </span>
        <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 group-hover:text-[#0892A5] hover:underline transition-colors line-clamp-2">
           <TranslatableText text={blog.headline} />
        </h3>
        <div className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
           <TranslatableText text={blog.metaDescription} />
        </div>
        <div className="mt-auto pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-medium">
            <TranslatableText text={dateStr} />
          </span>
        </div>
      </div>
    </Link>
  );
}