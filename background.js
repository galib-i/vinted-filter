const manifest = chrome.runtime.getManifest();
const allowedHosts = manifest.host_permissions || [];
const cleanHosts = allowedHosts.map((h) => h.replace("/*", ""));

function updateActionForTab(tabId, url) {
  const isAllowed = !!url && cleanHosts.some((h) => url.startsWith(h));
  if (isAllowed) chrome.action.enable(tabId);
  else chrome.action.disable(tabId);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = changeInfo.url || tab?.url || "";
  updateActionForTab(tabId, url);
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) =>
    updateActionForTab(tab.id, tab.url),
  );
});

chrome.tabs.query({}, (tabs) =>
  tabs.forEach((t) => updateActionForTab(t.id, t.url)),
);
