let requestsData = {};
let whitelist = [];
let maxRequests = 500;
let autoClear = 24;
let currentTheme = "dark";

// Load user settings from storage
function loadSettings() {
  chrome.storage.sync.get(["whitelist", "maxRequests", "autoClear", "theme"], (settings) => {
    whitelist = settings.whitelist || [];
    maxRequests = settings.maxRequests ?? 500;
    autoClear = settings.autoClear ?? 24;
    currentTheme = settings.theme || "dark";

    console.log("Settings Loaded:", { whitelist, maxRequests, autoClear, currentTheme });

    setupAutoClear();
  });
}


// **Whitelist Handling**
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    if (changes.whitelist) whitelist = changes.whitelist.newValue || [];
    if (changes.maxRequests) maxRequests = changes.maxRequests.newValue || 500;
    if (changes.autoClear) autoClear = changes.autoClear.newValue || 24;
    if (changes.theme) currentTheme = changes.theme.newValue || "dark";

    console.log("Updated settings:", { whitelist, maxRequests, autoClear, currentTheme });
    setupAutoClear();
  }
});

// **Auto-Clear Logs**
function setupAutoClear() {
  if (!chrome.alarms) return;

  chrome.alarms.clear("autoClearAlarm", () => {
    chrome.alarms.create("autoClearAlarm", { periodInMinutes: autoClear * 60 });

    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === "autoClearAlarm") {
        console.log("Auto-clearing old requests...");
        chrome.storage.local.get(["requests"], (data) => {
          let requests = data.requests || {};
          let cutoffTime = Date.now() - autoClear * 60 * 60 * 1000;

          for (const domain in requests) {
            for (const path in requests[domain]) {
              requests[domain][path] = requests[domain][path].filter(
                (req) => new Date(req.time).getTime() > cutoffTime
              );
            }
          }
          chrome.storage.local.set({ requests });
        });
      }
    });
  });
}

// **Capture Request Body**
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    const url = new URL(details.url);
    const domain = url.hostname;
    const path = url.pathname;

    // Ignore whitelisted domains
    if (whitelist.includes(domain)) {
      console.log(`Ignored request from whitelisted domain: ${domain}`);
      return;
    }

    chrome.storage.local.get(["requests"], (data) => {
      requestsData = data.requests || {};

      if (!requestsData[domain]) {
        requestsData[domain] = {};
      }
      if (!requestsData[domain][path]) {
        requestsData[domain][path] = [];
      }

      let payload = "N/A";
      if (details.requestBody && details.requestBody.raw) {
        let decoder = new TextDecoder("utf-8");
        payload = decoder.decode(details.requestBody.raw[0].bytes);
      } else if (details.requestBody) {
        payload = JSON.stringify(details.requestBody);
      }

      requestsData[domain][path].push({
        method: details.method,
        payload: payload,
        headers: {}, // Initialize empty object to store headers later
        time: new Date().toLocaleString(),
      });

      // **Enforce Max Stored Requests**
      if (requestsData[domain][path].length > maxRequests) {
        requestsData[domain][path] = requestsData[domain][path].slice(-maxRequests);
      }

      chrome.storage.local.set({ requests: requestsData });
    });
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
);

// **Capture Request Headers**
chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    chrome.storage.local.get(["requests"], (data) => {
      requestsData = data.requests || {};
      const url = new URL(details.url);
      const domain = url.hostname;
      const path = url.pathname;

      if (requestsData[domain] && requestsData[domain][path]) {
        let lastRequest = requestsData[domain][path].slice(-1)[0];
        if (lastRequest) {
          lastRequest.headers = details.requestHeaders;
        }
        chrome.storage.local.set({ requests: requestsData });
      }
    });
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders", "extraHeaders"]
);

// Load settings on startup
loadSettings();
