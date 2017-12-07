(function contentActions() {
  const usernameRegex = new RegExp('=([^|]*)');
  const events = {
    getCurrentUsername() {
      const cookie = document.cookie;
      const wixClient = cookie.split('; ').find(v => v && v.indexOf && v.indexOf('wixClient') === 0);

      return wixClient && usernameRegex.exec(wixClient)[1];
    },
    getCurrentVersions() {
      const editorBaseParts = _(window.editorBase).split('/').compact();
      const santaBaseParts = _(window.santaBase).split('/').compact();
      return {
        santa: santaBaseParts.includes('localhost') ? 'localhost' : santaBaseParts.last(),
        editor: editorBaseParts.includes('localhost') ? 'localhost' : editorBaseParts.last(),
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
