
document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("request-list");
  const exportBtn = document.getElementById("export-btn");
  const exportSelect = document.getElementById("export-select");

  chrome.storage.local.get(["requests"], (data) => {
    list.innerHTML = "";
    exportSelect.innerHTML = "<option value='all'>Export All</option>";
    
    for (const domain in data.requests) {
      let domainItem = document.createElement("li");
      domainItem.textContent = domain;
      domainItem.className = "domain";
      domainItem.onclick = () => domainItem.nextSibling.classList.toggle("hidden");
      list.appendChild(domainItem);
      
      let routesList = document.createElement("ul");
      routesList.className = "hidden";
      
      let domainOption = document.createElement("option");
      domainOption.value = domain;
      domainOption.textContent = `Export ${domain}`;
      exportSelect.appendChild(domainOption);
      
      for (const route in data.requests[domain]) {
        let routeItem = document.createElement("li");
        routeItem.textContent = route;
        routeItem.className = "route";
        routeItem.onclick = () => routeItem.nextSibling.classList.toggle("hidden");
        routesList.appendChild(routeItem);
        
        let requestList = document.createElement("ul");
        requestList.className = "hidden";
        
        let routeOption = document.createElement("option");
        routeOption.value = `${domain}|${route}`;
        routeOption.textContent = `Export ${domain} - ${route}`;
        exportSelect.appendChild(routeOption);
        
        data.requests[domain][route].forEach((req, index) => {
          let reqItem = document.createElement("li");
          reqItem.className = "request";
          reqItem.textContent = `${req.method} - ${req.time}`;
          reqItem.onclick = () => alert(`Payload: ${req.payload}\nHeaders: ${JSON.stringify(req.headers)}`);
          requestList.appendChild(reqItem);
        });
        routesList.appendChild(requestList);
      }
      list.appendChild(routesList);
    }
  });

  exportBtn.onclick = () => {
    chrome.storage.local.get(["requests"], (data) => {
      let selection = exportSelect.value;
      let exportData = {};
      
      if (selection === "all") {
        exportData = data.requests;
      } else if (data.requests[selection]) {
        exportData[selection] = data.requests[selection];
      } else {
        let [domain, route] = selection.split("|");
        if (data.requests[domain] && data.requests[domain][route]) {
          exportData[domain] = { [route]: data.requests[domain][route] };
        }
      }
      
      if (Object.keys(exportData).length === 0) {
        alert("No matching data found for export.");
        return;
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "network_requests.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  document.getElementById("clear-requests-btn").addEventListener("click", () => {
    chrome.storage.local.set({ requests: {} }, () => {
      alert("All requests have been cleared!");
      document.getElementById("request-list").innerHTML = ""; // Clear UI instantly
    });
  });
  
});
