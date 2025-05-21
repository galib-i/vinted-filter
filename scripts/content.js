const BRAND_SELECTORS = [
  '.feed-grid__item .new-item-box__description',
  '.new-item-box__description'
].join(',');

const ITEM_CONTAINER_SELECTORS = 'article, .feed-grid__item, .item-box, .item-view-items__item';
const WARDROBE_SPOTLIGHT_SELECTOR = '.feed-grid__item.feed-grid__item--full-row';

function hideWardrobeSpotlight() {
  chrome.storage.sync.get(['hideWardrobeSpotlight'], ({ hideWardrobeSpotlight }) => {
    if (!hideWardrobeSpotlight) return;

    document.querySelectorAll(WARDROBE_SPOTLIGHT_SELECTOR).forEach(el => {
      el.style.display = 'none';
    });
  }
  );
}

function filterNegativeBrands() {
  chrome.storage.sync.get(['negativeBrands', 'enablePartialMatching'], ({ negativeBrands, enablePartialMatching }) => {
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
        // itemContainer.classList.add('vinted-filter-hidden');
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

chrome.runtime.onMessage.addListener(message => {
  if (message.action === "reapplyFilter") {
    filterNegativeBrands();
    hideWardrobeSpotlight();
  }
});

function observeDynamicContent() {
  const observer = new MutationObserver(mutationsList => {
    if (mutationsList.some(m => m.addedNodes.length > 0)) {
      filterNegativeBrands();
      hideWardrobeSpotlight(); // <-- Add this line
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

window.addEventListener('load', () => {
  filterNegativeBrands();
  hideWardrobeSpotlight();
  observeDynamicContent();
});