/** @format */

// Enhanced tracking patterns for Privacy Guardian extension

// Additional tracking categories and patterns
export const ENHANCED_TRACKING_PATTERNS = {
  // Cookie syncing and user matching patterns
  COOKIE_SYNC_PATTERNS: {
    urlPatterns: [
      /\/sync\//i,
      /\/match\//i,
      /\/pixel\/sync/i,
      /\/user\/match/i,
      /\/sync\.gif/i,
      /\/sync\.png/i,
    ],
    paramPatterns: ["sync_id", "match_id", "uid", "uuid", "gdpr", "consent"],
  },

  // Browser fingerprinting detection
  FINGERPRINTING_PATTERNS: {
    scriptPatterns: [
      /canvas\.toDataURL/i,
      /webgl/i,
      /AudioContext/i,
      /fontList/i,
      /plugins\.length/i,
      /mimeTypes\.length/i,
      /screen\.colorDepth/i,
      /navigator\.hardwareConcurrency/i,
    ],
    apiCalls: [
      "navigator.userAgent",
      "navigator.platform",
      "navigator.language",
      "navigator.languages",
      "navigator.deviceMemory",
      "screen.width",
      "screen.height",
      "screen.availWidth",
      "screen.availHeight",
    ],
  },

  // Session recording and behavior tracking
  BEHAVIOR_TRACKING: {
    events: [
      "mousemove",
      "mousedown",
      "mouseup",
      "click",
      "scroll",
      "keypress",
      "focus",
      "blur",
      "change",
      "submit",
    ],
    dataCollection: [
      "form_data",
      "input_timing",
      "scroll_depth",
      "time_spent",
      "page_visibility",
      "rage_clicks",
      "dead_clicks",
    ],
  },

  // Cross-site tracking detection
  CROSS_SITE_TRACKING: {
    indicators: [
      "third_party_cookies",
      "shared_local_storage",
      "etag_tracking",
      "cache_tracking",
      "redirect_tracking",
    ],
    headers: [
      "etag",
      "if-none-match",
      "if-modified-since",
      "last-modified",
      "cache-control",
    ],
  },

  // Ad tech and real-time bidding
  AD_TECH_PATTERNS: {
    endpoints: [
      /\/bid\//i,
      /\/rtb\//i,
      /\/auction\//i,
      /\/prebid\//i,
      /\/vast\//i,
      /\/ad\//i,
    ],
    parameters: [
      "bid_id",
      "auction_id",
      "placement_id",
      "creative_id",
      "campaign_id",
      "advertiser_id",
    ],
  },

  // Social media tracking
  SOCIAL_TRACKING: {
    buttons: ["fb-like", "twitter-share", "linkedin-share", "pinterest-pin"],
    widgets: [
      "facebook-widget",
      "twitter-timeline",
      "instagram-embed",
      "youtube-embed",
    ],
  },

  // Privacy regulation compliance
  COMPLIANCE_INDICATORS: {
    gdpr: ["gdpr_consent", "gdpr_applies", "gdpr_pd", "euconsent"],
    ccpa: ["ccpa_consent", "us_privacy", "california_privacy"],
  },
};

// Scoring weights for different tracking types
export const TRACKING_WEIGHTS = {
  COOKIE_SYNC: 25,
  FINGERPRINTING: 35,
  BEHAVIOR_TRACKING: 20,
  CROSS_SITE_TRACKING: 30,
  AD_TECH: 15,
  SOCIAL_TRACKING: 10,
};

// Threshold configurations
export const DETECTION_THRESHOLDS = {
  SUSPICIOUS_SCORE: 60,
  HIGH_RISK_SCORE: 80,
  MAX_CONCURRENT_REQUESTS: 5,
  TIME_WINDOW: 1000, // milliseconds
};
