import { Clock, BadgeCheck, Zap, Heart, Trophy, Star } from "lucide-react";

// 1. Existing Badge Config
export const BADGE_CONFIG: Record<string, { label: string; description: string; icon: any; color: string; bg: string }> = {
  FAST_REPLY: {
    label: "Fast Responder",
    description: "Typically replies to reviews within 24 hours.",
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  HIGH_RESPONSE: {
    label: "Active Resolver",
    description: "Replies to 90% of negative reviews.",
    icon: Zap,
    color: "text-yellow-600",
    bg: "bg-yellow-50"
  },
  VERIFIED_DETAILS: {
    label: "Fully Verified",
    description: "Phone, Email, and Address verified by staff.",
    icon: BadgeCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  COMMUNITY_FAV: {
    label: "Community Favorite",
    description: "Maintains a 4.5+ rating for 3 months.",
    icon: Heart,
    color: "text-pink-600",
    bg: "bg-pink-50"
  },
  CATEGORY_LEADER: {
    label: "Category Leader",
    description: "Ranked in the Top 3 for this category.",
    icon: Trophy,
    color: "text-purple-600",
    bg: "bg-purple-50"
  },
  MOST_RELEVANT: {
    label: "Most Relevant",
    description: "Highlighted as a top choice for this category.",
    icon: Star,
    color: "text-white", 
    bg: "bg-[#0ABED6]" 
  }
};

// 2. ✅ NEW: Add Plan Rules Here (Centralized)
export const PLAN_AUTO_BADGES: Record<string, string[]> = {
  FREE: [],
  GROWTH: ['COMMUNITY_FAV', 'VERIFIED_DETAILS'],
  SCALE: ['COMMUNITY_FAV', 'VERIFIED_DETAILS', 'CATEGORY_LEADER'],
  PRO: ['COMMUNITY_FAV', 'VERIFIED_DETAILS'], // Fallback for legacy
};