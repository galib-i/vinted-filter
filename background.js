const manifest = chrome.runtime.getManifest();
const allowedHosts = manifest.host_permissions || [];

const cleanHosts = allowedHosts.map((host) => host.replace("/*", ""));

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url) return;

  const isAllowedSite = cleanHosts.some((host) => tab.url.startsWith(host));

  if (isAllowedSite) {
    chrome.action.enable(tabId);
  } else {
    chrome.action.disable(tabId);
  }
});
