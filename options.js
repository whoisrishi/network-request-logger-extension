document.addEventListener("DOMContentLoaded", () => {
  const whitelistInput = document.getElementById("whitelist");
  const maxRequestsInput = document.getElementById("max-requests");
  const autoClearInput = document.getElementById("auto-clear");
  const saveButton = document.getElementById("save-settings");
  const whitelistContainer = document.getElementById("whitelist-container");

  // Ensure all elements exist
  if (!whitelistInput || !maxRequestsInput || !autoClearInput || !saveButton || !whitelistContainer) {
    console.error("One or more required elements are missing from options.html.");
    return;
  }

  // Load saved settings safely
  function loadSettings() {
    chrome.storage.sync.get(["whitelist", "maxRequests", "autoClear"], (data) => {
      const whitelist = data.whitelist || [];
      maxRequestsInput.value = data.maxRequests ?? 1500;
      autoClearInput.value = data.autoClear ?? 1;
      updateWhitelistUI(whitelist);
    });
  }

  // Update UI for whitelist
  function updateWhitelistUI(whitelist) {
    whitelistContainer.innerHTML = "";
    whitelist.forEach((domain) => {
      let domainItem = document.createElement("div");
      domainItem.innerHTML = `${domain} <button class="remove-domain" data-domain="${domain}">X</button>`;
      whitelistContainer.appendChild(domainItem);
    });
  }

  // Save max requests and auto clear settings
  saveButton.addEventListener("click", () => {
    const maxRequests = parseInt(maxRequestsInput.value, 10);
    const autoClear = parseInt(autoClearInput.value, 10);

    chrome.storage.sync.set({ maxRequests, autoClear }, () => {
      alert("Settings Saved!");
    });
  });

  // Add domain to whitelist
  whitelistInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      let newDomain = whitelistInput.value.trim();
      if (!newDomain) return;

      chrome.storage.sync.get(["whitelist"], (data) => {
        let whitelist = data.whitelist || [];
        if (!whitelist.includes(newDomain)) {
          whitelist.push(newDomain);
          chrome.storage.sync.set({ whitelist }, () => {
            whitelistInput.value = "";
            updateWhitelistUI(whitelist);
          });
        }
      });
    }
  });

  // Remove domain from whitelist
  whitelistContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-domain")) {
      let domainToRemove = e.target.getAttribute("data-domain");

      chrome.storage.sync.get(["whitelist"], (data) => {
        let whitelist = data.whitelist.filter((domain) => domain !== domainToRemove);
        chrome.storage.sync.set({ whitelist }, () => {
          updateWhitelistUI(whitelist);
        });
      });
    }
  });

  // Initial load of settings
  loadSettings();
});
