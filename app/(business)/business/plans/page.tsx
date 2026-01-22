"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

// --- CONFIGURATION ---

const PLANS = [
  {
    name: "Free",
    slug: "free",
    price: { monthly: 0, yearly: 0 },
    description: "Essential tools to claim your profile and start collecting reviews.",
    buttonText: "Get Started",
    popular: false,
    features: [
      "Claimed Profile Status",
      "Basic Analytics (TrustScore)",
      "Respond to Reviews",
      "Standard Support",
    ],
  },
  {
    name: "Growth",
    slug: "growth",
    price: { monthly: 20, yearly: 240 },
    description: "Stand out from the crowd with verified badges and rich content.",
    buttonText: "Start Growth Trial",
    popular: true,
    features: [
      "Everything in Free, plus:",
      "Verified Business Badge",
      "Full Analytics (Search & PPC)",
      "Post Business Updates",
      "Upload Products & Services",
      "Remove Competitor Carousel",
      "Lead Gen CTA Banner",
      "Email Campaigns (Limited)",
    ],
  },
  {
    name: "Scale",
    slug: "scale",
    price: { monthly: 40, yearly: 480 },
    description: "Maximize visibility with category sponsorship and priority support.",
    buttonText: "Upgrade to Scale",
    popular: false,
    features: [
      "Everything in Growth, plus:",
      "Category Sponsorship (Top Rank)",
      "Higher Email Limits",
      "Dedicated Success Manager",
    ],
  },
  {
    name: "Custom",
    slug: "custom",
    price: { monthly: "Custom", yearly: "Custom" },
    description: "Enterprise-grade solutions for multi-location brands.",
    buttonText: "Contact Sales",
    popular: false,
    features: [
      "Custom Sponsorship Scope",
      "Unlimited Email Campaigns",
    ],
  },
];

const COMPARISON_FEATURES = [
  {
    category: "Profile & Branding",
    items: [
      { name: "Claimed Profile Status", free: true, growth: true, scale: true, custom: true },
      { name: "Verified Business Badge", free: false, growth: true, scale: true, custom: true },
      { name: "Post Business Updates", free: false, growth: true, scale: true, custom: true },
      { name: "Product/Service Uploads", free: false, growth: true, scale: true, custom: true },
    ],
  },
  {
    category: "Growth & Visibility",
    items: [
      { name: "Remove Competitor Carousel", free: false, growth: true, scale: true, custom: true },
      { name: "Lead Gen CTA Banner", free: false, growth: true, scale: true, custom: true },
      { name: "Category Sponsorship", free: false, growth: false, scale: true, custom: "Custom Scope" },
    ],
  },
  {
    category: "Analytics & Data",
    items: [
      { name: "Basic Analytics (TrustScore)", free: true, growth: true, scale: true, custom: true },
      { name: "Full Analytics (Search & PPC)", free: false, growth: true, scale: true, custom: true },
    ],
  },
  {
    category: "Marketing Tools",
    items: [
      { name: "Email Campaign Limits", free: "None", growth: "Standard", scale: "High Volume", custom: "Unlimited" },
    ],
  },
];

// --- COMPONENTS ---

function FAQSection() {
  const faqs = [
    {
      question: "Can companies delete bad reviews?",
      answer: "No. Companies cannot delete reviews. They can report a review to our moderation team if they believe it violates our guidelines (e.g., hate speech, spam, conflict of interest). If our team finds no violation, the review stays up, no matter how negative it is."
    },
    {
      question: "Can companies pay to improve their star rating?",
      answer: "Absolutely not. We do not sell better ratings, and companies cannot pay us to hide negative reviews. Our business model is based on selling analytics and customer engagement tools, not on manipulating the truth."
    },
    {
      question: "How do you know if a review is real?",
      answer: "We use a combination of automated fraud-detection algorithms and manual review by our Content Integrity Team. We look for patterns like IP address spoofing, bulk posting, and suspicious timing. We also allow the community to flag suspicious content."
    },
    {
      question: "What does the 'Verified Company' badge mean?",
      answer: "A 'Verified Company' badge means the business has claimed their profile, verified their contact details, and actively manages their account. It does NOT mean they endorse or pay for the reviews on their page."
    },
    {
      question: "Do you edit reviews?",
      answer: "No. We never edit the text or star rating of a review. We believe in preserving the reviewer's original voice. If a review contains a small guideline violation (like a personal phone number), we ask the author to edit it themselves."
    },
    {
      question: "Can I update my review later?",
      answer: "Yes! If your experience with the company changes—for example, if they resolved your issue—you can edit your review at any time from your user dashboard to reflect the current situation."
    },
    {
      question: "Do I need a receipt to write a review?",
      answer: "Not necessarily. We accept reviews for service experiences (like customer support calls) even if no purchase was made. However, if a review is flagged, we may ask for documentation (like a receipt, screenshot, or email confirmation) to verify a genuine interaction occurred."
    },
    {
      question: "Why was my review removed?",
      answer: "Reviews are typically removed for violating our Guidelines. Common reasons include: hate speech, promotional content (spam), including personal private information, or if the review is not based on a genuine service experience."
    }
  ];

  return (
    <div className=" bg-gray-50 border-none mt-20">
      <div className="container mx-auto max-w-4xl px-4">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg font-medium text-gray-900 hover:text-[#0ABED6] transition-colors">
                <TranslatableText text={faq.question} />
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed pb-6 text-base">
                <TranslatableText text={faq.answer} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen pb-24 font-sans text-gray-900">
      
      {/* --- HERO HEADER --- */}
      <div className="relative bg-[#0892A5] pt-24 pb-20 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter leading-[1.1]">
            <TranslatableText text="Scale your reputation with" /> <span className="text-white"><TranslatableText text="confidence." /></span>
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto font-medium">
            <TranslatableText text="Choose the plan that fits your stage of growth. From basic profile management to dominating your category search results." />
          </p>

          {/* TOGGLE SWITCH */}
          <div className="pt-8 flex justify-center">
            <div className="inline-flex items-center p-1 bg-gray-100 rounded-full border border-gray-200">
                <button
                onClick={() => setIsYearly(false)}
                className={cn(
                    "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
                    !isYearly ? "bg-white text-[#0892A5] shadow-sm" : "text-gray-500 hover:text-gray-800"
                )}
                >
                <TranslatableText text="Monthly" />
                </button>
                <button
                onClick={() => setIsYearly(true)}
                className={cn(
                    "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                    isYearly ? "bg-white text-[#0892A5] shadow-sm" : "text-gray-500 hover:text-gray-800"
                )}
                >
                <TranslatableText text="Yearly" />
                <span className="bg-[#0ABED6]/10 text-[#0ABED6] text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                    -20%
                </span>
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- PRICING CARDS --- */}
      <div className="max-w-7xl mx-auto px-4 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.slug}
              className={cn(
                "group relative bg-white p-8 flex flex-col border transition-all duration-200",
                "rounded-2xl hover:shadow-xl hover:translate-y-[-4px]",
                plan.popular 
                  ? "border-[#0ABED6] shadow-lg ring-1 ring-[#0ABED6]/20" 
                  : "border-gray-200 shadow-sm hover:border-[#0ABED6]/50"
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-4 right-4">
                    <span className="bg-[#0ABED6] text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                        <TranslatableText text="Popular" />
                    </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                    <TranslatableText text={plan.name} />
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                    {typeof plan.price.monthly === "number" ? (
                        <>
                            <span className="text-4xl font-bold text-gray-900 tracking-tight">
                                ${isYearly ? plan.price.yearly : plan.price.monthly}
                            </span>
                            <span className="text-gray-500 font-medium text-sm">
                                /{isYearly ? <TranslatableText text="yr" /> : <TranslatableText text="mo" />}
                            </span>
                        </>
                    ) : (
                        <span className="text-3xl font-bold text-gray-900 tracking-tight">
                            <TranslatableText text="Custom" />
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500 mt-4 leading-relaxed h-10">
                  <TranslatableText text={plan.description} />
                </p>
              </div>

              {/* Action Button */}
              <Link href={plan.slug === 'custom' ? '/contact' : `/business/login`} className="w-full">
                <Button 
                  className={cn(
                    "w-full h-12 font-bold text-sm rounded-full transition-all",
                    plan.popular 
                      ? "bg-[#0ABED6] hover:bg-[#09A8BD] text-white" 
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  )}
                >
                  <TranslatableText text={plan.buttonText} />
                </Button>
              </Link>

              {/* Divider */}
              <div className="h-px w-full bg-gray-100 my-8" />

              {/* Features - No Icons, just clean list */}
              <div className="flex-1">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                    <TranslatableText text="Includes" />
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                      {/* Simple dot instead of icon for minimalism */}
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0ABED6] mt-2 shrink-0" />
                      <span className={cn(i === 0 && plan.slug !== 'free' ? "text-gray-900" : "")}>
                        <TranslatableText text={feature} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- COMPARISON TABLE --- */}
      <div className="max-w-6xl mx-auto px-4 mt-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            <TranslatableText text="Detailed Comparison" />
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 w-1/3">
                    <TranslatableText text="Features" />
                  </th>
                  <th className="p-5 text-center text-xs font-bold uppercase tracking-wider text-gray-900 w-1/6">
                    <TranslatableText text="Free" />
                  </th>
                  <th className="p-5 text-center text-xs font-bold uppercase tracking-wider text-[#0892A5] w-1/6">
                    <TranslatableText text="Growth" />
                  </th>
                  <th className="p-5 text-center text-xs font-bold uppercase tracking-wider text-[#0ABED6] w-1/6">
                    <TranslatableText text="Scale" />
                  </th>
                  <th className="p-5 text-center text-xs font-bold uppercase tracking-wider text-gray-900 w-1/6">
                    <TranslatableText text="Custom" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMPARISON_FEATURES.map((section, idx) => (
                  <Fragment key={section.category}>
                    {/* Category Header */}
                    <tr className="bg-gray-50/60">
                      <td colSpan={5} className="py-3 px-5 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                        <TranslatableText text={section.category} />
                      </td>
                    </tr>
                    
                    {/* Rows */}
                    {section.items.map((item, i) => (
                      <tr key={`${section.category}-${i}`} className="group hover:bg-gray-50 transition-colors">
                        <td className="p-5 text-sm font-medium text-gray-700">
                          <TranslatableText text={item.name} />
                        </td>
                        <td className="p-5 text-center">{renderCell(item.free)}</td>
                        <td className="p-5 text-center">{renderCell(item.growth)}</td>
                        <td className="p-5 text-center">{renderCell(item.scale)}</td>
                        <td className="p-5 text-center">{renderCell(item.custom)}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- FAQ SECTION --- */}
      <FAQSection />

    </div>
  );
}

// --- HELPER: Render Table Cells ---
function renderCell(value: boolean | string) {
  if (value === true) return (
    <div className="flex justify-center">
        <div className="h-2.5 w-2.5 rounded-full bg-[#0ABED6]" />
    </div>
  );
  
  if (value === false) return (
    <div className="flex justify-center">
        <div className="h-px w-3 bg-gray-300" />
    </div>
  ); 
  
  return (
    <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs">
        <TranslatableText text={value} />
    </span>
  );
}