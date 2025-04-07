/** @format */

// Background script for Privacy Guardian extension

// Database of known trackers
const trackerDatabase = {
  // Common analytics trackers
  "google-analytics.com": { name: "Google Analytics", block: true },
  "analytics.google.com": { name: "Google Analytics", block: true },
  "doubleclick.net": { name: "DoubleClick (Google)", block: true },
  "facebook.net": { name: "Facebook Pixel", block: true },
  "connect.facebook.net": { name: "Facebook Connect", block: true },
  "ads.facebook.com": { name: "Facebook Ads", block: true },
  "pixel.facebook.com": { name: "Facebook Pixel", block: true },
  "analytics.twitter.com": { name: "Twitter Analytics", block: true },
  "ads-twitter.com": { name: "Twitter Ads", block: true },
  "ads-api.twitter.com": { name: "Twitter Ads API", block: true },
  "static.ads-twitter.com": { name: "Twitter Ads Static", block: true },
  "ads-bidder-api.twitter.com": { name: "Twitter Ads Bidder", block: true },
  "advertising.twitter.com": { name: "Twitter Advertising", block: true },
  "sc-static.net": { name: "Snapchat", block: true },
  "hotjar.com": { name: "Hotjar", block: true },
  "mouseflow.com": { name: "Mouseflow", block: true },
  "clarity.ms": { name: "Microsoft Clarity", block: true },

  // Ad networks
  "adnxs.com": { name: "AppNexus", block: true },
  "rubiconproject.com": { name: "Rubicon Project", block: true },
  "pubmatic.com": { name: "PubMatic", block: true },
  "openx.net": { name: "OpenX", block: true },
  "criteo.com": { name: "Criteo", block: true },
  "criteo.net": { name: "Criteo", block: true },
  "taboola.com": { name: "Taboola", block: true },
  "outbrain.com": { name: "Outbrain", block: true },
  "amazon-adsystem.com": { name: "Amazon Ads", block: true },
  "adform.net": { name: "Adform", block: true },
  "adsrvr.org": { name: "The Trade Desk", block: true },
  "advertising.com": { name: "Verizon Media", block: true },
  "adtech.com": { name: "AdTech", block: true },
  "moatads.com": { name: "Moat", block: true },
  "media.net": { name: "Media.net", block: true },
  "smartadserver.com": { name: "Smart AdServer", block: true },
  "casalemedia.com": { name: "Casale Media", block: true },
  "bidswitch.net": { name: "BidSwitch", block: true },
  "sharethrough.com": { name: "Sharethrough", block: true },
  "teads.tv": { name: "Teads", block: true },
  "spotxchange.com": { name: "SpotX", block: true },
  "indexww.com": { name: "Index Exchange", block: true },
  "indexexchange.com": { name: "Index Exchange", block: true },
  "sonobi.com": { name: "Sonobi", block: true },
  "lijit.com": { name: "Sovrn", block: true },
  "sovrn.com": { name: "Sovrn", block: true },
  "gumgum.com": { name: "GumGum", block: true },
  "yieldmo.com": { name: "Yieldmo", block: true },
  "triplelift.com": { name: "TripleLift", block: true },
  "contextweb.com": { name: "PulsePoint", block: true },
  "rhythmone.com": { name: "RhythmOne", block: true },
  "quantserve.com": { name: "Quantcast", block: true },
  "quantcount.com": { name: "Quantcast", block: true },
  "mediamath.com": { name: "MediaMath", block: true },
  "mathtag.com": { name: "MediaMath", block: true },
  "adroll.com": { name: "AdRoll", block: true },
  "adroll.com": { name: "AdRoll", block: true },
  "turn.com": { name: "Turn", block: true },
  "amung.us": { name: "whos.amung.us", block: true },
  "chartbeat.com": { name: "Chartbeat", block: true },
  "chartbeat.net": { name: "Chartbeat", block: true },
  "pardot.com": { name: "Pardot", block: true },
  "marketo.com": { name: "Marketo", block: true },
  "marketo.net": { name: "Marketo", block: true },
  "hubspot.com": { name: "HubSpot", block: true },
  "omtrdc.net": { name: "Adobe Analytics", block: true },
  "demdex.net": { name: "Adobe Audience Manager", block: true },
  "everesttech.net": { name: "Adobe Media Optimizer", block: true },
  "krxd.net": { name: "Salesforce DMP", block: true },
  "bluekai.com": { name: "Oracle BlueKai", block: true },
  "exelator.com": { name: "Nielsen", block: true },
  "scorecardresearch.com": { name: "ScorecardResearch", block: true },
  "newrelic.com": { name: "New Relic", block: true },
  "optimizely.com": { name: "Optimizely", block: true },
  "segment.com": { name: "Segment", block: true },
  "segment.io": { name: "Segment", block: true },
  "mixpanel.com": { name: "Mixpanel", block: true },
  "amplitude.com": { name: "Amplitude", block: true },
  "kissmetrics.com": { name: "Kissmetrics", block: true },
  "crazyegg.com": { name: "Crazy Egg", block: true },
  "fullstory.com": { name: "FullStory", block: true },
  "inspectlet.com": { name: "Inspectlet", block: true },
  "luckyorange.com": { name: "Lucky Orange", block: true },
  "sessioncam.com": { name: "SessionCam", block: true },
  "clicktale.net": { name: "Clicktale", block: true },
  "pendo.io": { name: "Pendo", block: true },
  "heap.io": { name: "Heap", block: true },
  "loggly.com": { name: "Loggly", block: true },
  "bugsnag.com": { name: "Bugsnag", block: true },
  "sentry.io": { name: "Sentry", block: true },
  "rollbar.com": { name: "Rollbar", block: true },
  "appdynamics.com": { name: "AppDynamics", block: true },
  "dynatrace.com": { name: "Dynatrace", block: true },
  "pingdom.net": { name: "Pingdom", block: true },
  "statcounter.com": { name: "StatCounter", block: true },
  "alexa.com": { name: "Alexa", block: true },
  "alexametrics.com": { name: "Alexa Metrics", block: true },
  "addthis.com": { name: "AddThis", block: true },
  "sharethis.com": { name: "ShareThis", block: true },
  "sumome.com": { name: "SumoMe", block: true },
  "sumo.com": { name: "Sumo", block: true },
  "disqus.com": { name: "Disqus", block: true },
  "livefyre.com": { name: "Livefyre", block: true },
  "zopim.com": { name: "Zopim", block: true },
  "zendesk.com": { name: "Zendesk", block: true },
  "intercom.io": { name: "Intercom", block: true },
  "intercom.com": { name: "Intercom", block: true },
  "drift.com": { name: "Drift", block: true },
  "olark.com": { name: "Olark", block: true },
  "tawk.to": { name: "Tawk.to", block: true },
  "livechatinc.com": { name: "LiveChat", block: true },
  "purechat.com": { name: "PureChat", block: true },
  "snapengage.com": { name: "SnapEngage", block: true },
  "boldchat.com": { name: "BoldChat", block: true },
  "uservoice.com": { name: "UserVoice", block: true },
  "freshdesk.com": { name: "Freshdesk", block: true },
  "helpscout.net": { name: "Help Scout", block: true },
  "getsatisfaction.com": { name: "Get Satisfaction", block: true },
  "usabilla.com": { name: "Usabilla", block: true },
  "qualaroo.com": { name: "Qualaroo", block: true },
  "survicate.com": { name: "Survicate", block: true },
  "surveymonkey.com": { name: "SurveyMonkey", block: true },
  "typeform.com": { name: "Typeform", block: true },
  "wufoo.com": { name: "Wufoo", block: true },
  "formstack.com": { name: "Formstack", block: true },
  "jotform.com": { name: "JotForm", block: true },
  "formsite.com": { name: "FormSite", block: true },
  "formassembly.com": { name: "FormAssembly", block: true },
  "formkeep.com": { name: "FormKeep", block: true },
  "formspree.io": { name: "Formspree", block: true },
  "getform.io": { name: "Getform", block: true },
  "formcarry.com": { name: "Formcarry", block: true },
  "formcrafts.com": { name: "FormCrafts", block: true },
  "formstack.io": { name: "Formstack", block: true },
  "formstack.com": { name: "Formstack", block: true },
  "formstack.net": { name: "Formstack", block: true },
  "formstack.org": { name: "Formstack", block: true },
  "formstack.us": { name: "Formstack", block: true },
  "formstack.co": { name: "Formstack", block: true },
  "formstack.io": { name: "Formstack", block: true },
  "formstack.me": { name: "Formstack", block: true },
  "formstack.info": { name: "Formstack", block: true },
  "formstack.biz": { name: "Formstack", block: true },
  "formstack.mobi": { name: "Formstack", block: true },
  "formstack.tv": { name: "Formstack", block: true },
  "formstack.cc": { name: "Formstack", block: true },
  "formstack.ws": { name: "Formstack", block: true },
  "formstack.name": { name: "Formstack", block: true },
  "formstack.pro": { name: "Formstack", block: true },
  "formstack.in": { name: "Formstack", block: true },
  "formstack.eu": { name: "Formstack", block: true },
  "formstack.de": { name: "Formstack", block: true },
  "formstack.fr": { name: "Formstack", block: true },
  "formstack.es": { name: "Formstack", block: true },
  "formstack.it": { name: "Formstack", block: true },
  "formstack.nl": { name: "Formstack", block: true },
  "formstack.be": { name: "Formstack", block: true },
  "formstack.ch": { name: "Formstack", block: true },
  "formstack.at": { name: "Formstack", block: true },
  "formstack.dk": { name: "Formstack", block: true },
  "formstack.se": { name: "Formstack", block: true },
  "formstack.no": { name: "Formstack", block: true },
  "formstack.fi": { name: "Formstack", block: true },
  "formstack.pt": { name: "Formstack", block: true },
  "formstack.gr": { name: "Formstack", block: true },
  "formstack.ie": { name: "Formstack", block: true },
  "formstack.pl": { name: "Formstack", block: true },
  "formstack.cz": { name: "Formstack", block: true },
  "formstack.hu": { name: "Formstack", block: true },
  "formstack.ro": { name: "Formstack", block: true },
  "formstack.bg": { name: "Formstack", block: true },
  "formstack.sk": { name: "Formstack", block: true },
  "formstack.si": { name: "Formstack", block: true },
  "formstack.hr": { name: "Formstack", block: true },
  "formstack.lt": { name: "Formstack", block: true },
  "formstack.lv": { name: "Formstack", block: true },
  "formstack.ee": { name: "Formstack", block: true },
  "formstack.rs": { name: "Formstack", block: true },
  "formstack.ba": { name: "Formstack", block: true },
  "formstack.mk": { name: "Formstack", block: true },
  "formstack.al": { name: "Formstack", block: true },
  "formstack.me": { name: "Formstack", block: true },
  "formstack.is": { name: "Formstack", block: true },
  "formstack.mt": { name: "Formstack", block: true },
  "formstack.cy": { name: "Formstack", block: true },
  "formstack.lu": { name: "Formstack", block: true },
  "formstack.li": { name: "Formstack", block: true },
  "formstack.mc": { name: "Formstack", block: true },
  "formstack.sm": { name: "Formstack", block: true },
  "formstack.va": { name: "Formstack", block: true },
  "formstack.ad": { name: "Formstack", block: true },
  "formstack.im": { name: "Formstack", block: true },
  "formstack.gg": { name: "Formstack", block: true },
  "formstack.je": { name: "Formstack", block: true },
  "formstack.co.uk": { name: "Formstack", block: true },
  "formstack.uk": { name: "Formstack", block: true },
  "formstack.io": { name: "Formstack", block: true },
  "formstack.co": { name: "Formstack", block: true },
  "formstack.me": { name: "Formstack", block: true },
  "formstack.info": { name: "Formstack", block: true },
  "formstack.biz": { name: "Formstack", block: true },
  "formstack.mobi": { name: "Formstack", block: true },
  "formstack.tv": { name: "Formstack", block: true },
  "formstack.cc": { name: "Formstack", block: true },
  "formstack.ws": { name: "Formstack", block: true },
  "formstack.name": { name: "Formstack", block: true },
  "formstack.pro": { name: "Formstack", block: true },
  "formstack.in": { name: "Formstack", block: true },
  "formstack.eu": { name: "Formstack", block: true },
  "formstack.de": { name: "Formstack", block: true },
  "formstack.fr": { name: "Formstack", block: true },
  "formstack.es": { name: "Formstack", block: true },
  "formstack.it": { name: "Formstack", block: true },
  "formstack.nl": { name: "Formstack", block: true },
  "formstack.be": { name: "Formstack", block: true },
  "formstack.ch": { name: "Formstack", block: true },
  "formstack.at": { name: "Formstack", block: true },
  "formstack.dk": { name: "Formstack", block: true },
  "formstack.se": { name: "Formstack", block: true },
  "formstack.no": { name: "Formstack", block: true },
  "formstack.fi": { name: "Formstack", block: true },
  "formstack.pt": { name: "Formstack", block: true },
  "formstack.gr": { name: "Formstack", block: true },
  "formstack.ie": { name: "Formstack", block: true },
  "formstack.pl": { name: "Formstack", block: true },
  "formstack.cz": { name: "Formstack", block: true },
  "formstack.hu": { name: "Formstack", block: true },
  "formstack.ro": { name: "Formstack", block: true },
  "formstack.bg": { name: "Formstack", block: true },
  "formstack.sk": { name: "Formstack", block: true },
  "formstack.si": { name: "Formstack", block: true },
  "formstack.hr": { name: "Formstack", block: true },
  "formstack.lt": { name: "Formstack", block: true },
  "formstack.lv": { name: "Formstack", block: true },
  "formstack.ee": { name: "Formstack", block: true },
  "formstack.rs": { name: "Formstack", block: true },
  "formstack.ba": { name: "Formstack", block: true },
  "formstack.mk": { name: "Formstack", block: true },
  "formstack.al": { name: "Formstack", block: true },
  "formstack.me": { name: "Formstack", block: true },
  "formstack.is": { name: "Formstack", block: true },
  "formstack.mt": { name: "Formstack", block: true },
  "formstack.cy": { name: "Formstack", block: true },
  "formstack.lu": { name: "Formstack", block: true },
  "formstack.li": { name: "Formstack", block: true },
  "formstack.mc": { name: "Formstack", block: true },
  "formstack.sm": { name: "Formstack", block: true },
  "formstack.va": { name: "Formstack", block: true },
  "formstack.ad": { name: "Formstack", block: true },
  "formstack.im": { name: "Formstack", block: true },
  "formstack.gg": { name: "Formstack", block: true },
  "formstack.je": { name: "Formstack", block: true },
  "formstack.co.uk": { name: "Formstack", block: true },
  "formstack.uk": { name: "Formstack", block: true },
};

// Statistics for blocked trackers
let stats = {
  totalBlocked: 0,
  trackers: {},
};

// Load user settings from storage
let settings = {
  enabled: true,
  showNotifications: false,
  customRules: {},
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

// Helper function to check if a domain matches a tracker pattern
function isTracker(domain) {
  if (!domain) return false;

  // Check for exact domain match
  if (trackerDatabase[domain]) {
    return trackerDatabase[domain];
  }

  // Check for subdomain match
  const domainParts = domain.split(".");
  for (let i = 0; i < domainParts.length - 1; i++) {
    const subDomain = domainParts.slice(i).join(".");
    if (trackerDatabase[subDomain]) {
      return trackerDatabase[subDomain];
    }
  }

  // Check custom rules
  if (settings.customRules[domain]) {
    return settings.customRules[domain];
  }

  return false;
}

// Update statistics when a tracker is blocked
function updateStats(tracker) {
  stats.totalBlocked++;

  if (!stats.trackers[tracker.name]) {
    stats.trackers[tracker.name] = 1;
  } else {
    stats.trackers[tracker.name]++;
  }

  // Save stats to storage
  chrome.storage.local.set({ stats });
}

// Main request handler
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // Skip if extension is disabled
    if (!settings.enabled) return { cancel: false };

    // Extract domain from the URL
    const domain = extractDomain(details.url);
    const tracker = isTracker(domain);

    // If it's a tracker and should be blocked
    if (tracker && tracker.block) {
      // Update statistics
      updateStats(tracker);

      // Show notification if enabled
      if (settings.showNotifications) {
        chrome.tabs.get(details.tabId, (tab) => {
          if (chrome.runtime.lastError) return;

          const pageDomain = extractDomain(tab.url);
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icons/icon48.png",
            title: "Tracker Blocked",
            message: `Blocked ${tracker.name} tracker on ${pageDomain}`,
          });
        });
      }

      // Block the request
      return { cancel: true };
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
