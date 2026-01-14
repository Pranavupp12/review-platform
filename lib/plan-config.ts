import { Plan } from "@prisma/client";

// 1. Define the Defaults for every Plan
export const PLAN_DEFAULTS = {
  FREE: {
    emailLimit: 10,
    emailBatchSize: 50,
    updateLimit: 0,
    analyticsTier: "BASIC", // Basic | Advanced | Pro
    hasLeadGen: false,
    hideCompetitors: false,
  },
  GROWTH: {
    emailLimit: 300,
    emailBatchSize: Infinity,
    updateLimit: 10,
    analyticsTier: "ADVANCED",
    hasLeadGen: true,
    hideCompetitors: false,
  },
  SCALE: {
    emailLimit: 3000,
    emailBatchSize: Infinity,
    updateLimit: 20,
    analyticsTier: "PRO",
    hasLeadGen: true,
    hideCompetitors: true,
  },
  // Custom defaults to "Manual" mode (mostly empty until you override)
  CUSTOM: {
    emailLimit: 0,
    emailBatchSize: Infinity,
    updateLimit: 0,
    analyticsTier: "BASIC",
    hasLeadGen: false,
    hideCompetitors: false,
  }
};

// 2. The Brain: Calculates effective features by merging Defaults + Overrides
export function getCompanyFeatures(company: any) {
  const plan = (company.plan as keyof typeof PLAN_DEFAULTS) || "FREE";
  const defaults = PLAN_DEFAULTS[plan] || PLAN_DEFAULTS.FREE;

  return {
    // LIMITS: Use DB override if present, else use Plan Default
    emailLimit: company.customEmailLimit ?? defaults.emailLimit,
    updateLimit: company.customUpdateLimit ?? defaults.updateLimit,
    
    // BATCH SIZE (Usually hardcoded per plan, but you could override if needed)
    emailBatchSize: defaults.emailBatchSize,

    // ANALYTICS: Override > Plan Default
    // If enableAnalytics is true -> give PRO. If null -> use default.
    analyticsTier: company.enableAnalytics === true ? "PRO" : 
                   (company.enableAnalytics === false ? "BASIC" : defaults.analyticsTier),
    
    // LEAD GEN
    hasLeadGen: company.enableLeadGen ?? defaults.hasLeadGen,
    
    // COMPETITORS
    shouldHideCompetitors: company.hideCompetitors ?? defaults.hideCompetitors,
  };
}

export const ALL_FEATURES = {
  ANALYTICS: "analytics",
  ADVANCED_ANALYTICS: "advanced_analytics", 
  PRO_ANALYTICS: "pro_analytics",
  COMPETITOR_ANALYSIS: "competitor_analysis",
  LEAD_GEN: "lead_gen",
  VERIFIED_BADGE: "verified_badge",
  PRIORITY_SUPPORT: "priority_support"
};