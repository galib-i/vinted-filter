const BRAND_SELECTORS = '.new-item-box__description';

const ITEM_CONTAINER_SELECTORS = '.feed-grid__item, .item-view-items__item';
const WARDROBE_SPOTLIGHT_SELECTOR = '.feed-grid__item.feed-grid__item--full-row';

function filterNegativeBrands() {
  chrome.storage.sync.get(['negativeBrands', 'enablePartialMatching'], ({ negativeBrands, enablePartialMatching }) => {
    // Reset all existing filters
    document.querySelectorAll(ITEM_CONTAINER_SELECTORS).forEach(itemContainer => {
      itemContainer.style.display = '';
    });

    if (!negativeBrands) return;

    const negativeBrandList = negativeBrands
      .split(',')
      .map(b => b.trim().toLowerCase())
      .filter(Boolean);

    document.querySelectorAll(BRAND_SELECTORS).forEach(brandNode => {
      const brandName = brandNode.textContent.trim().toLowerCase();
      if (!isNegativeBrand(brandName, negativeBrandList, enablePartialMatching)) return;

      const itemContainer = brandNode.closest(ITEM_CONTAINER_SELECTORS);
      if (itemContainer) {
        itemContainer.style.display = 'none';
      }
    });
  });
}

function isNegativeBrand(brandName, negativeBrandList, enablePartialMatching) {
  return negativeBrandList.some(negativeBrand =>
    enablePartialMatching
      ? brandName.includes(negativeBrand)
      : brandName === negativeBrand
  );
}

function hideWardrobeSpotlight() {
  chrome.storage.sync.get(['hideWardrobeSpotlight'], ({ hideWardrobeSpotlight }) => {
    if (!hideWardrobeSpotlight) return;

    document.querySelectorAll(WARDROBE_SPOTLIGHT_SELECTOR).forEach(el => {
      el.style.display = 'none';
    });
  }
  );
}

function showItemTitles() {
  chrome.storage.sync.get(['showItemTitles'], ({ showItemTitles }) => {
    if (!showItemTitles) return;

    document.querySelectorAll('.feed-grid__item-content, .item-view-items__item').forEach(item => {
      const img = item.querySelector('img[alt]');
      if (img && img.alt) {
        const altText = img.alt;
        const parts = altText.split(',');
        const truncatedText = parts[0];

        // Find the .title-content element
        const titleContentElem = item.querySelector('.title-content');
        if (titleContentElem) {
          // Avoid inserting multiple times
          if (!item.querySelector('.vinted-filter-title')) {
            const titleElem = document.createElement('div');
            titleElem.textContent = truncatedText;
            titleElem.className = 'vinted-filter-title';

            // Optionally copy classes from the price element if needed
            const priceElem = titleContentElem.querySelector('[data-testid$="--price-text"]');
            if (priceElem) {
              priceElem.classList.forEach(cls => {
                titleElem.classList.add(cls);
              });
            }

            // Insert before .title-content
            titleContentElem.parentNode.insertBefore(titleElem, titleContentElem);
          }
        }
      }
    });
  });
}

chrome.runtime.onMessage.addListener(message => {
  if (message.action === "reapplyFilter") {
    filterNegativeBrands();
    showItemTitles();
  }
});

function observeDynamicContent() {
  const observer = new MutationObserver(mutationsList => {
    if (mutationsList.some(m => m.addedNodes.length > 0)) {
      filterNegativeBrands();
      showItemTitles();
      hideWardrobeSpotlight();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

window.addEventListener('load', () => {
  filterNegativeBrands();
  showItemTitles();
  hideWardrobeSpotlight();
  observeDynamicContent();
});