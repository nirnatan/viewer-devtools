(function () {
    'use strict';

    function sendMessageToActionScript(msg, sender, sendResponse) {
        var listener = function (evt) {
            sendResponse(evt.detail);
        };

        document.addEventListener('Editor_Response', listener);

        document.dispatchEvent(new CustomEvent('Editor_Command', {detail: msg}));
    }

    var injected = false;
    chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
        if (!injected) {
            injectScripts(function () {
                sendMessageToActionScript(msg, sender, sendResponse);
            });
            injected = true;
            return true;
        }

        sendMessageToActionScript(msg, sender, sendResponse);
    });

    function injectScripts(callback) {
        var injectedScripts = ['scripts/contentActions.js', 'scripts/utils/jsonUtils.js'];
        var loadedScripts = 0;
        injectedScripts.forEach(function (script) {
            var s = document.createElement('script');
            s.src = chrome.extension.getURL(script);
            document.body.appendChild(s);
            s.onload = function () {
                s.parentNode.removeChild(s);
                if (++loadedScripts === injectedScripts.length) {
                    callback();
                }
            };
        });
    }
}());