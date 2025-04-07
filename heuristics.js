/** @format */

// Heuristic tracking detection system for Privacy Guardian extension
import {
  ENHANCED_TRACKING_PATTERNS,
  TRACKING_WEIGHTS,
  DETECTION_THRESHOLDS,
} from "./tracker_patterns.js";

// Tracking patterns and behaviors to analyze
const TRACKING_PATTERNS = {
  // Request frequency thresholds
  HIGH_FREQUENCY_THRESHOLD: 10, // Number of requests in SHORT_TIME_WINDOW
  SHORT_TIME_WINDOW: 60000, // 1 minute in milliseconds

  // Cross-domain communication patterns
  CROSS_DOMAIN_THRESHOLD: 5, // Number of different domains a request is sent to

  // Data payload characteristics
  SUSPICIOUS_PARAMS: [
    "id",
    "uid",
    "user",
    "visitor",
    "client",
    "device",
    "fingerprint",
    "track",
    "analytics",
    "session",
    "visitor",
    "browser",
    "screen",
    "resolution",
    "referrer",
    "history",
    "behavior",
    "activity",
    "engagement",
    "scroll",
    "click",
    "hover",
    "keystroke",
    "typing",
    "mouse",
    "touch",
    "swipe",
    "location",
    "geo",
    "gps",
    "latitude",
    "longitude",
    "country",
    "region",
    "city",
    "timezone",
    "language",
    "locale",
    "currency",
    "device",
    "hardware",
    "platform",
    "os",
    "version",
    "manufacturer",
    "model",
    "pixel",
    "beacon",
    "conversion",
    "event",
    "action",
  ],

  // URL patterns that suggest tracking
  SUSPICIOUS_URL_PATTERNS: [
    /\/track(ing)?\//i,
    /\/beacon\//i,
    /\/pixel\//i,
    /\/analytics\//i,
    /\/telemetry\//i,
    /\/collect\//i,
    /\/stats\//i,
    /\/metrics\//i,
    /\/log\//i,
    /\/ping\//i,
    /\/event\//i,
    /\/pixel\.gif/i,
    /\/pixel\.png/i,
    /\/1x1\.gif/i,
    /\/1x1\.png/i,
    /\/impression\//i,
    /\/counter\//i,
  ],

  // Common tracking script patterns
  SUSPICIOUS_SCRIPT_PATTERNS: [
    /\.track\(/i,
    /\.collect\(/i,
    /\.beacon\(/i,
    /\.fingerprint\(/i,
    /navigator\.sendBeacon\(/i,
    /document\.cookie/i,
  ],

  // Suspicious response types for tracking
  SUSPICIOUS_RESPONSE_TYPES: [
    "image/gif",
    "image/png",
    "image/jpeg",
    "text/plain",
    "application/json",
  ],

  // Tiny image dimensions that suggest tracking pixels
  TINY_IMAGE_DIMENSIONS: {
    width: 3, // Max width to be considered a tracking pixel
    height: 3, // Max height to be considered a tracking pixel
  },
};

// Request history storage for pattern analysis
let requestHistory = {
  // Store requests by domain
  byDomain: {},

  // Store requests by tab
  byTab: {},

  // Store cross-domain relationships
  crossDomainRelations: {},

  // Store detected suspicious domains
  suspiciousDomains: {},
};

// Learning database for detected patterns
let learningDatabase = {
  // Domains with suspicious behavior scores
  domainScores: {},

  // Patterns that have been detected
  detectedPatterns: {},

  // Enhanced pattern detection
  enhancedPatterns: {
    cookieSync: {},
    fingerprinting: {},
    behaviorTracking: {},
    crossSiteTracking: {},
    adTech: {},
    socialTracking: {},
  },

  // Threshold for considering a domain suspicious
  SUSPICIOUS_THRESHOLD: DETECTION_THRESHOLDS.SUSPICIOUS_SCORE,
  HIGH_RISK_THRESHOLD: DETECTION_THRESHOLDS.HIGH_RISK_SCORE,
};

// Helper function to extract URL parameters
function extractUrlParams(url) {
  try {
    const urlObj = new URL(url);
    const params = {};

    // Get search params
    for (const [key, value] of urlObj.searchParams.entries()) {
      params[key.toLowerCase()] = value;
    }

    // Check hash params if present
    if (urlObj.hash && urlObj.hash.includes("=")) {
      const hashParams = new URLSearchParams(urlObj.hash.substring(1));
      for (const [key, value] of hashParams.entries()) {
        params[key.toLowerCase()] = value;
      }
    }

    return params;
  } catch (e) {
    return {};
  }
}

// Analyze URL for suspicious patterns
function analyzeUrl(url) {
  let score = 0;
  let detectedPatterns = [];

  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // Check for suspicious URL patterns
    for (const pattern of TRACKING_PATTERNS.SUSPICIOUS_URL_PATTERNS) {
      if (pattern.test(url)) {
        score += 15;
        break;
      }
    }

    // Check for suspicious parameters
    const params = extractUrlParams(url);
    const paramKeys = Object.keys(params).map((k) => k.toLowerCase());

    for (const param of paramKeys) {
      if (TRACKING_PATTERNS.SUSPICIOUS_PARAMS.includes(param)) {
        score += 5;
      }
    }

    // Check for excessive number of parameters (potential fingerprinting)
    if (paramKeys.length > 10) {
      score += 10;
    }

    // Check for cookie syncing patterns
    for (const pattern of ENHANCED_TRACKING_PATTERNS.COOKIE_SYNC_PATTERNS
      .urlPatterns) {
      if (pattern.test(url)) {
        score += TRACKING_WEIGHTS.COOKIE_SYNC;
        detectedPatterns.push("cookie_sync");
        break;
      }
    }

    // Check for ad tech patterns
    for (const pattern of ENHANCED_TRACKING_PATTERNS.AD_TECH_PATTERNS
      .endpoints) {
      if (pattern.test(url)) {
        score += TRACKING_WEIGHTS.AD_TECH;
        detectedPatterns.push("ad_tech");
        break;
      }
    }

    // Check for social tracking
    if (
      url.includes("social") ||
      url.includes("share") ||
      url.includes("like")
    ) {
      for (const widget of ENHANCED_TRACKING_PATTERNS.SOCIAL_TRACKING.widgets) {
        if (url.includes(widget)) {
          score += TRACKING_WEIGHTS.SOCIAL_TRACKING;
          detectedPatterns.push("social_tracking");
          break;
        }
      }
    }

    // Check for privacy compliance parameters
    for (const gdprParam of ENHANCED_TRACKING_PATTERNS.COMPLIANCE_INDICATORS
      .gdpr) {
      if (paramKeys.includes(gdprParam)) {
        detectedPatterns.push("gdpr_compliance");
        break;
      }
    }

    // Check for base64 encoded data in parameters (potential data collection)
    for (const value of Object.values(params)) {
      if (
        typeof value === "string" &&
        value.length > 50 &&
        /^[A-Za-z0-9+/=]+$/.test(value)
      ) {
        score += 15;
        break;
      }
    }

    // Check for tiny image requests (tracking pixels)
    if (/\.(gif|png|jpg|jpeg)$/i.test(path) && path.includes("1x1")) {
      score += 20;
    }
  } catch (e) {
    // URL parsing failed, can't analyze
  }

  return score;
}

// Analyze request frequency for a domain
function analyzeRequestFrequency(domain, tabId) {
  let score = 0;

  // Initialize domain history if it doesn't exist
  if (!requestHistory.byDomain[domain]) {
    requestHistory.byDomain[domain] = [];
  }

  // Add current timestamp to domain history
  const now = Date.now();
  requestHistory.byDomain[domain].push(now);

  // Remove old timestamps outside the time window
  requestHistory.byDomain[domain] = requestHistory.byDomain[domain].filter(
    (timestamp) => now - timestamp < TRACKING_PATTERNS.SHORT_TIME_WINDOW
  );

  // Check frequency within time window
  const requestCount = requestHistory.byDomain[domain].length;
  if (requestCount >= TRACKING_PATTERNS.HIGH_FREQUENCY_THRESHOLD) {
    score += 20;
  } else if (requestCount >= TRACKING_PATTERNS.HIGH_FREQUENCY_THRESHOLD / 2) {
    score += 10;
  }

  return score;
}

// Analyze cross-domain relationships
function analyzeCrossDomainBehavior(domain, tabId, referrer) {
  let score = 0;

  // Initialize tab history if it doesn't exist
  if (!requestHistory.byTab[tabId]) {
    requestHistory.byTab[tabId] = {
      domains: {},
      referrers: new Set(),
    };
  }

  // Add domain to tab history
  requestHistory.byTab[tabId].domains[domain] = true;

  // Add referrer if available
  if (referrer) {
    try {
      const referrerDomain = new URL(referrer).hostname;
      requestHistory.byTab[tabId].referrers.add(referrerDomain);

      // Track cross-domain relationship
      if (!requestHistory.crossDomainRelations[referrerDomain]) {
        requestHistory.crossDomainRelations[referrerDomain] = new Set();
      }
      requestHistory.crossDomainRelations[referrerDomain].add(domain);

      // Check if this domain receives data from many different domains
      if (
        requestHistory.crossDomainRelations[referrerDomain].size >=
        TRACKING_PATTERNS.CROSS_DOMAIN_THRESHOLD
      ) {
        score += 15;
      }
    } catch (e) {
      // Invalid referrer URL
    }
  }

  // Check if this domain is contacted from many different domains
  const tabCount = Object.keys(requestHistory.byTab).filter((tab) => {
    return requestHistory.byTab[tab].domains[domain];
  }).length;

  if (tabCount >= 3) {
    score += 10;
  }

  return score;
}

// Analyze request headers for tracking indicators
function analyzeHeaders(requestHeaders, responseHeaders) {
  let score = 0;

  if (requestHeaders) {
    // Check for fingerprinting headers
    const fingerprintingHeaders = [
      "user-agent",
      "accept-language",
      "dnt",
      "referer",
    ];

    let fingerprintHeaderCount = 0;
    for (const header of requestHeaders) {
      if (fingerprintingHeaders.includes(header.name.toLowerCase())) {
        fingerprintHeaderCount++;
      }
    }

    if (fingerprintHeaderCount >= 3) {
      score += 10;
    }
  }

  if (responseHeaders) {
    // Check for suspicious content types
    for (const header of responseHeaders) {
      if (header.name.toLowerCase() === "content-type") {
        const contentType = header.value.toLowerCase();
        if (TRACKING_PATTERNS.SUSPICIOUS_RESPONSE_TYPES.includes(contentType)) {
          score += 5;
        }

        // Check for tiny images (tracking pixels)
        if (contentType.startsWith("image/")) {
          for (const header of responseHeaders) {
            if (
              header.name.toLowerCase() === "content-length" &&
              parseInt(header.value) < 100
            ) {
              score += 15;
              break;
            }
          }
        }
      }
    }
  }

  return score;
}

// Main function to analyze a request for tracking behavior
function analyzeRequest(details) {
  const {
    url,
    tabId,
    requestHeaders,
    responseHeaders,
    type,
    method,
    timeStamp,
    frameId,
  } = details;

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Skip analysis for main_frame requests (these are the pages themselves)
    if (type === "main_frame") {
      return { score: 0, suspicious: false };
    }

    // Skip analysis for common CDNs and essential services
    const commonCdns = [
      "ajax.googleapis.com",
      "cdn.jsdelivr.net",
      "cdnjs.cloudflare.com",
      "fonts.googleapis.com",
      "fonts.gstatic.com",
    ];

    if (commonCdns.some((cdn) => domain.includes(cdn))) {
      return { score: 0, suspicious: false };
    }

    // Calculate suspicion score based on multiple factors
    let score = 0;

    // 1. Analyze URL patterns
    score += analyzeUrl(url);

    // 2. Analyze request frequency
    score += analyzeRequestFrequency(domain, tabId);

    // 3. Analyze cross-domain behavior
    const referrer = requestHeaders
      ? requestHeaders.find((h) => h.name.toLowerCase() === "referer")?.value
      : null;
    score += analyzeCrossDomainBehavior(domain, tabId, referrer);

    // 4. Analyze headers
    score += analyzeHeaders(requestHeaders, responseHeaders);

    // 5. Consider request type
    if (type === "image" && method === "GET") {
      // Potential tracking pixel
      score += 5;
    } else if (type === "beacon" || type === "ping") {
      // Explicit tracking request types
      score += 25;
    } else if (type === "xmlhttprequest" && method === "POST") {
      // Potential data collection
      score += 10;
    }

    // Update learning database with this domain's score
    if (!learningDatabase.domainScores[domain]) {
      learningDatabase.domainScores[domain] = [];
    }

    learningDatabase.domainScores[domain].push(score);

    // Calculate average score for this domain
    const scores = learningDatabase.domainScores[domain];
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    // Determine if this domain is suspicious based on score
    const suspicious = avgScore >= learningDatabase.SUSPICIOUS_THRESHOLD;

    // If suspicious, add to suspicious domains list
    if (suspicious && !requestHistory.suspiciousDomains[domain]) {
      requestHistory.suspiciousDomains[domain] = {
        firstDetected: Date.now(),
        score: avgScore,
        detectionCount: 1,
      };
    } else if (suspicious) {
      requestHistory.suspiciousDomains[domain].detectionCount++;
      requestHistory.suspiciousDomains[domain].score = avgScore;
    }

    return {
      domain,
      score: avgScore,
      suspicious,
      patterns: getDetectedPatterns(url, score),
    };
  } catch (e) {
    return { score: 0, suspicious: false };
  }
}

// Identify specific patterns that triggered detection
function getDetectedPatterns(url, score) {
  const patterns = [];

  if (score <= 0) return patterns;

  try {
    // Check URL patterns
    for (const pattern of TRACKING_PATTERNS.SUSPICIOUS_URL_PATTERNS) {
      if (pattern.test(url)) {
        patterns.push("suspicious_url_pattern");
        break;
      }
    }

    // Check for tracking parameters
    const params = extractUrlParams(url);
    const paramKeys = Object.keys(params).map((k) => k.toLowerCase());

    for (const param of paramKeys) {
      if (TRACKING_PATTERNS.SUSPICIOUS_PARAMS.includes(param)) {
        patterns.push("tracking_parameters");
        break;
      }
    }

    // Check for potential fingerprinting (many parameters)
    if (paramKeys.length > 10) {
      patterns.push("potential_fingerprinting");
    }

    // Check for tracking pixels
    if (/\.(gif|png|jpg|jpeg)$/i.test(url) && url.includes("1x1")) {
      patterns.push("tracking_pixel");
    }
  } catch (e) {
    // URL parsing failed
  }

  return patterns;
}

// Get all currently detected suspicious domains
function getSuspiciousDomains() {
  return requestHistory.suspiciousDomains;
}

// Reset the learning database and history
function resetLearningData() {
  requestHistory = {
    byDomain: {},
    byTab: {},
    crossDomainRelations: {},
    suspiciousDomains: {},
  };

  learningDatabase = {
    domainScores: {},
    detectedPatterns: {},
    SUSPICIOUS_THRESHOLD: 70,
  };
}

// Adjust the sensitivity of the heuristic detection
function adjustSensitivity(threshold) {
  if (threshold >= 0 && threshold <= 100) {
    learningDatabase.SUSPICIOUS_THRESHOLD = threshold;
    return true;
  }
  return false;
}

// Export functions for use in background.js
export {
  analyzeRequest,
  getSuspiciousDomains,
  resetLearningData,
  adjustSensitivity,
};
