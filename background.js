chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.match(/^https:\/\/www\.vinted\.co\.uk\//)) {
    chrome.action.enable(tabId);
  } else {
    chrome.action.disable(tabId);
  }
});
