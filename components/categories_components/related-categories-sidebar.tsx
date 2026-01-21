import Link from "next/link";
import { getCategoryIcon } from "@/lib/category-icons";
import { CornerDownRight } from "lucide-react";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

interface RelatedCategoriesSidebarProps {
  categoryName: string;
  categorySlug: string;
  subCategories: { id: string; name: string; slug: string }[];
}

export function RelatedCategoriesSidebar({
  categoryName,
  categorySlug,
  subCategories,
}: RelatedCategoriesSidebarProps) {
  const CategoryIcon = getCategoryIcon(categoryName);

  return (
    <div className="bg-white border border-gray-200 p-6 sticky top-24 h-fit">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        <TranslatableText text="Related categories" />
      </h3>
      
      <div className="space-y-2">
        {subCategories.length > 0 ? (
          subCategories.map((sub) => {
            const href = `/categories/${categorySlug}/${sub.slug}`;
            
            return (
              <Link 
                key={sub.id} 
                href={href}
                className="group flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                {/* Icon Box */}
                <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm group-hover:border-gray-200 transition-all">
                  <CategoryIcon className="h-5 w-5 text-gray-500 group-hover:text-[#0ABED6]" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  {/* Top Line: Subcategory Name */}
                  <p className="text-sm font-bold text-gray-900 group-hover:text-[#0ABED6] transition-colors truncate">
                    <TranslatableText text={sub.name} />
                  </p>
                  
                  {/* Bottom Line: Parent Pointer */}
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 group-hover:text-gray-600">
                    <CornerDownRight className="h-3 w-3 text-[#0892A5]" />
                    <span className="truncate">
                        <TranslatableText text={categoryName} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 italic">
            <TranslatableText text="No subcategories available." />
          </p>
        )}
      </div>

      {/* Footer Link */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link
          href={`/categories/${categorySlug}`}
          className="block text-center text-sm font-bold text-[#0ABED6] hover:underline"
        >
          <TranslatableText text="View all in" /> <TranslatableText text={categoryName} />
        </Link>
      </div>
    </div>
  );
}