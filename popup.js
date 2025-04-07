/** @format */

// Popup script for Privacy Guardian extension

// DOM elements
const enableToggle = document.getElementById("enableToggle");
const notificationsToggle = document.getElementById("notificationsToggle");
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
  notificationsToggle.checked = settings.showNotifications;

  // Update custom rules list
  updateRulesList();
}

// Update UI based on stats
function updateStatsUI() {
  totalBlockedElement.textContent = stats.totalBlocked;

  // Clear tracker list
  trackerListElement.innerHTML = "";

  // If no trackers blocked yet
  if (stats.totalBlocked === 0) {
    trackerListElement.innerHTML =
      '<div class="no-trackers">No trackers blocked yet</div>';
    return;
  }

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
    trackerListElement.appendChild(trackerItem);
  });
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
