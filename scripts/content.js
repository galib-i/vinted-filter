const BRAND_SELECTORS = '[data-testid$="--description-title"]'; // Use testID to speficially target titles only, sizes and condition use the same selector

const ITEM_CONTAINER_SELECTORS = ".feed-grid__item, .item-view-items__item";
const WARDROBE_SPOTLIGHT_SELECTOR =
  ".feed-grid__item.feed-grid__item--full-row";

let settings = {
  negativeBrands: "",
  enablePartialMatching: false,
  hideWardrobeSpotlight: false,
  showItemTitles: false,
};

chrome.storage.sync.get(Object.keys(settings), (result) => {
  Object.assign(settings, result);
  applyRules();
  observeDynamicContent();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    for (let [key, { newValue }] of Object.entries(changes)) {
      settings[key] = newValue;
    }
    applyRules(); // Re-run when user changes settings
  }
});

function filterNegativeBrands() {
  // Reset all negative brands
  document
    .querySelectorAll(ITEM_CONTAINER_SELECTORS)
    .forEach((itemContainer) => {
      itemContainer.style.display = "";
    });

  if (!settings.negativeBrands) return;

  const negativeBrandList = settings.negativeBrands
    .split(",")
    .map((b) => b.trim().toLowerCase())
    .filter(Boolean);

  document.querySelectorAll(BRAND_SELECTORS).forEach((brandNode) => {
    const brandName = brandNode.textContent.trim().toLowerCase();
    if (
      !isNegativeBrand(
        brandName,
        negativeBrandList,
        settings.enablePartialMatching,
      )
    )
      return;

    const itemContainer = brandNode.closest(ITEM_CONTAINER_SELECTORS);
    if (itemContainer) {
      itemContainer.style.display = "none";
    }
  });
}

function isNegativeBrand(brandName, negativeBrandList, enablePartialMatching) {
  return negativeBrandList.some((negativeBrand) =>
    enablePartialMatching
      ? negativeBrand.length >= 2 && brandName.includes(negativeBrand)
      : brandName === negativeBrand,
  );
}

function hideWardrobeSpotlight() {
  if (!settings.hideWardrobeSpotlight) return;

  document.querySelectorAll(WARDROBE_SPOTLIGHT_SELECTOR).forEach((el) => {
    el.style.display = "none";
  });
}

function showItemTitles() {
  if (!settings.showItemTitles) {
    document
      .querySelectorAll(".vinted-filter-title")
      .forEach((el) => el.remove());
    return;
  }

  document
    .querySelectorAll(".feed-grid__item-content, .item-view-items__item")
    .forEach((item) => {
      const img = item.querySelector("img[alt]");
      if (img && img.alt) {
        const altText = img.alt;
        const parts = altText.split(",");
        const truncatedText = parts[0];

        // Find the .title-content element
        const titleContentElem = item.querySelector(".title-content");
        if (titleContentElem) {
          // Avoid inserting multiple times
          if (!item.querySelector(".vinted-filter-title")) {
            const titleElem = document.createElement("div");
            titleElem.textContent = truncatedText;
            titleElem.className = "vinted-filter-title";

            // Optionally copy classes from the price element if needed
            const priceElem = titleContentElem.querySelector(
              '[data-testid$="--price-text"]',
            );
            if (priceElem) {
              priceElem.classList.forEach((cls) => {
                titleElem.classList.add(cls);
              });
            }

            // Insert before .title-content
            titleContentElem.parentNode.insertBefore(
              titleElem,
              titleContentElem,
            );
          }
        }
      }
    });
}

function observeDynamicContent() {
  const observer = new MutationObserver((mutationsList) => {
    if (mutationsList.some((m) => m.addedNodes.length > 0)) {
      applyRules();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function applyRules() {
  filterNegativeBrands();
  showItemTitles();
  hideWardrobeSpotlight();
}

window.addEventListener("load", () => {
  applyRules();
  observeDynamicContent();
});
