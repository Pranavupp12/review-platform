import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Share } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

// 1. UPDATE INTERFACE: params is now a Promise
interface PageProps {
  params: Promise<{
    updateId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // 2. AWAIT PARAMS HERE
  const { updateId } = await params;

  const update = await prisma.businessUpdate.findUnique({
    where: { id: updateId },
    include: { company: true },
  });

  if (!update) return { title: "Update Not Found" };

  return {
    title: `${update.title} - ${update.company.name}`,
    description: update.content.substring(0, 160),
    openGraph: {
      images: [update.imageUrl],
    },
  };
}

export default async function PublicUpdatePage({ params }: PageProps) {
  // 3. AWAIT PARAMS HERE BEFORE USING IT
  const { updateId } = await params;

  // 4. Use the awaited 'updateId' variable
  const update = await prisma.businessUpdate.findUnique({
    where: { id: updateId },
    include: { 
      company: true 
    },
  });

  if (!update) {
    notFound();
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-6xl w-full bg-white overflow-hidden">
        
        {/* Header: Company Info */}
        <div className="p-2 flex items-center justify-between">
          <Link href={`/company/${update.company.slug}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <Avatar className="h-12 w-35 ">
              <AvatarImage src={update.company.logoImage || ''} />
              <AvatarFallback>{update.company.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {update.company.name}
              </h2>
              <p className="text-sm text-gray-500">
                Posted on {format(new Date(update.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </Link>
        </div>

        {/* Hero Image */}
        <div className="relative w-full h-[300px] md:h-[400px] bg-gray-50">
          <Image
            src={update.imageUrl}
            alt={update.title}
            fill
            className="object-contain p-4"
          />
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            {update.title}
          </h1>

          <div className="prose prose-lg text-gray-700 max-w-none whitespace-pre-line mb-10">
            {update.content}
          </div>

        </div>
      </div>
    </div>
  );
}