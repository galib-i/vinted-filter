document.addEventListener('DOMContentLoaded', () => {
  const negativeBrandsTextarea = document.getElementById('negativeBrands');
  const enablePartialMatchingCheckbox = document.getElementById('enablePartialMatching');
  const saveButton = document.getElementById('save');
  const STORAGE_KEYS = ['negativeBrands', 'enablePartialMatching'];

  // Load saved data
  chrome.storage.sync.get(STORAGE_KEYS, result => {
    negativeBrandsTextarea.value = result.negativeBrands || '';
    enablePartialMatchingCheckbox.checked = !!result.enablePartialMatching;
  });

  const saveSettings = (showFeedback = false) => {
    chrome.storage.sync.set({negativeBrands: negativeBrandsTextarea.value, enablePartialMatching: enablePartialMatchingCheckbox.checked}, () => {
      if (showFeedback) showSaveFeedback();
    });
  };

  const showSaveFeedback = () => {
    saveButton.textContent = 'Saved!';
    setTimeout(() => saveButton.textContent = 'Save', 3000);
  };

  // Save on events
  negativeBrandsTextarea.addEventListener('input', saveSettings);
  enablePartialMatchingCheckbox.addEventListener('change', saveSettings);
  saveButton.addEventListener('click', () => saveSettings(true));
  window.addEventListener('beforeunload', saveSettings);
});
