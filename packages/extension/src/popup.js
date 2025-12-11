(function () {
  function setStatus(el, msg, type) {
    el.textContent = msg || '';
    el.className = 'status' + (type ? ' ' + type : '');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('memoText');
    const saveBtn = document.getElementById('saveBtn');
    const viewAllBtn = document.getElementById('viewAllBtn');
    const statusEl = document.getElementById('status');

    saveBtn.addEventListener('click', async () => {
      const text = (textarea.value || '').trim();
      if (!text) {
        setStatus(statusEl, 'Please enter memo text', 'error');
        textarea.focus();
        return;
      }

      saveBtn.disabled = true;
      setStatus(statusEl, 'Saving...', 'info');

      try {
        // Uses IndexedDB helpers aligned with the web app DB schema
        const memo = await window.VoiceMemosDB.createMemo(text);
        setStatus(statusEl, 'Saved ✓', 'success');
        textarea.value = '';
        setTimeout(() => setStatus(statusEl, ''), 1500);
      } catch (e) {
        console.error(e);
        setStatus(statusEl, 'Failed to save memo', 'error');
      } finally {
        saveBtn.disabled = false;
      }
    });

    viewAllBtn.addEventListener('click', () => {
      const url =
        typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL
          ? chrome.runtime.getURL('src/notes.html')
          : 'src/notes.html';

      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url });
      } else {
        window.open(url, '_blank');
      }
    });
  });
})();
