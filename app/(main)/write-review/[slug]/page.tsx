import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WriteReviewPageForm } from "@/components/company_components/write-review-page-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WriteReviewPage({ params }: PageProps) {
  const session = await auth();
  const { slug } = await params;

  // 1. Fetch Company
  const company = await prisma.company.findUnique({
    where: { slug },
    select: {
       id: true,
       name: true,
       slug: true,
       logoImage: true,
       websiteUrl: true
    }
  });

  if (!company) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
       
       <div className="max-w-2xl mx-auto mb-8 text-center">
          {/* Header Info */}
          <div className="flex flex-col items-center gap-4">
             <Avatar className="h-20 w-40">
                <AvatarImage src={company.logoImage || ""} />
                <AvatarFallback className="text-xl font-bold bg-[#000032] text-white">
                    {company.name[0]}
                </AvatarFallback>
             </Avatar>
             
             <div>
                <h1 className="text-2xl font-bold text-[#000032]">
                   Write a review for {company.name}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                   {company.websiteUrl}
                </p>
             </div>
          </div>
       </div>

       {/* The Form Component */}
       <WriteReviewPageForm 
          companyId={company.id}
          companyName={company.name}
          companySlug={company.slug}
          isLoggedIn={!!session?.user}
       />

    </div>
  );
}