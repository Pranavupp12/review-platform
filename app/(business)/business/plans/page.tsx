"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { Check, X, Sparkles, Zap, Building2, Crown, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// --- CONFIGURATION ---
// Brand Colors used: Primary #0ABED6 | Secondary #0892A5

const PLANS = [
  {
    name: "Free",
    slug: "free",
    price: { monthly: 0, yearly: 0 },
    description: "Essential tools to claim your profile and start collecting reviews.",
    icon: Building2,
    buttonText: "Get Started",
    buttonVariant: "outline",
    popular: false,
    highlight: false,
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
    price: { monthly: 49, yearly: 490 },
    description: "Stand out from the crowd with verified badges and rich content.",
    icon: Zap,
    buttonText: "Start Growth Trial",
    buttonVariant: "default",
    popular: true, // Highlights this card
    highlight: true,
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
    price: { monthly: 199, yearly: 1990 },
    description: "Maximize visibility with category sponsorship and priority support.",
    icon: Crown,
    buttonText: "Upgrade to Scale",
    buttonVariant: "default",
    popular: false,
    highlight: false,
    features: [
      "Everything in Growth, plus:",
      "Category Sponsorship (Top Rank)",
      "Higher Email Limits",
      "Dedicated Success Manager",
      "API Access",
    ],
  },
  {
    name: "Custom",
    slug: "custom",
    price: { monthly: "Custom", yearly: "Custom" },
    description: "Enterprise-grade solutions for multi-location brands.",
    icon: Sparkles,
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    popular: false,
    highlight: false,
    features: [
      "Custom Sponsorship Scope",
      "Unlimited Email Campaigns",
      "White-label Reporting",
      "Single Sign-On (SSO)",
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

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="bg-white min-h-screen pb-24 font-sans text-gray-900">
      
      {/* --- HERO HEADER --- */}
      <div className="relative bg-[#0892A5] pt-24 pb-32 px-4 overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0ABED6] opacity-10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Scale your reputation with <span className="text-[#0ABED6]">confidence.</span>
          </h1>
          <p className="text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto">
            Choose the plan that fits your stage of growth. From basic profile management to dominating your category search results.
          </p>

          {/* TOGGLE SWITCH */}
          <div className="inline-flex items-center p-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
                !isYearly ? "bg-[#0ABED6] text-white shadow-lg" : "text-blue-100 hover:text-white"
              )}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                isYearly ? "bg-[#0ABED6] text-white shadow-lg" : "text-blue-100 hover:text-white"
              )}
            >
              Yearly billing
              <span className="bg-[#000032] text-[#0ABED6] text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                -20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* --- PRICING CARDS --- */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.slug}
              className={cn(
                "group relative bg-white rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1",
                plan.popular 
                  ? "shadow-2xl border-2 border-[#0ABED6] ring-4 ring-[#0ABED6]/10" 
                  : "shadow-xl border border-gray-100 hover:shadow-2xl hover:border-[#0892A5]/30"
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0ABED6] text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" /> Most Popular
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                  plan.popular ? "bg-[#0ABED6]/10 text-[#0892A5]" : "bg-gray-50 text-gray-600 group-hover:bg-[#0ABED6]/10 group-hover:text-[#0892A5]"
                )}>
                  <plan.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-2 min-h-[48px] leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8 p-4 bg-gray-50/50 rounded-xl">
                {typeof plan.price.monthly === "number" ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-gray-500 font-medium">/{isYearly ? "yr" : "mo"}</span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-gray-900 py-1">Contact Us</div>
                )}
                {isYearly && typeof plan.price.monthly === "number" && (
                   <p className="text-xs text-[#0892A5] font-medium mt-1">Billed ${plan.price.yearly} yearly</p>
                )}
              </div>

              {/* Features */}
              <div className="flex-1 mb-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">What's included</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-snug">
                      <div className="mt-0.5 h-5 w-5 rounded-full bg-[#0ABED6]/10 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-[#0892A5]" />
                      </div>
                      <span className={cn(i === 0 && plan.slug !== 'free' ? "font-semibold text-gray-900" : "")}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <Link href={plan.slug === 'custom' ? '/contact' : `/business/signup?plan=${plan.slug}`} className="mt-auto">
                <Button 
                  className={cn(
                    "w-full h-12 font-semibold text-base transition-all",
                    plan.popular 
                      ? "bg-[#0ABED6] hover:bg-[#0892A5] text-white shadow-lg shadow-[#0ABED6]/25" 
                      : "bg-white border-2 border-gray-200 text-gray-900 hover:border-[#0ABED6] hover:text-[#0ABED6]"
                  )}
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* --- COMPARISON TABLE --- */}
      <div className="max-w-6xl mx-auto px-4 mt-32">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#000032]">Detailed Feature Comparison</h2>
          <p className="text-gray-500 mt-2">A closer look at what each plan unlocks for your business.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="p-6 text-left text-sm font-bold text-gray-900 w-1/3">Features</th>
                  <th className="p-6 text-center text-sm font-bold text-gray-900 w-1/6">Free</th>
                  <th className="p-6 text-center text-sm font-bold text-[#0892A5] w-1/6">Growth</th>
                  <th className="p-6 text-center text-sm font-bold text-[#0ABED6] w-1/6">Scale</th>
                  <th className="p-6 text-center text-sm font-bold text-[#000032] w-1/6">Custom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMPARISON_FEATURES.map((section, idx) => (
                  <Fragment key={section.category}>
                    {/* Category Header */}
                    <tr className="bg-gray-50/50">
                      <td colSpan={5} className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                        {section.category}
                      </td>
                    </tr>
                    
                    {/* Rows */}
                    {section.items.map((item, i) => (
                      <tr key={`${section.category}-${i}`} className="group hover:bg-[#0ABED6]/[0.02] transition-colors">
                        <td className="p-5 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {item.name}
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
      
      {/* --- CTA FOOTER --- */}
      <div className="max-w-4xl mx-auto mt-24 text-center px-4">
        <div className="bg-[#000032] rounded-3xl p-10 md:p-16 relative overflow-hidden">
             {/* Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0ABED6] opacity-10 blur-[80px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0892A5] opacity-10 blur-[80px] rounded-full" />
            
            <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-4">Still have questions?</h2>
                <p className="text-blue-100 mb-8 max-w-lg mx-auto">
                    Not sure which plan is right for you? Our team is here to help you find the perfect fit for your business goals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact">
                        <Button className="bg-[#0ABED6] hover:bg-[#0892A5] text-white h-12 px-8 rounded-full text-base font-semibold">
                            Contact Support
                        </Button>
                    </Link>
                    <Link href="/faq">
                        <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white hover:text-[#000032] h-12 px-8 rounded-full text-base font-semibold">
                            Visit FAQ
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
}

// --- HELPER: Render Table Cells ---
function renderCell(value: boolean | string) {
  if (value === true) return (
    <div className="flex justify-center">
        <div className="h-6 w-6 rounded-full bg-[#0ABED6]/10 flex items-center justify-center">
            <Check className="h-4 w-4 text-[#0892A5]" />
        </div>
    </div>
  );
  if (value === false) return <div className="flex justify-center"><div className="h-1 w-3 bg-gray-200 rounded-full" /></div>; // Minimal dash for 'false'
  return <span className="text-sm font-semibold text-gray-900">{value}</span>;
}