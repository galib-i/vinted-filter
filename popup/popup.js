document.addEventListener("DOMContentLoaded", () => {
  const negativeBrandsTextarea = document.getElementById("negativeBrands");
  const enablePartialMatchingCheckbox = document.getElementById(
    "enablePartialMatching"
  );
  const hideWardrobeSpotlightCheckbox = document.getElementById(
    "hideWardrobeSpotlight"
  );
  const showItemTitlesCheckbox = document.getElementById("showItemTitles");
  const STORAGE_KEYS = [
    "negativeBrands",
    "enablePartialMatching",
    "hideWardrobeSpotlight",
    "showItemTitles",
  ];

  chrome.storage.sync.get(STORAGE_KEYS, (result) => {
    negativeBrandsTextarea.value = result.negativeBrands || "";
    enablePartialMatchingCheckbox.checked = !!result.enablePartialMatching;
    hideWardrobeSpotlightCheckbox.checked = !!result.hideWardrobeSpotlight;
    showItemTitlesCheckbox.checked = !!result.showItemTitles;
  });

  const cleanBrands = (input) =>
    input
      .trim()
      .replace(/\s+/g, " ") // Multiple spaces
      .replace(/\s+,/g, ",") // Space before comma
      .replace(/,+/g, ",") //Multiple commas to single comma
      .replace(/^,|,$/g, ""); // Remove leading/trailing commas

  const saveSettings = () => {
    negativeBrandsTextarea.value = cleanBrands(negativeBrandsTextarea.value);

    chrome.storage.sync.set(
      {
        negativeBrands: negativeBrandsTextarea.value,
        enablePartialMatching: enablePartialMatchingCheckbox.checked,
        hideWardrobeSpotlight: hideWardrobeSpotlightCheckbox.checked,
        showItemTitles: showItemTitlesCheckbox.checked,
      },
      () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "reapplyFilter" });
          }
        });
      }
    );
  };

  negativeBrandsTextarea.addEventListener("blur", (e) => {
    if (e.target === negativeBrandsTextarea) saveSettings();
  });

  negativeBrandsTextarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter") e.preventDefault();
  });

  enablePartialMatchingCheckbox.addEventListener("change", saveSettings);
  hideWardrobeSpotlightCheckbox.addEventListener("change", saveSettings);
  showItemTitlesCheckbox.addEventListener("change", saveSettings);
});
