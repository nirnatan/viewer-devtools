(function contentScript() {
  let injectedScriptPromise;
  const injectScript = (script, callback) => {
    if (injectedScriptPromise) {
      return injectedScriptPromise;
    }

    injectedScriptPromise = new Promise(res => {
      const s = document.createElement('script');
      s.src = chrome.extension.getURL(script);
      document.body.appendChild(s);
      s.onload = () => {
        s.parentNode.removeChild(s);
        res();
      };
    });

    return injectedScriptPromise;
  };

  const sendMessageToActionScript = (msg, sender, sendResponse) => {
    const listener = (evt) => {
      sendResponse(evt.detail);
    };

    document.addEventListener('Editor_Response', listener);

    document.dispatchEvent(new CustomEvent('Editor_Command', { detail: msg }));
  };

  chrome.extension.onMessage.addListener((msg, sender, sendResponse) => {
    injectScript('contentActions.js')
      .then(() => {
        sendMessageToActionScript(msg, sender, sendResponse);
      });

    return true;
  });
}());
