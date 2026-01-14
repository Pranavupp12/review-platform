import { prisma } from '@/lib/prisma';
import { MapPin, Globe, Star, BarChart3, Inbox, Lock } from 'lucide-react';
import { DeleteItemButton } from '@/components/admin_components/delete-item-button';
import { adminDeleteCompany } from '@/lib/actions';
import { CompanyModal } from '@/components/admin_components/company-modal';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { CompanyDetailsModal } from '@/components/admin_components/company-details-modal';
import { FeaturedToggle } from '@/components/admin_components/featured-toggle';
import { CompanyFilters } from '@/components/admin_components/page-filters/company-filters';
import { FreezeCompanyDialog } from "@/components/admin_components/freeze-company-dialog"; 
import { auth } from '@/auth'; // ✅ 1. Import Auth
import { Prisma } from '@prisma/client';

export const metadata = { title: 'Manage Companies - Admin' };

type PageProps = {
  searchParams: Promise<{
    page?: string;
    query?: string;
    categoryId?: string;
    status?: string;
  }>;
};

export default async function AdminCompaniesPage({ searchParams }: PageProps) {

  const session = await auth();
  // @ts-ignore
  const userRole = session?.user?.role || "ADMIN";

  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const query = resolvedSearchParams.query || "";
  const categoryId = resolvedSearchParams.categoryId || "";
  const status = resolvedSearchParams.status || "";

  const where: Prisma.CompanyWhereInput = {};

  if (query) {
    where.name = { contains: query, mode: 'insensitive' };
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (status === 'claimed') {
    where.claimed = true;
  } else if (status === 'unclaimed') {
    where.claimed = false;
  }

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      subCategories: {
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  const [companies, totalCount] = await Promise.all([
    prisma.company.findMany({
      where,
      skip: skip,
      take: pageSize,
      include: {
        // Prisma `include` automatically fetches all scalar fields (like isFrozen, claimedAt)
        // so we don't need to explicitly select them here.
        category: true,
        subCategory: true,
        _count: { select: { reviews: true } }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.company.count({ where }),
  ]);

  return (
    <div className="max-w-7xl mx-auto pb-20">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Companies</h1>
          <p className="text-sm text-gray-500">View and manage business profiles</p>
        </div>
        <CompanyModal categories={categories} userRole={userRole} />
      </div>

      <CompanyFilters categories={categories} />

      {/* Table Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {companies.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
              <Inbox className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No companies found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Featured</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    // ✅ 2. Optional: Red tint if frozen
                    className={`transition-colors ${company.isFrozen ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden relative shrink-0">
                          {company.logoImage ? (
                            <Image src={company.logoImage} alt={company.name} fill className="object-contain p-1" />
                          ) : (
                            <span className="font-bold text-gray-400">{company.name[0]}</span>
                          )}
                        </div>
                        <div>
                          <Link href={`/company/${company.slug}`} target="_blank" className="font-bold text-gray-900 hover:underline">
                            {company.name}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /> {company.rating.toFixed(2)}</span>
                            {company.websiteUrl && (
                              <span className="flex items-center gap-1 max-w-[150px] truncate">
                                •<Globe className="h-3 w-3" /> {company.websiteUrl}
                              </span>
                            )}
                            <span>• {company._count.reviews} Reviews</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {company.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {company.city || 'Global'}
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      {company.isFrozen ? (
                        /* PRIORITY 1: If Frozen, show ONLY Frozen badge */
                        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded border border-red-200 flex items-center gap-1 w-fit">
                          <Lock className="h-3 w-3" /> FROZEN
                        </span>
                      ) : (
                        /* PRIORITY 2: If NOT Frozen, show Claimed/Unclaimed */
                        company.claimed ? (
                          <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                            ● Claimed
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs flex items-center gap-1">
                            ○ Unclaimed
                          </span>
                        )
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <FeaturedToggle
                        companyId={company.id}
                        isFeatured={company.featured}
                      />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">

                        {/* ✅ 4. ADD FREEZE MODAL HERE */}
                        {/* It handles the countdown logic internally */}
                        <FreezeCompanyDialog company={company} />

                        <CompanyDetailsModal company={company} />

                        <CompanyModal categories={categories} company={company} userRole={userRole} />

                        <DeleteItemButton
                          id={company.id}
                          itemName={company.name}
                          deleteAction={adminDeleteCompany}
                        />

                        <Link href={`/admin/companies/${company.id}/analytics`}>
                          <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50" title="View Analytics">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {companies.length > 0 && (
          <div className='pb-5'>
            <PaginationControls totalItems={totalCount} pageSize={pageSize} currentPage={page} />
          </div>
        )}
      </div>
    </div>
  );
}