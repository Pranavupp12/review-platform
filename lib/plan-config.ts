export const ALL_FEATURES = {
  // Define your feature keys here
  ANALYTICS_BASIC: "analytics_basic",       // Top 4 cards + Performance Tab
  ANALYTICS_ADVANCED: "analytics_advanced", // All sections
  // Future features can go here (e.g., WIDGETS_PRO, API_ACCESS)
} as const;

// Define what features come with each plan by default
export const PLAN_TEMPLATES = {
  FREE: [
    ALL_FEATURES.ANALYTICS_BASIC
  ],
  GROWTH: [
    ALL_FEATURES.ANALYTICS_BASIC,
    ALL_FEATURES.ANALYTICS_ADVANCED
  ],
  SCALE: [
    ALL_FEATURES.ANALYTICS_BASIC,
    ALL_FEATURES.ANALYTICS_ADVANCED
  ],
  CUSTOM: [] // Custom starts empty, or you can copy the previous plan's features
};

// Helper for UI labels
export const FEATURE_LABELS: Record<string, string> = {
  [ALL_FEATURES.ANALYTICS_BASIC]: "Basic Analytics (Cards + AI)",
  [ALL_FEATURES.ANALYTICS_ADVANCED]: "Advanced Analytics (Full Dashboard)",
};