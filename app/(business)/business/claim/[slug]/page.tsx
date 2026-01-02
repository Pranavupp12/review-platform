import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { ClaimBusinessForm } from "@/components/business_auth/claim-business-form";
import { BlockRating } from "@/components/shared/block-rating";

export default async function BusinessClaimPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // 1. Fetch Company Data
    const company = await prisma.company.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            rating: true,
            reviewCount: true,
            websiteUrl: true,
            claimed: true,
            logoImage: true
        }
    });

    if (!company) return notFound();

    // 2. If already claimed, redirect to login
    if (company.claimed) {
        return redirect('/business/login?error=already_claimed');
    }

    const getRatingAdjective = (rating: number) => {
    if (rating === 0) return "Not Rated";
    if (rating >= 4.0) return "Excellent";
    if (rating >= 3.5) return "Great";
    if (rating >= 3.0) return "Average";
    if (rating >= 2.0) return "Poor";
    return "Bad";
  };

  const ratingAdjective = getRatingAdjective(company.rating || 0);

    return (
        <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">

            {/* --- TOP HERO SECTION (White) --- */}
            <div className=" pb-32 pt-24">
                <div className="container mx-auto px-4 text-center max-w-4xl">

                    {/* Company Name & URL */}
                    <h1 className="text-4xl md:text-5xl font-bold text-black mb-2">
                        {company.name}
                    </h1>
                    <p className="text-gray-500 mb-8">{company.websiteUrl || "Your Business Profile"}</p>

                    {/* TRUST SCORE BLOCK */}
                    <div className="flex flex-col items-center animate-in zoom-in duration-500 delay-100">
                        <span className="text-gray-900 font-medium mb-2 text-lg">Your TrustScore</span>

                        <h2 className="text-5xl md:text-6xl font-bold text-black mb-4 tracking-tight">
                           {ratingAdjective}
                        </h2>

                        {/* Stars */}
                        <div className="mb-3">
                            <BlockRating value={company.rating} size="lg" />
                        </div>

                        <div className="flex items-center gap-2 text-lg">
                            <span className="font-bold text-[#000032]">{company.rating.toFixed(1)}/5</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 underline decoration-gray-300 underline-offset-4">
                                {company.reviewCount} Reviews received
                            </span>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- GREEN CURVE BACKGROUND --- */}
            {/* This mimics the green wave in your screenshot */}
            <div className="absolute top-[500px] left-0 right-0 h-[500px] bg-[#0892A5] -skew-y-3 transform origin-top-left z-0" />

            {/* --- CONTENT OVERLAY --- */}
            <div className="container mx-auto px-4 relative z-10 -mt-20 md:-mt-24 pb-20">
                <div className="grid lg:grid-cols-2 gap-12 items-start">

                    {/* LEFT: Value Props (Only visible on Desktop) */}
                    <div className="hidden lg:block pt-20 text-white/90 space-y-8">
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                            <h3 className="text-2xl font-bold text-white mb-4">Why claim your profile?</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="h-6 w-6 text-white shrink-0" />
                                    <span className="text-lg">Reply to customer reviews and build trust.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="h-6 w-6 text-white shrink-0" />
                                    <span className="text-lg">Customize your page with logo and description.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="h-6 w-6 text-white shrink-0" />
                                    <span className="text-lg">Access analytics on profile views and sentiment.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* RIGHT: The Form */}
                    <div className="w-full max-w-lg mx-auto lg:mr-0">
                        <ClaimBusinessForm
                            companyId={company.id}
                            companyName={company.name}
                        />
                    </div>

                </div>
            </div>

        </div>
    );
}