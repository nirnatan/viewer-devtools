/* global _ */
(() => {
  const s = document.createElement('script');
  s.src = chrome.extension.getURL('editorHelper.js');
  document.body.appendChild(s);
  s.onload = () => {
    s.parentNode.removeChild(s);
  };
})();
