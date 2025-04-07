/** @format */

// Background script for Privacy Guardian extension

// Import blocklists and detection systems
import { trackerDatabase, maliciousDatabase } from "./blocklists.js";
import {
  analyzeRequest,
  getSuspiciousDomains,
  resetLearningData,
  adjustSensitivity,
} from "./heuristics.js";
import { DETECTION_THRESHOLDS } from "./tracker_patterns.js";

// Request queue for rate limiting
let requestQueue = [];
const processQueue = () => {
  const now = Date.now();
  requestQueue = requestQueue.filter(
    (req) => now - req.timestamp < DETECTION_THRESHOLDS.TIME_WINDOW
  );
};

// Enhanced request analysis cache
const requestCache = new Map();

// Combine databases for efficient lookup
const combinedDatabase = { ...trackerDatabase, ...maliciousDatabase };

// Statistics for blocked content
let stats = {
  totalBlocked: 0,
  trackers: {},
  malicious: {},
  heuristic: {},
  categories: {
    tracker: 0,
    phishing: 0,
    malware: 0,
    scam: 0,
    heuristic: 0,
  },
};

// Load user settings from storage
let settings = {
  enabled: true,
  showNotifications: false,
  customRules: {},
  blockTrackers: true,
  blockMalicious: true,
  heuristicDetection: true,
  heuristicSensitivity: 70,
};

// Load settings from storage
chrome.storage.local.get(["settings", "stats"], (result) => {
  if (result.settings) {
    settings = result.settings;
  }
  if (result.stats) {
    stats = result.stats;
  }
});

// Helper function to extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
}

// Helper function to check if a domain matches a blocked pattern (tracker or malicious URL)
function checkDomain(domain) {
  if (!domain) return false;

  // Check for exact domain match in combined database
  if (combinedDatabase[domain]) {
    return {
      ...combinedDatabase[domain],
      type: maliciousDatabase[domain] ? "malicious" : "tracker",
    };
  }

  // Check for subdomain match
  const domainParts = domain.split(".");
  for (let i = 0; i < domainParts.length - 1; i++) {
    const subDomain = domainParts.slice(i).join(".");
    if (combinedDatabase[subDomain]) {
      return {
        ...combinedDatabase[subDomain],
        type: maliciousDatabase[subDomain] ? "malicious" : "tracker",
      };
    }
  }

  // Check custom rules
  if (settings.customRules[domain]) {
    return {
      ...settings.customRules[domain],
      type: "custom",
    };
  }

  return false;
}

// Update statistics when content is blocked
function updateStats(blockedItem) {
  stats.totalBlocked++;

  // Update by type (tracker, malicious, or heuristic)
  if (blockedItem.type === "malicious") {
    if (!stats.malicious[blockedItem.name]) {
      stats.malicious[blockedItem.name] = 1;
    } else {
      stats.malicious[blockedItem.name]++;
    }

    // Update category counts for malicious content
    if (blockedItem.category) {
      stats.categories[blockedItem.category] =
        (stats.categories[blockedItem.category] || 0) + 1;
    }
  } else if (blockedItem.type === "heuristic") {
    // Handle heuristically detected trackers
    if (!stats.heuristic[blockedItem.name]) {
      stats.heuristic[blockedItem.name] = {
        count: 1,
        patterns: blockedItem.patterns || [],
        score: blockedItem.score || 0,
      };
    } else {
      stats.heuristic[blockedItem.name].count++;
      // Update patterns if available
      if (blockedItem.patterns) {
        stats.heuristic[blockedItem.name].patterns = [
          ...new Set([
            ...stats.heuristic[blockedItem.name].patterns,
            ...blockedItem.patterns,
          ]),
        ];
      }
      // Update score if available
      if (blockedItem.score) {
        stats.heuristic[blockedItem.name].score =
          (stats.heuristic[blockedItem.name].score + blockedItem.score) / 2; // Average score
      }
    }

    // Update heuristic category count
    stats.categories.heuristic = (stats.categories.heuristic || 0) + 1;
  } else {
    // Handle static blocklist trackers
    if (!stats.trackers[blockedItem.name]) {
      stats.trackers[blockedItem.name] = 1;
    } else {
      stats.trackers[blockedItem.name]++;
    }

    // Update tracker category count
    stats.categories.tracker = (stats.categories.tracker || 0) + 1;
  }

  // Save stats to storage
  chrome.storage.local.set({ stats });
}

// Main request handler
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // Skip if extension is disabled
    if (!settings.enabled) return { cancel: false };

    // Process request queue for rate limiting
    processQueue();
    requestQueue.push({ timestamp: Date.now() });
    if (requestQueue.length > DETECTION_THRESHOLDS.MAX_CONCURRENT_REQUESTS) {
      return { cancel: false }; // Skip analysis if too many concurrent requests
    }

    // Check request cache
    const cachedResult = requestCache.get(details.url);
    if (cachedResult && Date.now() - cachedResult.timestamp < 60000) {
      // Cache for 1 minute
      return { cancel: cachedResult.block };
    }

    // Extract domain from the URL
    const domain = extractDomain(details.url);
    const blockedItem = checkDomain(domain);

    // If it's a blocked item (tracker or malicious URL)
    if (blockedItem && blockedItem.block) {
      // Check if we should block based on type and settings
      let shouldBlock = false;

      if (blockedItem.type === "tracker" && settings.blockTrackers) {
        shouldBlock = true;
      } else if (blockedItem.type === "malicious" && settings.blockMalicious) {
        shouldBlock = true;
      } else if (blockedItem.type === "custom") {
        shouldBlock = true;
      }

      if (shouldBlock) {
        // Update statistics
        updateStats(blockedItem);

        // Show notification if enabled
        if (settings.showNotifications) {
          chrome.tabs.get(details.tabId, (tab) => {
            if (chrome.runtime.lastError) return;

            const pageDomain = extractDomain(tab.url);
            const itemType =
              blockedItem.type === "malicious"
                ? blockedItem.category
                  ? blockedItem.category
                  : "malicious URL"
                : "tracker";

            chrome.notifications.create({
              type: "basic",
              iconUrl: "icons/icon48.png",
              title: `${
                itemType.charAt(0).toUpperCase() + itemType.slice(1)
              } Blocked`,
              message: `Blocked ${blockedItem.name} ${itemType} on ${pageDomain}`,
            });
          });
        }

        // Block the request
        return { cancel: true };
      }
    }

    // Apply heuristic detection if enabled
    if (settings.heuristicDetection) {
      // Analyze the request for suspicious tracking behavior
      const heuristicResult = analyzeRequest(details);

      // If the request is deemed suspicious by heuristic analysis
      if (heuristicResult.suspicious) {
        // Create a blocked item object for statistics
        const heuristicBlockedItem = {
          name: heuristicResult.domain,
          type: "heuristic",
          category: "heuristic",
          block: true,
          patterns: heuristicResult.patterns,
          score: heuristicResult.score,
        };

        // Update statistics
        updateStats(heuristicBlockedItem);

        // Show notification if enabled
        if (settings.showNotifications) {
          chrome.tabs.get(details.tabId, (tab) => {
            if (chrome.runtime.lastError) return;

            const pageDomain = extractDomain(tab.url);

            chrome.notifications.create({
              type: "basic",
              iconUrl: "icons/icon48.png",
              title: "Suspicious Tracker Blocked",
              message: `Blocked suspicious tracker ${heuristicResult.domain} on ${pageDomain}`,
            });
          });
        }

        // Block the request
        return { cancel: true };
      }
    }

    // Allow the request
    return { cancel: false };
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getStats") {
    sendResponse({ stats });
  } else if (message.action === "getSettings") {
    sendResponse({ settings });
  } else if (message.action === "updateSettings") {
    settings = message.settings;
    chrome.storage.local.set({ settings });
    sendResponse({ success: true });
  } else if (message.action === "resetStats") {
    stats = {
      totalBlocked: 0,
      trackers: {},
    };
    chrome.storage.local.set({ stats });
    sendResponse({ success: true });
  } else if (message.action === "addCustomRule") {
    settings.customRules[message.domain] = {
      name: message.name || message.domain,
      block: message.block,
    };
    chrome.storage.local.set({ settings });
    sendResponse({ success: true });
  } else if (message.action === "removeCustomRule") {
    delete settings.customRules[message.domain];
    chrome.storage.local.set({ settings });
    sendResponse({ success: true });
  }

  return true; // Keep the message channel open for async response
});

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage with default settings
  chrome.storage.local.set({
    settings: settings,
    stats: stats,
  });
});
