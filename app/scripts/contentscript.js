(function() {
  'use strict';

  function sendMessageToActionScript(msg, sender, sendResponse) {
    var listener = function(evt) {
      sendResponse(evt.detail);
    };

    document.addEventListener('Editor_Response', listener);

    document.dispatchEvent(new CustomEvent('Editor_Command', { detail: msg }));
  }

  let injected = false;
  chrome.extension.onMessage.addListener((msg, sender, sendResponse) => {
    if (!injected) {
      injectScripts(['scripts/contentActions.js', 'scripts/utils/jsonUtils.js'], function() {
        sendMessageToActionScript(msg, sender, sendResponse);
      });
      injected = true;
    }

    sendMessageToActionScript(msg, sender, sendResponse);
  });

  if (window.location.host + window.location.pathname === 'users.wix.com/wix-users/login/form') {
    injectScripts(['scripts/logInGoogle.js']);
  }

  function injectScripts(injectedScripts, callback) {
    var loadedScripts = 0;
    injectedScripts.forEach(function(script) {
      var s = document.createElement('script');
      s.src = chrome.extension.getURL(script);
      document.body.appendChild(s);
      s.onload = function() {
        s.parentNode.removeChild(s);
        if (++loadedScripts === injectedScripts.length && callback) {
          callback();
        }
      };
    });
  }
}());
