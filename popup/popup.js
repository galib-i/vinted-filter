document.addEventListener('DOMContentLoaded', () => {
  const negativeBrandsTextarea = document.getElementById('negativeBrands');
  const enablePartialMatchingCheckbox = document.getElementById('enablePartialMatching');
  const STORAGE_KEYS = ['negativeBrands', 'enablePartialMatching'];

  // Load saved data
  chrome.storage.sync.get(STORAGE_KEYS, result => {
    negativeBrandsTextarea.value = result.negativeBrands || '';
    enablePartialMatchingCheckbox.checked = !!result.enablePartialMatching;
  });

  const printIndividualBrands = (brandsString) => {
    const brandsArray = brandsString
      .split(',')
      .map(b => b.trim())
      .filter(b => b.length > 0);
    console.log('Individual brands:', brandsArray.join(', '));
  };

  const saveSettings = () => {
    // Clean up the input
    let cleanedBrands = negativeBrandsTextarea.value.trim();
    cleanedBrands = cleanedBrands.replace(/\s+/g, ' '); // Multiple spaces
    cleanedBrands = cleanedBrands.replace(/,+/g, ','); // Multiple commas
    cleanedBrands = cleanedBrands.replace(/\s+,/g, ','); // Trailing spaces before commas
    cleanedBrands = cleanedBrands.replace(/^,|,$/g, ''); // Leading/trailing commas
    negativeBrandsTextarea.value = cleanedBrands;

    printIndividualBrands(cleanedBrands);

    chrome.storage.sync.set({
      negativeBrands: cleanedBrands,
      enablePartialMatching: enablePartialMatchingCheckbox.checked
    });
  };

  negativeBrandsTextarea.addEventListener('blur', (e) => {
    if (e.target === negativeBrandsTextarea) saveSettings();
  });

  negativeBrandsTextarea.addEventListener('keydown', e => {
    if (e.key === 'Enter') e.preventDefault();
  });

  enablePartialMatchingCheckbox.addEventListener('change', () => saveSettings());
});
