import split from 'lodash/split';
import compact from 'lodash/compact';
import last from 'lodash/last';

(function contentActions() {
  const usernameRegex = new RegExp('=([^|]*)');
  const events = {
    getCurrentUsername() {
      const cookie = document.cookie;
      const wixClient = cookie.split('; ').find(v => v && v.indexOf && v.indexOf('wixClient') === 0);

      return wixClient && usernameRegex.exec(wixClient)[1];
    },
    getCurrentVersions() {
      const editorBaseParts = compact(split(window.editorBase, '/'));
      const santaBaseParts = compact(split(window.santaBase, '/'));
      return {
        santa: santaBaseParts.includes('localhost') ? 'localhost' : last(santaBaseParts),
        editor: editorBaseParts.includes('localhost') ? 'localhost' : last(editorBaseParts),
      };
    },
  };

  function handleEvent(evt) {
    const result = events[evt.detail.type](evt.detail.params);
    if (result !== undefined) {
      document.dispatchEvent(new CustomEvent('Editor_Response', { detail: result }));
    }
  }

  document.addEventListener('Editor_Command', handleEvent);
  document.dispatchEvent(new CustomEvent('scriptReady'));
}());
