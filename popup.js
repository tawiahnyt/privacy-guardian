/** @format */

// Popup script for Privacy Guardian extension

// DOM elements
const enableToggle = document.getElementById("enableToggle");
const blockTrackersToggle = document.getElementById("blockTrackersToggle");
const blockMaliciousToggle = document.getElementById("blockMaliciousToggle");
const notificationsToggle = document.getElementById("notificationsToggle");
const heuristicToggle = document.getElementById("heuristicToggle");
const sensitivitySlider = document.getElementById("sensitivitySlider");
const sensitivityValue = document.getElementById("sensitivityValue");
const totalBlockedElement = document.getElementById("totalBlocked");
const trackerListElement = document.getElementById("trackerList");
const resetStatsButton = document.getElementById("resetStats");
const domainInput = document.getElementById("domainInput");
const addRuleButton = document.getElementById("addRule");
const ruleListElement = document.getElementById("ruleList");
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

// Settings and stats
let settings = {
  enabled: true,
  showNotifications: false,
  customRules: {},
};

let stats = {
  totalBlocked: 0,
  trackers: {},
};

// Load settings and stats when popup opens
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  loadStats();
  setupEventListeners();
});

// Load settings from background script
function loadSettings() {
  chrome.runtime.sendMessage({ action: "getSettings" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    if (response && response.settings) {
      settings = response.settings;
      updateSettingsUI();
    }
  });
}

// Load stats from background script
function loadStats() {
  chrome.runtime.sendMessage({ action: "getStats" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    if (response && response.stats) {
      stats = response.stats;
      updateStatsUI();
    }
  });
}

// Update UI based on settings
function updateSettingsUI() {
  enableToggle.checked = settings.enabled;
  blockTrackersToggle.checked = settings.blockTrackers !== false; // Default to true if not set
  blockMaliciousToggle.checked = settings.blockMalicious !== false; // Default to true if not set
  notificationsToggle.checked = settings.showNotifications;
  heuristicToggle.checked = settings.heuristicDetection !== false; // Default to true if not set

  // Set sensitivity slider value
  if (settings.heuristicSensitivity !== undefined) {
    sensitivitySlider.value = settings.heuristicSensitivity;
    sensitivityValue.textContent = settings.heuristicSensitivity;
  }

  // Update custom rules list
  updateRulesList();
}

// Update UI based on stats
function updateStatsUI() {
  totalBlockedElement.textContent = stats.totalBlocked;

  // Clear tracker list
  trackerListElement.innerHTML = "";

  // If no content blocked yet
  if (stats.totalBlocked === 0) {
    trackerListElement.innerHTML =
      '<div class="no-trackers">No content blocked yet</div>';
    return;
  }

  // Create category summary section
  if (stats.categories) {
    const categorySummary = document.createElement("div");
    categorySummary.className = "category-summary";
    categorySummary.innerHTML = "<h3>Blocked by Category</h3>";

    const categoryList = document.createElement("div");
    categoryList.className = "category-list";

    // Add each category to the summary
    Object.entries(stats.categories).forEach(([category, count]) => {
      if (count > 0) {
        const categoryItem = document.createElement("div");
        categoryItem.className = "category-item";
        categoryItem.innerHTML = `
          <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
          <span>${count}</span>
        `;
        categoryList.appendChild(categoryItem);
      }
    });

    categorySummary.appendChild(categoryList);
    trackerListElement.appendChild(categorySummary);
  }

  // Add trackers section
  if (Object.keys(stats.trackers).length > 0) {
    const trackersSection = document.createElement("div");
    trackersSection.className = "trackers-section";
    trackersSection.innerHTML = "<h3>Trackers</h3>";

    const trackersList = document.createElement("div");
    trackersList.className = "trackers-list";

    // Add each tracker to the list
    const trackers = Object.entries(stats.trackers);

    // Sort by count (highest first)
    trackers.sort((a, b) => b[1] - a[1]);

    trackers.forEach(([name, count]) => {
      const trackerItem = document.createElement("div");
      trackerItem.className = "tracker-item";
      trackerItem.innerHTML = `
        <span>${name}</span>
        <span>${count}</span>
      `;
      trackersList.appendChild(trackerItem);
    });

    trackersSection.appendChild(trackersList);
    trackerListElement.appendChild(trackersSection);
  }

  // Add malicious URLs section
  if (stats.malicious && Object.keys(stats.malicious).length > 0) {
    const maliciousSection = document.createElement("div");
    maliciousSection.className = "malicious-section";
    maliciousSection.innerHTML = "<h3>Malicious URLs</h3>";

    const maliciousList = document.createElement("div");
    maliciousList.className = "malicious-list";

    // Add each malicious URL to the list
    const maliciousItems = Object.entries(stats.malicious);

    // Sort by count (highest first)
    maliciousItems.sort((a, b) => b[1] - a[1]);

    maliciousItems.forEach(([name, count]) => {
      const maliciousItem = document.createElement("div");
      maliciousItem.className = "malicious-item";
      maliciousItem.innerHTML = `
        <span>${name}</span>
        <span>${count}</span>
      `;
      maliciousList.appendChild(maliciousItem);
    });

    maliciousSection.appendChild(maliciousList);
    trackerListElement.appendChild(maliciousSection);
  }
}

// Update custom rules list
function updateRulesList() {
  // Clear rules list
  ruleListElement.innerHTML = "";

  // Add each custom rule to the list
  const rules = Object.entries(settings.customRules);

  if (rules.length === 0) {
    ruleListElement.innerHTML =
      '<div class="no-trackers">No custom rules added</div>';
    return;
  }

  rules.forEach(([domain, rule]) => {
    const ruleItem = document.createElement("div");
    ruleItem.className = "rule-item";
    ruleItem.innerHTML = `
      <span>${domain}</span>
      <button class="remove-rule" data-domain="${domain}">Remove</button>
    `;
    ruleListElement.appendChild(ruleItem);
  });

  // Add event listeners to remove buttons
  document.querySelectorAll(".remove-rule").forEach((button) => {
    button.addEventListener("click", () => {
      const domain = button.getAttribute("data-domain");
      removeCustomRule(domain);
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Enable/disable extension
  enableToggle.addEventListener("change", () => {
    settings.enabled = enableToggle.checked;
    updateSettings();
  });

  // Enable/disable tracker blocking
  blockTrackersToggle.addEventListener("change", () => {
    settings.blockTrackers = blockTrackersToggle.checked;
    updateSettings();
  });

  // Enable/disable malicious URL blocking
  blockMaliciousToggle.addEventListener("change", () => {
    settings.blockMalicious = blockMaliciousToggle.checked;
    updateSettings();
  });

  // Show/hide notifications
  notificationsToggle.addEventListener("change", () => {
    settings.showNotifications = notificationsToggle.checked;
    updateSettings();
  });

  // Reset stats
  resetStatsButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "resetStats" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }

      if (response && response.success) {
        stats = {
          totalBlocked: 0,
          trackers: {},
        };
        updateStatsUI();
      }
    });
  });

  // Add custom rule
  addRuleButton.addEventListener("click", () => {
    const domain = domainInput.value.trim();
    if (domain) {
      addCustomRule(domain);
      domainInput.value = "";
    }
  });

  // Tab switching
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.getAttribute("data-tab");

      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Update active content
      tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === `${tabName}Tab`) {
          content.classList.add("active");
        }
      });
    });
  });
}

// Update settings in background script
function updateSettings() {
  chrome.runtime.sendMessage(
    {
      action: "updateSettings",
      settings: settings,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
    }
  );
}

// Add custom rule
function addCustomRule(domain) {
  chrome.runtime.sendMessage(
    {
      action: "addCustomRule",
      domain: domain,
      name: domain,
      block: true,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }

      if (response && response.success) {
        // Update local settings
        settings.customRules[domain] = {
          name: domain,
          block: true,
        };
        updateRulesList();
      }
    }
  );
}

// Remove custom rule
function removeCustomRule(domain) {
  chrome.runtime.sendMessage(
    {
      action: "removeCustomRule",
      domain: domain,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }

      if (response && response.success) {
        // Update local settings
        delete settings.customRules[domain];
        updateRulesList();
      }
    }
  );
}

// Heuristic detection toggle
heuristicToggle.addEventListener("change", () => {
  settings.heuristicDetection = heuristicToggle.checked;
  saveSettings();
});

// Sensitivity slider
sensitivitySlider.addEventListener("input", () => {
  sensitivityValue.textContent = sensitivitySlider.value;
});

sensitivitySlider.addEventListener("change", () => {
  settings.heuristicSensitivity = parseInt(sensitivitySlider.value);
  saveSettings();
});
